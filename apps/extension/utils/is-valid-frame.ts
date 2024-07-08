import type { Frame } from "frames.js"
import type { ParsingReport } from "frames.js/frame-parsers"

import type { FetchFrameResponseSuccess } from "~background/messages/fetch-frame"

type ValidFrame = {
  frame: Omit<Frame, "buttons"> & {
    buttons: Required<Frame["buttons"]>
  }
  status: "success" | "failure" // support partial frames
  reports: Record<string, ParsingReport[]>
}

export function isValidFrame(
  response: FetchFrameResponseSuccess
): response is ValidFrame {
  if (
    "message" in response ||
    !("status" in response) ||
    !("frame" in response)
  ) {
    return false
  }

  if (response.status === "success") {
    return true
  }

  // allow partial frames
  return (
    typeof response.frame.image === "string" &&
    "buttons" in response.frame &&
    Array.isArray(response.frame.buttons) &&
    response.frame.buttons.length > 0
  )
}
