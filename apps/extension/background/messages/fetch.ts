import type { PlasmoMessaging } from "@plasmohq/messaging"

const DEV_USER = process.env.PLASMO_PUBLIC_DEV_USER
const isDevelopment = process.env.NODE_ENV === "development"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // fake login for development
  if (isDevelopment && DEV_USER) {
    if (
      req.body.url.startsWith(
        "https://api.warpcast.com/v2/signed-key-request?token="
      ) &&
      req.body.options.method === "GET"
    ) {
      const result = JSON.parse(DEV_USER)
      return res.send({
        json: { result },
        status: 200
      })
    }
  }
  try {
    const resp = await fetch(req.body.url, req.body.options)
    if (!resp.ok) {
      return res.send({ status: resp.status, error: resp.statusText })
    }
    const text = await resp.text()
    let json
    try {
      json = JSON.parse(text)
    } catch (e) {
      // ignore
    }
    return res.send({ json, text, status: resp.status })
  } catch (e) {
    console.error(e)
    return res.send({ error: (e as any).message })
  }
}

export default handler
