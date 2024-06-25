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
import { useTheme } from "@/hooks/use-theme";

const config = getDefaultConfig({
  appName: "Open Frames proxy server",
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

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
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
