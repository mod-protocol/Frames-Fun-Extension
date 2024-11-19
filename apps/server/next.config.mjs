import { z } from "zod";

const envVariablesValidator = z
  .object({
    DEV_FRAMES_FUN_API_KEY: z.string().min(1),
    DEV_FRAMES_FUN_API_TRPC_URL: z.string().min(1).url(),
    FARCASTER_DEVELOPER_FID: z.string().optional(),
    FARCASTER_DEVELOPER_MNEMONIC: z.string().optional(),
    FARCASTER_SPONSOR_FID: z.string().optional(),
    FARCASTER_SPONSOR_MNEMONIC: z.string().optional(),
    FARCASTER_HUB_GRPC_URL: z.string(),
    NEXT_PUBLIC_POSTHOG_API_HOST: z.string().url().optional(),
    NEXT_PUBLIC_POSTHOG_API_KEY: z.string().optional(),
    NEXT_PUBLIC_WALLETCONNECT_ID: z.string().optional(),
    NEXT_PUBLIC_FARCASTER_CLIENT_ID: z.coerce.number().int().optional(),
  })
  .passthrough();

const envVariablesValidationResult = envVariablesValidator.safeParse(
  process.env
);

if (envVariablesValidationResult.success === false) {
  for (const issue of envVariablesValidationResult.error.issues) {
    console.error(
      `Environment variable ${issue.path.join(".")} error: ${issue.message}`
    );
  }

  process.exit(1);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Signer-Public-Key, X-FID",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "*",
        protocol: "http",
      },
      {
        hostname: "*",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
