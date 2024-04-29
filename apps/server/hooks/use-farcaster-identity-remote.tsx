"use client";

import { useCallback, useEffect, useState } from "react";
import { LOCAL_STORAGE_KEYS } from "../constants";
import {
  FarcasterSigner,
  FarcasterSignerState,
  FrameActionBodyPayload,
  signFrameAction,
} from "@frames.js/render";
import {
  createMessageConsumer,
  sendServerMessage,
} from "@/messaging/send-message";

export function useFarcasterIdentityRemote({
  frameId,
}: {
  frameId: string;
}): FarcasterSignerState {
  const [isLoading, setLoading] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<FarcasterSigner | null>(
    getSignerFromLocalStorage()
  );

  // console.log("REMOTE IDENTITY!", farcasterUser);
  const handleLogout = useCallback(() => {
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

  useEffect(
    () => createMessageConsumer("SIGNER_LOGGED_OUT", () => handleLogout()),
    [handleLogout]
  );

  useEffect(
    () =>
      createMessageConsumer<FarcasterSigner>("SIGNER_LOGGED_IN", (d) => {
        const user = d.data!;
        handleLogin(user);
      }),
    [handleLogin]
  );

  function logout() {
    sendServerMessage({ type: "SIGNER_LOGOUT", frameId });
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
    sendServerMessage({ type: "SIGNER_LOGIN", frameId });
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
