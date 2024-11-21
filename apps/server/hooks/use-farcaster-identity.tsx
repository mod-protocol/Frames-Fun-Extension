"use client";

import { LOCAL_STORAGE_KEYS } from "../constants";
import { useFarcasterIdentity as useBaseFarcasterIdentity } from "@frames.js/render/identity/farcaster";

export function useFarcasterIdentity() {
  const signer = useBaseFarcasterIdentity({
    storageKey: LOCAL_STORAGE_KEYS.FARCASTER_USER,
    onMissingIdentity() {
      // @todo test if this works
      signer.onSignerlessFramePress();
    },
  });

  return signer;
}
