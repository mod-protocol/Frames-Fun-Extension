"use client";

import {
  sendMessageToExtension,
  consumeMessageFromServer,
} from "@xframes/shared/messaging";
import { useCallback, useEffect, useState } from "react";
import { LOCAL_STORAGE_KEYS } from "../constants";
import {
  FarcasterSigner,
  FarcasterSignerState,
  FrameActionBodyPayload,
  signFrameAction,
} from "@frames.js/render";
import { usePostHog } from "posthog-js/react";

export function useFarcasterIdentityRemote({
  frameId,
}: {
  frameId: string;
}): FarcasterSignerState {
  const posthog = usePostHog();
  const [isLoading, setLoading] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<FarcasterSigner | null>(
    getSignerFromLocalStorage()
  );

  // console.log("REMOTE IDENTITY!", farcasterUser);
  const handleLogout = useCallback(() => {
    posthog.reset();
    setFarcasterUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
  }, [setFarcasterUser]);

  const handleLogin = useCallback(
    (user: FarcasterSigner) => {
      setFarcasterUser(user);
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.FARCASTER_USER,
        JSON.stringify(user)
      );
      setLoading(false);
    },
    [setFarcasterUser, setLoading]
  );

  useEffect(() => {
    return consumeMessageFromServer("signed_out", () => handleLogout());
  }, [handleLogout]);

  useEffect(() => {
    return consumeMessageFromServer("signed_in", (message) => {
      posthog.identify(message.signer.uid);
      handleLogin(message.signer);
    });
  }, [handleLogin]);

  function logout() {
    sendMessageToExtension({ type: "embed_sign_out", frameId });
    handleLogout();
  }

  function getSignerFromLocalStorage() {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem(
        LOCAL_STORAGE_KEYS.FARCASTER_USER
      );
      if (storedData) {
        const user: FarcasterSigner = JSON.parse(storedData);

        if (user.status === "pending_approval") {
          // Validate that deadline hasn't passed
          if (user.deadline && user.deadline < Math.floor(Date.now() / 1000)) {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
            return null;
          }
        }

        return user;
      }
      return null;
    }

    return null;
  }

  async function onSignerlessFramePress() {
    setLoading(true);
    sendMessageToExtension({ type: "embed_signerless_press", frameId });
  }

  return {
    signer: farcasterUser,
    hasSigner: !!farcasterUser?.privateKey,
    signFrameAction: async (x) => {
      const { body, searchParams } = (await signFrameAction(x)) as {
        body: FrameActionBodyPayload;
        searchParams: URLSearchParams;
      };
      return { body, searchParams };
    },
    isLoading: null,
    isLoadingSigner: isLoading,
    onSignerlessFramePress,
    logout,
  };
}
