import type { Config } from "tailwindcss";
import defaultConfig from "@xframes/tailwind-config/tailwind.config";

const config: Config = {
  ...defaultConfig,
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
};
export default config;
