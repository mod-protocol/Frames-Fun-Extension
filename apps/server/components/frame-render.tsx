"use client";

import { sendMessageToExtension } from "@xframes/shared/messaging";
import { usePostHog } from "posthog-js/react";
import { FarcasterAuthUI } from "@xframes/ui/farcaster-auth-ui";
import { useFarcasterIdentity } from "../hooks/use-farcaster-identity";
import {
  fallbackFrameContext,
  OnMintArgs,
  OnTransactionArgs,
  OnTransactionFunc,
} from "@frames.js/render";
import { useAnonymousIdentity } from "@frames.js/render/identity/anonymous";
import { useMeasure } from "@uidotdev/usehooks";
import { useCallback, useEffect } from "react";
import { useAccount, useChainId, useConfig } from "wagmi";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { sendTransaction, switchChain } from "wagmi/actions";

import { useFarcasterIdentityRemote } from "@/hooks/use-farcaster-identity-remote";

import { FrameUI, type OnButtonPressFn } from "./frame-ui";
import { Toast, useToast } from "./toast";
import { useWalletModalMeasure } from "./use-wallet-modal-measure";
import { encodePacked, hexToBytes } from "viem";
import {
  useFrame_unstable as useFrame,
  UnstableUseFrameReturnValue,
} from "@frames.js/render/unstable-use-frame";
import { isPartialFrame } from "@frames.js/render/helpers";
import { FarcasterSignerInstance } from "@frames.js/render/identity/farcaster";

type FrameRenderProps = {
  /**
   * If frame id is provided then the frame is rendered as part of the page
   */
  frameId?: string;
  /**
   * URL of the frame
   */
  url: string;
};

export const MODAL_PADDING = 50;

function FrameComponent({
  state,
  frameId,
}: {
  state: UnstableUseFrameReturnValue;
  frameId?: string;
}) {
  const posthog = usePostHog();
  const [ref, { width, height }] = useMeasure();
  const [modalSize] = useWalletModalMeasure();
  const modalW = modalSize?.width != null ? modalSize.width + MODAL_PADDING : 0;
  const modalH =
    modalSize?.height != null ? modalSize.height + MODAL_PADDING : 0;
  const w = Math.max(modalW, width || 0);
  const h = Math.max(modalH || 0, height || 0);

  useEffect(() => {
    if (window.parent) {
      sendMessageToExtension({
        type: "frame_rendered",
        frameId,
        data: { width: w, height: h },
      });
    }
  }, [w, h, frameId]);

  const handleReset = () => {
    if (state.homeframeUrl) {
      state.fetchFrame({ url: state.homeframeUrl || "", method: "GET" });
    }
  };

  const trackButtonPress: OnButtonPressFn = ({ button, index, url }) => {
    sendMessageToExtension({
      type: "frame_button_press",
      buttonIndex: index,
      frameUrl: url,
    });

    posthog.capture("frame_button_press", {
      label: button.label,
      action: button.action,
      target: button.target,
      post_url: "post_url" in button ? button.post_url : undefined,
      index,
      frame_url: url,
    });
  };

  const url = state.homeframeUrl;
  const frameResult =
    state.currentFrameStackItem?.status === "done"
      ? state.currentFrameStackItem.frameResult
      : null;
  const buttons = frameResult?.frame.buttons;
  const showConnectButton = buttons?.some(
    (b) => b.action === "tx" || b.action === "mint"
  );

  return (
    <div ref={ref} className="flex flex-col dark:bg-white/20 rounded-md">
      <FrameUI
        frameState={state}
        onButtonPress={trackButtonPress}
        onReset={handleReset}
      />
      <div className="flex gap-2 p-2">
        <div className="flex flex-row flex-1 flex-wrap gap-x-4 items-center justify-between p-2 text-sm text-gray-500 dark:text-gray-300">
          {url && (
            <a
              href={url}
              target="_blank"
              className="flex hover:underline"
              rel="noopener noreferrer nofollow"
              onClick={(e) => e.stopPropagation()}
            >
              {new URL(url).host}
            </a>
          )}
        </div>
        {showConnectButton && (
          <div className="flex justify-end px-4 py-2 border-l border-gray-200 dark:border-black">
            <ConnectButton />
          </div>
        )}
      </div>
    </div>
  );
}

