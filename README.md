# x.frames

x.frames is a browser extension for Google Chrome which allows you to interact with [frames](https://docs.farcaster.xyz/learn/what-is-farcaster/frames) posted on [x](https://www.x.com) (formerly Twitter).

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `extension`: a [Plasmo](https://www.plasmo.com/) extension
- `server`: a [Next.js](https://nextjs.org/) frames server the extension uses for rendering and interacting with frames
- `@xframes/ui`: a React component library shared by both `server` and `extension` applications
- `@xframes/eslint-config`: `eslint` configurations (includes `eslint-config-turbo` and `eslint-config-prettier`)
- `@xframes/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is primarily [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Trying

### Prerequisities

Make sure to set all the necessary environment variables for both the [server](/apps/server/README.md) and the [extension](/apps/extension/README.md).

### Build

To build all apps and packages, run the following command:

```
cd xframes
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd xframes
pnpm dev
```
