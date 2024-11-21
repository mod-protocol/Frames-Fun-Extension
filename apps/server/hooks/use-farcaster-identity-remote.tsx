"use client";

import {
  sendMessageToExtension,
  consumeMessageFromServer,
} from "@xframes/shared/messaging";
import { useEffect } from "react";
import { LOCAL_STORAGE_KEYS } from "../constants";
import { useFarcasterIdentity } from "@frames.js/render/identity/farcaster";
import { WebStorage } from "@frames.js/render/identity/storage";
import { usePostHog } from "posthog-js/react";

const identityStorage = new WebStorage();

/**
 * Identity hook used in iframes, it is automatically synced with parent window
 */
export function useFarcasterIdentityRemote({ frameId }: { frameId: string }) {
  const posthog = usePostHog();
  const signer = useFarcasterIdentity({
    storageKey: LOCAL_STORAGE_KEYS.FARCASTER_USER,
    storage: identityStorage,
    onMissingIdentity() {
      sendMessageToExtension({ type: "embed_signerless_press", frameId });
    },
    onLogOut(identity) {
      // this is called only if signer is not in init state
      // therefore even if you call signer.logout()
      // this function won't be called unless there is already some identity eiter in
      // pending, approved or impersonating state
      sendMessageToExtension({ type: "embed_sign_out", frameId });
      posthog.reset();
    },
  });

  useEffect(() => {
    // called from parent window when signer is undefined
    return consumeMessageFromServer("signed_out", () => {
      signer.logout();
    });
  }, [signer.logout]);

  useEffect(() => {
    // called from parent window when signer is approved
    return consumeMessageFromServer("signed_in", (message) => {
      posthog.identify(message.signer._id);
      identityStorage.set(
        LOCAL_STORAGE_KEYS.FARCASTER_USER,
        () => message.signer
      );
    });
  }, []);

  return signer;
}
