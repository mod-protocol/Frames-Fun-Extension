declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_POSTHOG_API_KEY?: string;
      NEXT_PUBLIC_POSTHOG_API_HOST?: string;
      NEXT_PUBLIC_WALLETCONNECT_ID?: string;
      FARCASTER_DEVELOPER_MNEMONIC?: string;
      FARCASTER_DEVELOPER_FID?: string;
      FARCASTER_SPONSOR_MNEMONIC?: string;
      FARCASTER_HUB_GRPC_URL: string;
      FARCASTER_SPONSOR_FID?: string;
      DEV_FRAMES_FUN_API_KEY: string;
      DEV_FRAMES_FUN_API_TRPC_URL: string;
      NEXT_PUBLIC_FARCASTER_CLIENT_ID?: string;
    }
  }
}

export {};
