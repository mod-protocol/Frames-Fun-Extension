export type ServerSentMessageType = "FRAME_RENDERED" | "SIGNER_LOGOUT" | "SIGNER_LOGIN";
export type ServerReceivedMessageType = "SIGNER_LOGGED_IN" | "SIGNER_LOGGED_OUT";

export type ServerSentMessage<T> = {
  type: ServerSentMessageType;
  frameId?: string;
  data?: T;
};

export type ServerReceivedMessage<T> = {
  type: ServerReceivedMessageType;
  frameId?: string;
  data?: T;
};
