import { useStorage } from "@plasmohq/storage/hook"

import { FARCASTER_SIGNER_KEY } from "~constants"

import { FarcasterSigner } from "./use-farcaster-identity"

export function useSignerStorage<T>(defaultValue: T) {
  return useStorage<FarcasterSigner | T>(FARCASTER_SIGNER_KEY, defaultValue)
}
