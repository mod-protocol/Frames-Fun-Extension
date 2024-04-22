"use client";

import { Frame } from "frames.js";
import { FarcasterAuthUI } from "@xframes/ui/farcaster-auth-ui";
import { useFarcasterIdentity } from "../hooks/use-farcaster-identity";
import {
  FarcasterFrameContext,
  FarcasterSigner,
  FarcasterSignerState,
  FrameActionBodyPayload,
  FrameState,
  OnMintArgs,
  OnTransactionArgs,
  OnTransactionFunc,
} from "@frames.js/render";
import { useFrame } from "@frames.js/render/use-frame";
// import { FrameImageNext } from "@frames.js/render/next";
import { useMeasure } from "@uidotdev/usehooks";
import { useCallback, useEffect } from "react";
import { useAccount, useChainId, useConfig } from "wagmi";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { sendTransaction, switchChain } from "wagmi/actions";

import { useFarcasterIdentityRemote } from "@/hooks/use-farcaster-identity-remote";

import { FrameUI } from "./frame-ui";
import { Toast, useToast } from "./toast";

type FrameRenderProps = {
  frameId?: string;
  url: string;
  frame?: Frame;
  theme?: "light" | "dark";
  dangerousSkipSigning?: boolean;
  frameContext: FarcasterFrameContext;
};

function FrameComponent({
  state,
  frameId,
}: {
  state: FrameState;
  frameId?: string;
}) {
  const [ref, { width, height }] = useMeasure();

  useEffect(() => {
    parent?.postMessage(
      { type: "FRAME_RENDERED", frameId, data: { width, height } },
      "*"
    );
  }, [width, height]);

  const handleReset = () => {
    if (state.homeframeUrl) {
      state.fetchFrame({ url: state.homeframeUrl || "", method: "GET" });
    }
  };

  const url = state.homeframeUrl;
  const frameResult = state.frame?.status === "done" ? state.frame.frame : null;
  const buttons = frameResult?.frame.buttons;

  return (
    <div ref={ref} className="flex flex-col dark:bg-white/20 rounded-md">
      <FrameUI frameState={state} onReset={handleReset} />
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
          <div className="text-xs opacity-75">Powered by x.frames</div>
        </div>
        {buttons?.some((b) => b.action === "tx" || b.action === "mint") && (
          <div className="flex justify-end px-4 py-2 border-l border-gray-200 dark:border-black">
            <ConnectButton />
          </div>
        )}
      </div>
    </div>
  );
}

interface FrameRenderComponentProps {
  frameState: FrameState;
  signerState: FarcasterSignerState;
  frameId?: string;
}

function FrameRenderComponent({
  frameState,
  signerState,
  frameId,
}: FrameRenderComponentProps) {
  return (
    <div className="relative">
      <FrameComponent state={frameState} frameId={frameId} />
      {signerState?.signer?.status === "pending_approval" &&
        signerState?.signer?.signerApprovalUrl && (
          <div className="absolute top-0 left-0 bottom-0 right-0 flex items-center justify-center">
            <div className="max-w-72 bg-white px-4 py-6 rounded-md shadow-xl backdrop-blur-sm">
              <FarcasterAuthUI authState={signerState} />
            </div>
          </div>
        )}
    </div>
  );
}

interface FrameRenderWithIdentityProps extends FrameRenderProps {
  connectedAddress: `0x${string}` | undefined;
  onTransaction: OnTransactionFunc;
  onMint: (t: OnMintArgs) => void;
}

const useFrameDefaults = {
  frameGetProxy: "/api/v1/frames",
  frameActionProxy: "/api/v1/frames",
  specification: "farcaster" as const,
};

function FrameRenderWithRemoteIdentity({
  frameId,
  ...props
}: FrameRenderWithIdentityProps) {
  const signerState = useFarcasterIdentityRemote({ frameId: frameId! });
  const frameState = useFrame<FarcasterSigner | null, FrameActionBodyPayload>({
    ...useFrameDefaults,
    ...props,
    homeframeUrl: props.url,
    signerState,
  });
  return (
    <FrameRenderComponent
      frameState={frameState}
      signerState={signerState}
      frameId={frameId}
    />
  );
}

function FrameRenderWithLocalIdentity(props: FrameRenderWithIdentityProps) {
  const signerState = useFarcasterIdentity();
  const frameState = useFrame<FarcasterSigner | null, FrameActionBodyPayload>({
    ...useFrameDefaults,
    ...props,
    homeframeUrl: props.url,
    signerState,
  });
  return (
    <FrameRenderComponent frameState={frameState} signerState={signerState} />
  );
}

export default function FrameRender(props: FrameRenderProps) {
  const currentChainId = useChainId();
  const config = useConfig();
  const account = useAccount();
  const { openConnectModal } = useConnectModal();
  const [toast, setToast] = useToast();

  const onTransaction = useCallback(
    async ({ transactionData }: OnTransactionArgs) => {
      const { params, chainId, method } = transactionData;
      if (!chainId.startsWith("eip155:")) {
        alert(`Unrecognized chainId ${chainId}`);
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
        const transactionParams = {
          to: params.to,
          data: params.data,
          value: params.value ? BigInt(params.value) : undefined,
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
    [account.address, currentChainId, config, openConnectModal]
  );

  const onMint = useCallback(
    (t: OnMintArgs) => {
      if (!confirm(`Mint ${t.target}?`)) {
        return;
      }

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
          alert(e);
          console.error(e);
        });
    },
    [onTransaction, account.address, openConnectModal]
  );

  const componentProps = {
    ...props,
    onTransaction,
    onMint,
    connectedAddress: account.address,
  };

  const Component = props.frameId
    ? FrameRenderWithRemoteIdentity
    : FrameRenderWithLocalIdentity;

  return (
    <div className="relative">
      <Component {...componentProps} />
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center">
        <Toast toast={toast} />
      </div>
    </div>
  );
}
