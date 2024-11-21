import {
  isParseFramesWithReportsResult,
  isParseResult
} from "@frames.js/render/helpers"
import type { GETResponse } from "@frames.js/render/next"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import { framesProxyUrl } from "~constants"

export type FetchFrameRequest = {
  url: string
}

export type FetchFrameResponse = GETResponse | { error: string }

const defaultHeaders = {
  "User-Agent": "fetch"
}

// @todo refactor, also provide status of the response, headers, etc
// @todo this probably doesn't need a POST handling because it apparently loads only GET requests
const handler: PlasmoMessaging.MessageHandler<
  FetchFrameRequest,
  FetchFrameResponse
> = async (req, res) => {
  try {
    if (!req.body) {
      throw new Error("Request body is missing")
    }

    const { url } = req.body

    const targetUrl = new URL(framesProxyUrl)

    targetUrl.searchParams.set("url", url)

    const response = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: {
        ...defaultHeaders
      }
    })

    console.log(await response.clone().text())

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const responseBody = await response.json()

    if (isParseFramesWithReportsResult(responseBody)) {
      return res.send(responseBody)
    } else if (isParseResult(responseBody)) {
      return res.send(responseBody)
    } else if (
      typeof responseBody === "object" &&
      !!responseBody &&
      "message" in responseBody
    ) {
      return res.send({ message: responseBody.message })
    }

    throw new Error("Invalid response")
  } catch (err) {
    console.error(err)
    return res.send({ error: err instanceof Error ? err.message : String(err) })
  }
}

export default handler
