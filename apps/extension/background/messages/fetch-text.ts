import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  fetch(req.body.url)
    .then((resp) => resp.text())
    .then((text) => res.send({ text }))
    .catch((e) => res.send({ error: e.message }))
}

export default handler
