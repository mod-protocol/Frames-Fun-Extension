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
    body: { url, options }
  })
  if (error) {
    throw new Error(error)
  }
  return { json: () => json, status }
}
