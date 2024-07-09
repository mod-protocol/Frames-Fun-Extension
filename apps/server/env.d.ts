declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_POSTHOG_API_KEY?: string;
      NEXT_PUBLIC_POSTHOG_API_HOST?: string;
    }
  }
}

export {};
