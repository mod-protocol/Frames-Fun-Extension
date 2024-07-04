export const baseProxyUrl =
  process.env.PLASMO_PUBLIC_PROXY_URL || "http://localhost:3000"
export const signerProxyUrl =
  process.env.PLASMO_PUBLIC_SIGNER_PROXY_URL || `${baseProxyUrl}/api/v1/signer`
export const framesProxyUrl =
  process.env.PLASMO_PUBLIC_FRAMES_PROXY_URL || `${baseProxyUrl}/api/v1/frames`
export const frameEmbedProxyUrl =
  process.env.PLASMO_FRAME_EMBED_PROXY_URL || `${baseProxyUrl}/embed`

export const FARCASTER_SIGNER_KEY =
  process.env.NODE_ENV === "production"
    ? "farcasterSigner"
    : "farcasterSignerDev"
