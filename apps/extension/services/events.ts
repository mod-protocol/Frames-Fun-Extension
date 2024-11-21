import { BROWSER_EXTENSION_INTERACTIONS } from "ffun-trpc-types/dist/lib/interactions"

import { eventsProxyUrl } from "~constants"

export function dispatchInteractionEvent(
  event: BROWSER_EXTENSION_INTERACTIONS,
  fid: number,
  signerPublicKey: string
) {
  // we don't care about the result of this request
  fetch(eventsProxyUrl, {
    headers: {
      "X-FID": fid.toString(),
      "X-Signer-Public-Key": signerPublicKey,
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      type: event
    })
  })
}