interface FrameRenderComponentProps {
  frameState: UnstableUseFrameReturnValue;
  frameId?: string;
  farcasterSigner: FarcasterSignerInstance | null;
}

function FrameRenderComponent({
  frameState,
  frameId,
  farcasterSigner,
}: FrameRenderComponentProps) {
  return (
    <div className="relative">
      <FrameComponent state={frameState} frameId={frameId} />
      {!!farcasterSigner &&
        farcasterSigner.signer?.status === "pending_approval" && (
          <div className="absolute top-0 left-0 bottom-0 right-0 flex items-center justify-center">
            <div className="max-w-72 bg-white px-4 py-6 rounded-md shadow-xl backdrop-blur-sm">
              <FarcasterAuthUI
                signer={farcasterSigner.signer}
                logout={farcasterSigner.logout}
              />
            </div>
          </div>
        )}
    </div>
  );
}

type FrameRenderedInIframeProps = Omit<FrameRenderProps, "frameId"> & {
  frameId: string;
  connectedAddress: `0x${string}` | undefined;
  onTransaction: OnTransactionFunc;
  onMint: (t: OnMintArgs) => void;
};

const useFrameDefaults = {
  frameGetProxy: "/api/v1/frames",
  frameActionProxy: "/api/v1/frames",
};

/**
 * Frame rendered in iframe
 */
function FrameRenderedInIframe({
  frameId,
  connectedAddress,
  url,
  onMint,
  onTransaction,
}: FrameRenderedInIframeProps) {
  const farcasterSigner = useFarcasterIdentityRemote({ frameId });
  const anonymousSigner = useAnonymousIdentity();
  const frameState = useFrame({
    ...useFrameDefaults,
    homeframeUrl: url,
    async resolveAddress() {
      return connectedAddress ?? null;
    },
    resolveSigner({ parseResult }) {
      // prefer farcaster signer if signer is approved
      if (farcasterSigner.signer?.status === "approved") {
        if (
          parseResult.farcaster.status === "success" ||
          isPartialFrame(parseResult.farcaster)
        ) {
          return farcasterSigner.withContext(fallbackFrameContext);
        }
      }

      // prefer farcaster and valid frame
      if (parseResult.farcaster.status === "success") {
        return farcasterSigner.withContext(fallbackFrameContext);
      }

      if (parseResult.openframes.status === "success") {
        return anonymousSigner.withContext(fallbackFrameContext);
      }

      // prefer partial farcaster frame
      if (isPartialFrame(parseResult.farcaster)) {
        return farcasterSigner.withContext(fallbackFrameContext);
      }

      if (isPartialFrame(parseResult.openframes)) {
        return anonymousSigner.withContext({});
      }

      // prefer farcaster
      return farcasterSigner.withContext(fallbackFrameContext);
    },
    onMint,
    onTransaction,
  });

  return (
    <FrameRenderComponent
      frameState={frameState}
      farcasterSigner={
        frameState.signerState?.specification === "farcaster"
          ? farcasterSigner
          : null
      }
      frameId={frameId}
    />
  );
}

type FrameRenderedOnPageProps = Omit<FrameRenderProps, "frameId"> & {
  connectedAddress: `0x${string}` | undefined;
  onTransaction: OnTransactionFunc;
  onMint: (t: OnMintArgs) => void;
};

/**
 * Frame rendered as part of the page
 */
