import type {
  FarcasterSigner as BaseFarcasterSigner,
  FarcasterSignerApproved as BaseFarcasterSignerApproved,
  FarcasterSignerPendingApproval as BaseFarcasterSignerPendingApproval,
} from "@frames.js/render";

export type UserID = `${string}-${string}-${string}-${string}-${string}`;

type FarcasterSignerApproved = BaseFarcasterSignerApproved & { uid: UserID };

type FarcasterSignerPendingApproval = BaseFarcasterSignerPendingApproval & {
  uid: UserID;
};

export type FarcasterSigner =
  | Exclude<BaseFarcasterSigner, { status: "approved" | "pending_approval" }>
  | FarcasterSignerApproved
  | FarcasterSignerPendingApproval;

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

export type MessagesToExtension =
  | MessageToServerFrameRendered
  | MessageToServerSignerSignOut
  | MessageToServerSignerlessPress;

type MessageFromServerSignerSignedIn = {
  type: "signed_in";
  signer: FarcasterSignerApproved;
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
