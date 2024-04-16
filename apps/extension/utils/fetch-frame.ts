import { sendToBackground } from "@plasmohq/messaging"

import {
  FetchFrameRequestOptions,
  FetchFrameRequestParams
} from "~background/messages/fetch-frame"

import { JsonExtractor } from "./fetch-json"

export const fetchFrame = async <T>(
  url: string,
  options: FetchFrameRequestOptions | undefined = {},
  params: FetchFrameRequestParams | undefined = {}
): Promise<JsonExtractor<T>> => {
  const { error, body, status } = await sendToBackground({
    name: "fetch-frame",
    body: { url, options, params }
  })
  if (error) {
    throw new Error(error)
  }
  return { json: () => body, status }
}