function FrameRenderedOnPage({
  connectedAddress,
  url,
}: FrameRenderedOnPageProps) {
  const farcasterSigner = useFarcasterIdentity();
  const anonymousSigner = useAnonymousIdentity();
  const frameState = useFrame({
    ...useFrameDefaults,
    homeframeUrl: url,
    async resolveAddress() {
      return connectedAddress ?? null;
    },
    resolveSigner({ parseResult }) {
      // prefer farcaster signer if signer is approved
      if (farcasterSigner.signer?.status === "approved") {
        if (
          parseResult.farcaster.status === "success" ||
          isPartialFrame(parseResult.farcaster)
        ) {
          return farcasterSigner.withContext(fallbackFrameContext);
        }
      }

      // prefer farcaster and valid frame
      if (parseResult.farcaster.status === "success") {
        return farcasterSigner.withContext(fallbackFrameContext);
      }

      if (parseResult.openframes.status === "success") {
        return anonymousSigner.withContext({});
      }

      // prefer partial farcaster frame
      if (isPartialFrame(parseResult.farcaster)) {
        return farcasterSigner.withContext(fallbackFrameContext);
      }

      if (isPartialFrame(parseResult.openframes)) {
        return anonymousSigner.withContext({});
      }

      // prefer farcaster
      return farcasterSigner.withContext(fallbackFrameContext);
    },
  });

  return (
    <FrameRenderComponent
      frameState={frameState}
      farcasterSigner={
        frameState.signerState?.specification === "farcaster"
          ? farcasterSigner
          : null
      }
    />
  );
}

export default function FrameRender({ frameId, url }: FrameRenderProps) {
  const currentChainId = useChainId();
  const config = useConfig();
  const account = useAccount();
  const { openConnectModal } = useConnectModal();
  const [toast, setToast] = useToast();

  const onTransaction = useCallback(
    async ({ transactionData }: OnTransactionArgs) => {
      const { params, chainId, method } = transactionData;
      if (!chainId.startsWith("eip155:")) {
        setToast(`Unrecognized chainId ${chainId}`, "error");
        return null;
      }

      if (!account.address) {
        openConnectModal?.();
        return null;
      }

      const requestedChainId = parseInt(chainId.split("eip155:")[1]!);

      if (currentChainId !== requestedChainId) {
        setToast("Switching chain");
        await switchChain(config, {
          chainId: requestedChainId,
        });
      }

      try {
        const fcClientId = process.env.NEXT_PUBLIC_FARCASTER_CLIENT_ID
          ? parseInt(process.env.NEXT_PUBLIC_FARCASTER_CLIENT_ID)
          : null;
        if (
          fcClientId &&
          transactionData.attribution !== false &&
          params.data &&
          hexToBytes(params.data).length > 4
        ) {
          const attribution = encodePacked(
            ["bytes1", "uint32"],
            ["0xfc", fcClientId]
          );
          params.data = (params.data + attribution.slice(2)) as `0x${string}`;
        }

        const transactionParams = {
          to: params.to,
          data: params.data,
          value: BigInt(params.value || 0),
        };
        console.debug("sending transaction", transactionParams);
        setToast("Continue in your wallet to complete the transaction");
        const transactionId = await sendTransaction(config, transactionParams);
        setToast("Transaction sent", "success");
        return transactionId;
      } catch (error) {
        console.error(error);
        const e = error as any;
        setToast(e.details || e.shortMessage || e.message, "error");
        return null;
      }
    },
    [account.address, currentChainId, config, openConnectModal, setToast]
  );

  const onMint = useCallback(
    (t: OnMintArgs) => {
      // if (!confirm(`Mint ${t.target}?`)) {
      //   return;
      // }

      if (!account.address) {
        openConnectModal?.();
        return;
      }

      const searchParams = new URLSearchParams({
        target: t.target,
        taker: account.address,
      });

      fetch(`/api/v1/mint?${searchParams.toString()}`)
        .then(async (res) => {
          if (!res.ok) {
            const json = await res.json();
            throw new Error(json.message);
          }
          return await res.json();
        })
        .then((json) => {
          onTransaction({ ...t, transactionData: json.data });
        })
        .catch((e) => {
          setToast(e.message, "error");
          console.error(e);
        });
    },
    [onTransaction, account.address, openConnectModal]
  );

  return (
    <div className="relative">
      {frameId ? (
        <FrameRenderedInIframe
          connectedAddress={account.address}
          onMint={onMint}
          onTransaction={onTransaction}
          frameId={frameId}
          url={url}
        />
      ) : (
        <FrameRenderedOnPage
          connectedAddress={account.address}
          onMint={onMint}
          onTransaction={onTransaction}
          url={url}
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center">
        <Toast toast={toast} />
      </div>
    </div>
  );
}
