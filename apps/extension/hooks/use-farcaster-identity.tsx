import { useEffect, useState } from "react"

import { signerProxyUrl } from "~constants"
// TODO - extract to a common lib
import { convertKeypairToHex, createKeypair } from "~utils/crypto"
import { fetchJson } from "~utils/fetch-json"

import { useSignerStorage } from "./use-signer-storage"

export interface FarcasterSignerState {
  signer?: FarcasterSigner | null
  hasSigner: boolean
  isLoadingSigner?: boolean
  onSignerlessFramePress: () => void
  logout?: () => void
}

export interface FarcasterSigner {
  /* the Farcaster signer private key */
  privateKey: string
  /* the Farcaster signer public key */
  publicKey: string
  // may be undefined if status is pending_approval
  fid?: number
  /** The status of the signer */
  status: "approved" | "pending_approval" | "impersonating"
  signature?: string
  deadline?: number
  signerApprovalUrl?: string
  token?: any
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
  requestFid: string
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

interface Options {
  enablePolling?: boolean
}

export function useFarcasterIdentity(options?: Options): FarcasterSignerState {
  const enablePolling = options?.enablePolling ?? false
  const [isLoading, setLoading] = useState<boolean>(false)
  const [signer, setSigner, { remove: removeSigner }] = useSignerStorage(null)

  async function logout() {
    removeSigner()
  }

  useEffect(() => {
    if (!signer || signer.status !== "pending_approval" || !enablePolling) {
      return
    }
    let intervalId: any

    const startPolling = () => {
      intervalId = setInterval(async () => {
        try {
          const result = await fetchSignedKeyRequest(signer.token)
          const user = {
            ...signer,
            ...result,
            fid: result.signedKeyRequest.userFid,
            status: "approved" as const
          }
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

      const user: FarcasterSigner = {
        ...authorizationBody,
        publicKey: keypairString.publicKey,
        deadline: deadline,
        token: signedKeyRequest.token,
        signerApprovalUrl: signedKeyRequest.deeplinkUrl,
        privateKey: keypairString.privateKey,
        status: "pending_approval"
      }
      setSigner(user)
    } catch (error) {
      console.error("API Call failed", error)
    }
  }

  return {
    signer,
    hasSigner: !!signer?.fid && !!signer.privateKey,
    onSignerlessFramePress,
    logout,
    isLoadingSigner: isLoading
  }
}
