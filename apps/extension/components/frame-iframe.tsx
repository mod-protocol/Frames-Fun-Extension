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
    const handleFrameMessage = (e: MessageEvent) => {
      const { data: message } = e
      const { type, data } = message
      if (
        type !== "FRAME_RENDERED" ||
        message.frameId !== frameId ||
        !data.height ||
        !data.width
      ) {
        return
      }
      setAspectRatio(data.width / data.height)
    }

    window.addEventListener("message", handleFrameMessage)

    return () => {
      window.removeEventListener("message", handleFrameMessage)
    }
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
      // console.info("Sending logout message to iframe", iframe)
      iframe.postMessage({ type: "SIGNER_LOGGED_OUT" }, "*")
    } else if (signer?.status === "approved") {
      // console.info("Sending login message to iframe", iframe)
      iframe.postMessage({ type: "SIGNER_LOGGED_IN", data: signer }, "*")
    }
  }, [signer, iframeRef])

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // TODO check origin
      if (e.data.type === "SIGNER_LOGIN") {
        onSignerlessFramePress()
      } else if (e.data.type === "SIGNER_LOGOUT") {
        logout?.()
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [onSignerlessFramePress, logout])

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
