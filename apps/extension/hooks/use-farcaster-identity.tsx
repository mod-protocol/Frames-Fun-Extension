import type {
  FarcasterSigner as BaseFarcasterSigner,
  FarcasterSignerApproved as BaseFarcasterSignerApproved,
  FarcasterSignerPendingApproval as BaseFarcasterSignerPendingApproval
} from "@frames.js/render"
import { BROWSER_EXTENSION_INTERACTIONS } from "ffun-trpc-types/dist/lib/interactions"
import { useEffect, useRef, useState } from "react"

import { signerProxyUrl } from "~constants"
import { dispatchInteractionEvent } from "~services/events"
// TODO - extract to a common lib
import {
  convertKeypairToHex,
  createKeypair,
  generateRandomUserId,
  type UserID
} from "~utils/crypto"
import { fetchJson } from "~utils/fetch-json"
import { posthogCapture } from "~utils/posthog-capture"

import { useSignerStorage } from "./use-signer-storage"

type FarcasterSignerApproved = BaseFarcasterSignerApproved & { uid: UserID }

type FarcasterSignerPendingApproval = BaseFarcasterSignerPendingApproval & {
  uid: UserID
}

export type FarcasterSigner =
  | Exclude<BaseFarcasterSigner, { status: "approved" | "pending_approval" }>
  | FarcasterSignerApproved
  | FarcasterSignerPendingApproval

export interface FarcasterSignerState {
  signer?: FarcasterSigner | null
  hasSigner: boolean
  isLoadingSigner?: boolean
  onSignerlessFramePress: () => void
  logout?: () => void
}

interface SignedKeyRequest {
  deeplinkUrl: string
  isSponsored: boolean
  key: string
  requestFid: number
  state: string
  token: string
  userFid: number
  signerUser?: object
  signerUserMetadata?: object
}

interface SignedKeyRequestResponse {
  result: { signedKeyRequest: SignedKeyRequest }
}

async function fetchSignedKeyRequest(token: string) {
  const url = "https://api.warpcast.com/v2/signed-key-request?token=" + token
  const { result } = await fetchJson<SignedKeyRequestResponse>(url).then(
    (res) => res.json()
  )
  if (result.signedKeyRequest.state !== "completed") {
    throw new Error("hasnt succeeded yet")
  }
  return result
}

interface SignedKeyRequestBody {
  key: string
  signature: string
  requestFid: number
  deadline: number
  sponsorship?: {
    sponsorFid: number
    signature: string
  }
}

async function fetchCreateSignedKeyRequest(requestBody: SignedKeyRequestBody) {
  const url = "https://api.warpcast.com/v2/signed-key-requests"
  const { result } = await fetchJson<SignedKeyRequestResponse>(url, {
    method: "POST",
    body: JSON.stringify(requestBody)
  }).then((res) => res.json())
  return result
}

type SignerResponse = Omit<SignedKeyRequestBody, "key"> & {
  requestSigner: string
}

async function fetchCreateSignature(publicKey: string) {
  return fetchJson<SignerResponse>(signerProxyUrl, {
    method: "POST",
    body: JSON.stringify({ publicKey })
  }).then((res) => res.json())
}

export interface UseFarcasterIdentityOptions {
  enablePolling?: boolean
}

export function useFarcasterIdentity(
  options?: UseFarcasterIdentityOptions
): FarcasterSignerState {
  const enablePolling = options?.enablePolling ?? false
  const [isLoading, setLoading] = useState<boolean>(false)
  const [signer, setSigner, { remove: removeSigner }] = useSignerStorage(null)
  const isSignedInRef = useRef(!!signer)

  useEffect(() => {
    if (signer?.status === "approved") {
      dispatchInteractionEvent(
        BROWSER_EXTENSION_INTERACTIONS.user_installed_extension,
        signer.fid,
        signer.publicKey
      )
    }
  }, [signer])

  async function logout() {
    if (signer) {
      // this check is just to make typescript happy, this status is not used in the extension at all
      if (signer.status !== "impersonating") {
        posthogCapture({
          action: "sign_out",
          uid: signer.uid
        })
      }

      isSignedInRef.current = false
      removeSigner()
    }
  }

  useEffect(() => {
    if (!signer || signer.status !== "pending_approval" || !enablePolling) {
      return
    }
    let intervalId: NodeJS.Timeout

    const startPolling = () => {
      intervalId = setInterval(async () => {
        try {
          const result = await fetchSignedKeyRequest(signer.token)
          const user: FarcasterSigner = {
            ...signer,
            ...result,
            fid: result.signedKeyRequest.userFid,
            status: "approved" as const
          }

          posthogCapture({ action: "sign_in", uid: user.uid })

          await setSigner(user)
          clearInterval(intervalId)
        } catch (error) {
          console.info(error)
        }
      }, 2000)
    }

    const stopPolling = () => {
      clearInterval(intervalId)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        startPolling()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Start the polling when the effect runs.
    startPolling()

    // Cleanup function to remove the event listener and clear interval.
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      clearInterval(intervalId)
    }
  }, [signer])

  async function onSignerlessFramePress() {
    setLoading(true)
    await createAndStoreSigner()
    setLoading(false)
  }

  async function createAndStoreSigner() {
    try {
      const keypair = await createKeypair()
      const keypairString = convertKeypairToHex(keypair)
      const authorizationBody = await fetchCreateSignature(
        keypairString.publicKey
      )
      const { signature, requestFid, deadline, sponsorship } = authorizationBody
      const { signedKeyRequest } = await fetchCreateSignedKeyRequest({
        key: keypairString.publicKey,
        signature,
        requestFid,
        deadline,
        sponsorship
      })

      const user: FarcasterSignerPendingApproval = {
        ...authorizationBody,
        publicKey: keypairString.publicKey,
        deadline: deadline,
        token: signedKeyRequest.token,
        signerApprovalUrl: signedKeyRequest.deeplinkUrl,
        privateKey: keypairString.privateKey,
        status: "pending_approval" as const,
        uid: generateRandomUserId()
      }

      posthogCapture({ action: "sign_in_start", uid: user.uid })

      setSigner(user)
    } catch (error) {
      console.error("API Call failed", error)
    }
  }

  return {
    signer,
    hasSigner: !!signer && signer.status === "approved",
    onSignerlessFramePress,
    logout,
    isLoadingSigner: isLoading
  }
}
