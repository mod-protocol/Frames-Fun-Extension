import { posthog } from "posthog-js"

import type { PlasmoMessaging } from "@plasmohq/messaging"

type SignInStartEvent = {
  action: "sign_in_start"
  uid: string
}

type SignInEvent = {
  action: "sign_in"
  uid: string
}

type SignOutEvent = {
  action: "sign_out"
  uid: string
}

export type PosthogRequestBody = SignInStartEvent | SignInEvent | SignOutEvent

export type PosthogResponseBody = {}

if (
  process.env.PLASMO_PUBLIC_POSTHOG_API_HOST &&
  process.env.PLASMO_PUBLIC_POSTHOG_API_KEY
) {
  posthog.init(process.env.PLASMO_PUBLIC_POSTHOG_API_KEY, {
    api_host: process.env.PLASMO_PUBLIC_POSTHOG_API_HOST,
    disable_external_dependency_loading: true
  })
}

const handler: PlasmoMessaging.MessageHandler<
  PosthogRequestBody,
  PosthogResponseBody
> = async (req, res) => {
  const { action, uid } = req.body!

  switch (action) {
    case "sign_in_start": {
      posthog.capture("sign_in_start", { uid })
      break
    }

    case "sign_in": {
      posthog.identify(uid)
      posthog.capture("sign_in", { uid })
      break
    }
    case "sign_out": {
      posthog.reset()
      posthog.capture("sign_out", { uid })
      break
    }
  }

  res.send({})
}

export default handler
