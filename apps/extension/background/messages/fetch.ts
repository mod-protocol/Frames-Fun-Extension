import type { PlasmoMessaging } from "@plasmohq/messaging"

export type FetchResponse =
  | {
      error: string
    }
  | {
      status: number
      headers: Record<string, string>
      body: string
    }

const handler: PlasmoMessaging.MessageHandler<
  { url: string; options: RequestInit },
  FetchResponse
> = async (req, res) => {
  try {
    if (!req.body) {
      throw new Error("Request body is missing")
    }

    const response = await fetch(req.body.url, req.body.options)
    const body = await response.text()

    return res.send({
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body
    })
  } catch (e) {
    console.error(e)
    return res.send({ error: e instanceof Error ? e.message : String(e) })
  }
}

export default handler
