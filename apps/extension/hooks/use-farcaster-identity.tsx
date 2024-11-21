import { useFarcasterIdentity as useBaseFarcasterIdentity } from "@frames.js/render/identity/farcaster"
import { BROWSER_EXTENSION_INTERACTIONS } from "ffun-trpc-types/dist/lib/interactions"
import { useEffect } from "react"

import { FARCASTER_SIGNER_STORAGE_KEY, signerProxyUrl } from "~constants"
import { dispatchInteractionEvent } from "~services/events"
import { Storage } from "~services/storage"
// TODO - extract to a common lib
import { generateRandomUserId } from "~utils/crypto"
import { fetchJson } from "~utils/fetch-json"
import { posthogCapture } from "~utils/posthog-capture"

export interface UseFarcasterIdentityOptions {
  /**
   * @defaltValue true
   */
  enablePolling?: boolean
}

const storage = new Storage()

export function useFarcasterIdentity(options?: UseFarcasterIdentityOptions) {
  const farcasterSigner = useBaseFarcasterIdentity({
    enableIdentityPolling: options?.enablePolling,
    storageKey: FARCASTER_SIGNER_STORAGE_KEY,
    storage,
    signerUrl: signerProxyUrl,
    generateUserId: generateRandomUserId,
    onMissingIdentity() {},
    onLogInStart(identity) {
      posthogCapture({ action: "sign_in_start", uid: identity._id as string })
    },
    onLogIn(identity) {
      posthogCapture({ action: "sign_in", uid: identity._id as string })
    },
    onLogOut(identity) {
      posthogCapture({ action: "sign_out", uid: identity._id as string })
    },
    // @todo test if this works
    fetchFn: fetchJson
  })

  useEffect(() => {
    if (farcasterSigner.signer?.status === "approved") {
      dispatchInteractionEvent(
        BROWSER_EXTENSION_INTERACTIONS.user_installed_extension,
        farcasterSigner.signer.fid,
        farcasterSigner.signer.publicKey
      )
    }
  }, [farcasterSigner.signer])

  return farcasterSigner
}
