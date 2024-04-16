"use client";

import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
  appName: "x.frames proxy server",
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

export function Providers({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: "light" | "dark";
}) {
  const themeFunction = theme === "light" ? lightTheme : darkTheme;
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={themeFunction({ borderRadius: "small" })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
