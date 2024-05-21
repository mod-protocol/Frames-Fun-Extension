import {
  ServerReceivedMessage,
  ServerSentMessage,
  ServerReceivedMessageType,
} from "./types";

export function sendServerMessage<T>(message: ServerSentMessage<T>) {
  window.parent.postMessage(message, "*");
}

export function createMessageConsumer<T>(
  type: ServerReceivedMessageType,
  callback: (message: ServerReceivedMessage<T>) => void
) {
  const handler = (e: MessageEvent) => {
    const { data: message } = e;
    if (message.type === type) {
      // console.info("Received message", message);
      callback(message);
    }
  };
  window.addEventListener("message", handler);
  return () => {
    window.removeEventListener("message", handler);
  };
}
