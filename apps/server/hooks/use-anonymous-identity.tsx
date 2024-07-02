import { SignerStateInstance } from "@frames.js/render";

export type AnonymousSignerState = SignerStateInstance<{}>;

export function useAnonymousIdentity(): AnonymousSignerState {
  return {
    hasSigner: true,
    onSignerlessFramePress() {
      return;
    },
    signer: {},
    async signFrameAction(actionContext) {
      const searchParams = new URLSearchParams({
        postType: actionContext.transactionId
          ? "post"
          : actionContext.frameButton.action,
        postUrl: actionContext.target ?? "",
        specification: "openframes",
      });

      const result = {
        body: {
          untrustedData: {
            ...actionContext,
            unixTimestamp: Date.now(),
          },
          clientProtocol: "anonymous@1.0",
        },
        searchParams,
      };

      return result;
    },
  };
}
