# Frames.fun server

This is a [Next.js](https://nextjs.org/)-based server used by the [extension](/apps/extension/README.md) for rendering and interacting with [frames](https://docs.farcaster.xyz/learn/what-is-farcaster/frames)

## Demo

DEMO instance is currently running on vercel at [xframes.vercel.app](https://xframes.vercel.app)

## Getting Started

First, create your own `.env` file in the `apps/server` directory (you can use the `.env.sample` file included for inspiration), you must set the following environment variables:

- `FARCASTER_DEVELOPER_MNEMONIC` - mnemonic for the dev account
- `FARCASTER_DEVELOPER_FID` - FID for the dev account
- `NEXT_PUBLIC_WALLETCONNECT_ID` - your [WalletConnect](https://cloud.walletconnect.com/sign-in) Project ID

Then you can run the server from the monorepo root directory:

```
pnpm dev --filter=server
```
