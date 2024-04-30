# x.frames extension

This is a [Plasmo extension](https://docs.plasmo.com/) project for the x.frames browser extension.

## Getting Started

First, create your own `.env` file in the `apps/extension` directory (you can use the `.env.sample` file included for inspiration), you should set the following environment variables:

- `PLASMO_PUBLIC_PROXY_URL` - points to the frames server, if you're running it locally chances are you don't need to set it - unless it runs on a different port than `3000`

If you're running your own server(s), you can set environment variables for specific APIs/endpoints:

- `PLASMO_PUBLIC_SIGNER_PROXY_URL` - signer API endpoint - defaults to `${PLASMO_PUBLIC_PROXY_URL}/api/v1/signer`
- `PLASMO_PUBLIC_FRAMES_PROXY_URL` - frames API endpoint - defaults to `${PLASMO_PUBLIC_PROXY_URL}/api/v1/frames`
- `PLASMO_FRAME_EMBED_PROXY_URL` - embed endpoint - defaults to `${PLASMO_PUBLIC_PROXY_URL}/embed`

Then you can run the extension dev server from the monorepo root directory:

```bash
pnpm dev --filter=extension
```

Open your browser and load the appropriate development build. You can find it it `/apps/extension/build/chrome-mv3-dev`.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following in the monorepo root:

```bash
pnpm build --filter extension
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
