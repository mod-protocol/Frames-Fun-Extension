import { sendToBackground } from "@plasmohq/messaging"

import type {
  FetchFrameRequestOptions,
  FetchFrameRequestParams,
  FetchFrameResponse,
  FetchFrameResponseSuccess
} from "~background/messages/fetch-frame"

export async function fetchFrame(
  url: string,
  options: FetchFrameRequestOptions | undefined = {},
  params: FetchFrameRequestParams | undefined = {}
): Promise<FetchFrameResponseSuccess> {
  const response: FetchFrameResponse = await sendToBackground({
    name: "fetch-frame",
    body: { url, options, params }
  })

  if ("error" in response) {
    throw new Error(response.error)
  }

  return response.body
}
