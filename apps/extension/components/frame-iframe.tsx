import {
  consumeMessageFromEmbed,
  createMessageConsumer,
  sendMessageToEmbed
} from "@xframes/shared/messaging"
import { useCallback, useEffect, useRef, useState } from "react"

import { frameEmbedProxyUrl } from "~constants"
import { useFarcasterIdentity } from "~hooks/use-farcaster-identity"

import { LoadingIndicator } from "./loading-indicator"

type FrameIFrameProps = {
  url: string
  frameId: string
  theme: "dark" | "light"
}

export default function FrameIFrame({ url, frameId, theme }: FrameIFrameProps) {
  const { signer, onSignerlessFramePress, logout } = useFarcasterIdentity()
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(1.91 / 1)

  const iFrameUrl = new URL(frameEmbedProxyUrl)
  iFrameUrl.searchParams.append("url", url)
  iFrameUrl.searchParams.append("theme", theme)
  iFrameUrl.searchParams.append("frameId", frameId)

  useEffect(() => {
    return consumeMessageFromEmbed("frame_rendered", (message) => {
      if (message.frameId !== frameId) {
        return
      }

      const newAspectRatio = message.data.width / message.data.height

      if (Number.isNaN(newAspectRatio)) {
        // keep default aspect ratio
        return
      }

      setAspectRatio(message.data.width / message.data.height)
    })
  }, [frameId])

  useEffect(() => {
    const iframe = iframeRef.current?.contentWindow
    if (!iframe) {
      return
    }
    // TODO set origin
    // signer === null - not loaded yet
    // signer === undefined - loaded and "empty"
    if (signer === undefined) {
      sendMessageToEmbed(iframe, { type: "signed_out" })
    } else if (signer?.status === "approved") {
      sendMessageToEmbed(iframe, { type: "signed_in", signer })
    }
  }, [signer, iframeRef])

  useEffect(() => {
    return createMessageConsumer("embed_signerless_press", () => {
      onSignerlessFramePress()
    })
  }, [onSignerlessFramePress])

  useEffect(() => {
    return createMessageConsumer("embed_sign_out", () => {
      logout?.()
    })
  }, [logout])

  const handleLoad = useCallback(() => {
    setLoading(false)
  }, [setLoading])
  const handleError = useCallback(() => {
    setError(true)
    setLoading(false)
  }, [setLoading, setError])

  return (
    <div
      className="flex flex-col overflow-hidden items-center justify-center w-full text-gray-700 rounded-md bg-gray-100 border border-gray-200 dark:bg-black dark:border-white/20 dark:text-gray-200 aspect-video relative transition-all duration-150 ease-in-out"
      style={{
        aspectRatio
      }}>
      {error ? (
        <div>Error loading frame :(</div>
      ) : (
        loading && (
          <div className="flex gap-3 items-center">
            <LoadingIndicator />
          </div>
        )
      )}
      <div className="absolute top-0 left-0 bottom-0 right-0">
        <iframe
          ref={iframeRef}
          className="transition-all duration-150 ease-in-out w-full h-full"
          referrerPolicy="no-referrer"
          src={iFrameUrl.toString()}
          title="Frames.fun iframe"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    </div>
  )
}
