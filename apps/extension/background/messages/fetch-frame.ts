import type { getFrame } from "frames.js"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import { framesProxyUrl } from "~constants"

export interface FetchFrameRequestParams {
  postType?: string
}

export interface FetchFrameRequestOptions extends Omit<RequestInit, "body"> {
  body?: object
}

export type FetchFrameRequest = {
  url: string
  options?: FetchFrameRequestOptions
  params?: FetchFrameRequestParams
}

export type FetchFrameResponseSuccess =
  | ReturnType<typeof getFrame>
  | { message: string }

export type FetchFrameResponse =
  | { body: FetchFrameResponseSuccess }
  | { error: string }

const defaultHeaders = {
  "User-Agent": "fetch"
}

const handler: PlasmoMessaging.MessageHandler<
  FetchFrameRequest,
  FetchFrameResponse
> = async (req, res) => {
  try {
    if (!req.body) {
      throw new Error("Request body is missing")
    }

    const { url, options, params } = req.body

    const targetUrl = new URL(framesProxyUrl)

    if (options?.method === "POST") {
      targetUrl.searchParams.set("postType", params?.postType || "post")
      targetUrl.searchParams.set("postUrl", url)
    } else {
      targetUrl.searchParams.set("url", url)
    }

    const body = await fetch(targetUrl.toString(), {
      method: options?.method || "GET",
      headers: {
        ...defaultHeaders,
        ...options?.headers
      },
      body: options?.body ? JSON.stringify(options.body) : undefined
    }).then((resp) => resp.json())

    return res.send({ body })
  } catch (err) {
    console.error(err)
    return res.send({ error: err instanceof Error ? err.message : String(err) })
  }
}

export default handler
