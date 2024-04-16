import type { PlasmoMessaging } from "@plasmohq/messaging"

export interface FetchFrameRequestParams {
  postType?: string
}

export interface FetchFrameRequestOptions extends Omit<RequestInit, "body"> {
  body?: object
}

const defaultHeaders = {
  "User-Agent": "fetch"
}

const proxyUrl =
  process.env.PLASMO_PUBLIC_FRAMES_PROXY_URL ||
  // "https://i.frames.fun/embed/frames"
  "http://localhost:3000/embed/frames"
// "https://debugger.framesjs.org/frames"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { url, options, params } = req.body as {
    url: string
    options?: FetchFrameRequestOptions
    params?: FetchFrameRequestParams
  }

  try {
    const targetUrl = new URL(proxyUrl)
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
    return res.send({ error: (err as any).message })
  }
}

export default handler
