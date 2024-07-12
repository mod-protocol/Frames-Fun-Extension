import type {
  AllMessages,
  MessagesToExtension,
  MessagesFromServer,
  InferServerMessageFromType,
} from "./types";

export function sendMessageToExtension(message: MessagesToExtension) {
  window.parent.postMessage(message, "*");
}

export function sendMessageToEmbed(
  iframe: Window,
  message: MessagesFromServer
) {
  iframe.postMessage(message, "*");
}

type PossibleMessages = AllMessages["type"];

export function createMessageConsumer<TMessageType extends PossibleMessages>(
  type: TMessageType,
  callback: (message: InferServerMessageFromType<TMessageType>) => void
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

export function consumeMessageFromEmbed<
  TMessageType extends MessagesToExtension["type"],
>(
  type: TMessageType,
  callback: (message: InferServerMessageFromType<TMessageType>) => void
) {
  return createMessageConsumer(type, callback);
}

export function consumeMessageFromServer<
  TMessageType extends MessagesFromServer["type"],
>(
  type: TMessageType,
  callback: (message: InferServerMessageFromType<TMessageType>) => void
) {
  return createMessageConsumer(type, callback);
}
