export type Theme = "light" | "dark";

export function useTheme(): Theme {
  const darkMode =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = darkMode ? "dark" : "light";
  return theme;
}
