declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PLASMO_PUBLIC_POSTHOG_API_KEY?: string
      PLASMO_PUBLIC_POSTHOG_API_HOST?: string
      PLASMO_PUBLIC_PROXY_URL?: string
      PLASMO_PUBLIC_SIGNER_PROXY_URL?: string
      PLASMO_PUBLIC_FRAMES_PROXY_URL?: string
      PLASMO_FRAME_EMBED_PROXY_URL?: string
    }
  }
}

export {}
