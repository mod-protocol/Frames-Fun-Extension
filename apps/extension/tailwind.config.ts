import defaultConfig from "@xframes/tailwind-config/tailwind.config"
import type { Config } from "tailwindcss"

const config: Config = {
  ...defaultConfig,
  content: ["./**/*.{ts,tsx}"]
}
export default config
