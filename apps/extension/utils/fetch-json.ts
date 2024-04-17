import { sendToBackground } from "@plasmohq/messaging"

export interface JsonExtractor<T> {
  json: () => Promise<T>
  status: number
}

export const fetchJson = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<JsonExtractor<T>> => {
  const { error, json, status } = await sendToBackground({
    name: "fetch",
    body: {
      url,
      options: {
        method: "GET",
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers
        }
      }
    }
  })
  if (error) {
    throw new Error(error)
  }
  return { json: () => json, status }
}
