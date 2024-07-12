"use client";

import { useTheme } from "@/hooks/use-theme";
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostHog } from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { WagmiProvider } from "wagmi";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  zora,
  anvil,
  baseSepolia,
  optimismSepolia,
  arbitrumSepolia,
  zoraSepolia,
  sepolia,
  scrollSepolia,
  liskSepolia,
} from "wagmi/chains";

const config = getDefaultConfig({
  appName: "Frames.fun extension proxy server",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID!,
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    zora,
    anvil,
    // sepolia testnets
    baseSepolia,
    optimismSepolia,
    arbitrumSepolia,
    zoraSepolia,
    sepolia,
    scrollSepolia,
    liskSepolia,
  ],
  ssr: true,
});

const queryClient = new QueryClient();
const posthog = new PostHog();

if (
  process.env.NEXT_PUBLIC_POSTHOG_API_HOST &&
  process.env.NEXT_PUBLIC_POSTHOG_API_KEY
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_API_HOST,
  });
}

export function Providers({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme?: "light" | "dark";
}) {
  const clientTheme = useTheme();
  const themeFunction =
    (theme || clientTheme) === "light" ? lightTheme : darkTheme;
  return (
    <PostHogProvider client={posthog}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={themeFunction({ borderRadius: "small" })}>
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PostHogProvider>
  );
}
