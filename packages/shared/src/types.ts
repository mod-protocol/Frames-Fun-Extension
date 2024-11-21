import type { FarcasterSigner } from "@frames.js/render/identity/farcaster";

type MessageToServerFrameRendered = {
  type: "frame_rendered";
  frameId: string | undefined;
  data: {
    height: number;
    width: number;
  };
};

type MessageToServerSignerSignOut = {
  type: "embed_sign_out";
  frameId: string;
};

type MessageToServerSignerlessPress = {
  type: "embed_signerless_press";
  frameId: string;
};

type MessageToServerFrameButtonPressed = {
  type: "frame_button_press";
  frameUrl: string;
  buttonIndex: number;
};

export type MessagesToExtension =
  | MessageToServerFrameRendered
  | MessageToServerSignerSignOut
  | MessageToServerSignerlessPress
  | MessageToServerFrameButtonPressed;

type MessageFromServerSignerSignedIn = {
  type: "signed_in";
  signer: Extract<FarcasterSigner, { status: "approved" }>;
};

type MessageFromServerSignerSignedOut = {
  type: "signed_out";
};

export type MessagesFromServer =
  | MessageFromServerSignerSignedIn
  | MessageFromServerSignerSignedOut;

export type AllMessages = MessagesToExtension | MessagesFromServer;

type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = Extract<
  T,
  Record<K, V>
>;

type MapDiscriminatedUnion<T extends Record<K, string>, K extends keyof T> = {
  [V in T[K]]: DiscriminateUnion<T, K, V>;
};

type MessagesByType = MapDiscriminatedUnion<AllMessages, "type">;

export type InferServerMessageFromType<TAction extends keyof MessagesByType> =
  MessagesByType[TAction];
