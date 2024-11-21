import type { GETResponse } from "@frames.js/render/next"

import { sendToBackground } from "@plasmohq/messaging"

import type { FetchFrameResponse } from "~background/messages/fetch-frame"

export async function fetchFrame(url: string): Promise<GETResponse> {
  const response: FetchFrameResponse = await sendToBackground({
    name: "fetch-frame",
    body: { url }
  })

  if ("error" in response) {
    throw new Error(response.error)
  }

  return response
}
