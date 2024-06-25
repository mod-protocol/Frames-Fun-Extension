"use client";

import { useTheme } from "@/hooks/use-theme";

export function ThemeContainer({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return <div className={`${theme} w-full h-dvh flex`}>{children}</div>;
}
