import { Storage } from "@plasmohq/storage"

import { FarcasterSigner } from "~hooks/use-farcaster-identity"

// TODO use secure storage with password protection
// const storage = new SecureStorage()
const storage = new Storage()

const get = async <T>(key: string): Promise<T | undefined> => {
  const value = await storage.get<T>(key)
  return value
}

const set = async <T>(key: string, value: T): Promise<void> => {
  await storage.set(key, value)
}

const remove = async (key: string): Promise<void> => {
  await storage.remove(key)
}

export const FARCASTER_SIGNER_KEY = "farcasterSigner"

export const loadSigner = async (): Promise<FarcasterSigner | null> => {
  const signer = await get<FarcasterSigner>(FARCASTER_SIGNER_KEY)
  if (!signer) {
    return null
  }
  if (signer.status === "pending_approval") {
    // Validate that deadline hasn't passed
    if (signer.deadline && signer.deadline < Math.floor(Date.now() / 1000)) {
      await removeSigner()
      return null
    }
  }
  return signer
}

export const saveSigner = async (signer: FarcasterSigner) => {
  await set(FARCASTER_SIGNER_KEY, signer)
}

export const removeSigner = async () => {
  await remove(FARCASTER_SIGNER_KEY)
}
