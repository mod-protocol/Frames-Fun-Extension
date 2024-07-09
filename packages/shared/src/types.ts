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

/* export type ServerMessagePayloadFrameRendered = {
  type: "frame_rendered";
  frameId?: string;
  data: {
    height: number;
    width: number;
  };
};

export type ServerMessagePayloadSignerSignOut = {
  type: "sign_out";
  frameId: string;
};

export type ServerMessagePayloadSignerSignIn = {
  type: "sign_in";
  frameId: string;
  signer: FarcasterSignerApproved;
};

export type ServerMessagePayloadSignerSignInStart = {
  type: "sign_in_start";
  frameId: string;
  signer: FarcasterSignerPendingApproval;
};

export type ServerMessagePayloadSignerSignedIn = {
  type: "signed_in";
  signer: FarcasterSignerApproved;
};

export type ServerMessagePayloadSignerSignedOut = {
  type: "signed_out";
};

export type ServerMessagePayload =
  | ServerMessagePayloadFrameRendered
  | ServerMessagePayloadSignerSignOut
  | ServerMessagePayloadSignerSignIn
  | ServerMessagePayloadSignerSignInStart
  | ServerMessagePayloadSignerSignedIn
  | ServerMessagePayloadSignerSignedOut;

type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = Extract<
  T,
  Record<K, V>
>;

type MapDiscriminatedUnion<T extends Record<K, string>, K extends keyof T> = {
  [V in T[K]]: DiscriminateUnion<T, K, V>;
};

type MessagesByAction = MapDiscriminatedUnion<ServerMessagePayload, "type">;

export type InferServerMessagePayloadFromType<
  TAction extends keyof MessagesByAction,
> = MessagesByAction[TAction];
*/
