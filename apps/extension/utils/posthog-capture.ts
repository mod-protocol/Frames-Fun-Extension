import { sendToBackground } from "@plasmohq/messaging"

import type {
  PosthogRequestBody,
  PosthogResponseBody
} from "~background/messages/posthog"

export function posthogCapture(
  event: PosthogRequestBody
): Promise<PosthogResponseBody> {
  return sendToBackground({
    name: "posthog",
    body: event
  })
}
