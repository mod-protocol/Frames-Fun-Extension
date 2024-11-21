import {
  isParseFramesWithReportsResult,
  isParseResult,
  isPartialFrame
} from "@frames.js/render/helpers"
import type { GETResponse } from "@frames.js/render/next"

export function isValidFrame(response: GETResponse): boolean {
  if (isParseFramesWithReportsResult(response)) {
    if (
      response.farcaster.status === "success" ||
      response.openframes.status === "success" ||
      isPartialFrame(response.farcaster) ||
      isPartialFrame(response.openframes)
    ) {
      return true
    }
  }

  if (isParseResult(response)) {
    if (response.status === "success" || isPartialFrame(response)) {
      return true
    }
  }

  return false
}
