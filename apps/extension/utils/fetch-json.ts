import { sendToBackground } from "@plasmohq/messaging"

export const fetchJson: typeof fetch = async (url, options) => {
  const { error, json, status } = await sendToBackground({
    name: "fetch",
    body: {
      url: url.toString(),
      options: {
        method: "GET",
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers
        }
      }
    }
  })

  if (error) {
    throw new Error(error)
  }

  // @todo test if this works
  return new Response(JSON.stringify(json), {
    status
  })
}
