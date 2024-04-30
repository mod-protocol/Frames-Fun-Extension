import cssText from "data-text:~style.css"
import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchorList,
  PlasmoRender
} from "plasmo"
import { createRoot } from "react-dom/client"

import { sendToBackground } from "@plasmohq/messaging"

import FrameIFrame from "~components/frame-iframe"

export const config: PlasmoCSConfig = {
  matches: ["https://twitter.com/*", "https://x.com/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const anchors = document.querySelectorAll(
    'div[data-testid="card.wrapper"] > div > a:not([data-x-frames-processed]), div[data-testid="tweetText"] > a:not([data-x-frames-processed])'
  )
  return Array.from(anchors).map((element) => ({
    element,
    insertPosition: "afterend"
  }))
}

interface FrameWrapperProps {
  url: string
  originalUrl: string
  // frame: Frame
  frameId: string
}

const FrameWrapper = (props: FrameWrapperProps) => {
  const { url, frameId } = props
  const darkMode =
    window && window.matchMedia("(prefers-color-scheme: dark)").matches
  const theme = darkMode ? "dark" : "light"
  return (
    <div
      data-framewrapperurl={url}
      className={`w-full flex flex-col gap-2 mb-4 ${theme}`}>
      <div onClick={(e) => e.preventDefault()}>
        <FrameIFrame url={url} frameId={frameId} theme={theme} />
      </div>
    </div>
  )
}

const parseRedirectUrl = (resp: string) => {
  /*
    <head><noscript><META http-equiv="refresh" content="0;URL=https://yoink.terminally.online/"></noscript><title>https://yoink.terminally.online/</title></head><script>window.opener = null; location.replace("https:\/\/yoink.terminally.online\/")</script>
    */
  const matches = resp.match(/URL=(.*)">/)
  return matches?.[1]
}

const fetchRedirectUrl = async (url: string) => {
  try {
    const { text, error } = await sendToBackground({
      name: "fetch-text",
      body: { url }
    })
    if (error) {
      console.debug("Request failed", error)
      return null
    }
    const redirectUrl = parseRedirectUrl(text)
    if (!redirectUrl) {
      console.debug("No URL found!", text)
    }
    return redirectUrl
  } catch (e) {
    console.error("ERROR", e)
    return null
  }
}

const fetchFrameModel = async (url: string) => {
  try {
    const frameCandidateResp = await sendToBackground({
      name: "fetch-frame",
      body: { url }
    })
    const { body } = frameCandidateResp
    return body
  } catch (e) {
    console.error("ERROR", e)
    return {
      frame: null,
      errors: { frame: "failed to fetch: " + (e as any).message }
    }
  }
}

export const render: PlasmoRender<any> = async (
  { anchor, createRootContainer },
  InlineCSUIContainer
) => {
  if (!anchor || !createRootContainer) {
    return
  }
  const tweetParent = anchor.element.closest("article[data-testid='tweet']")
  if (!tweetParent) {
    return
  }

  const anchorElement = anchor.element
  anchorElement.setAttribute("data-x-frames-processed", "true")
  const cardWrapperParent = anchorElement.closest(
    "[data-testid='card.wrapper']"
  )?.parentElement
  if (cardWrapperParent) {
    const containerElement = cardWrapperParent
    while (cardWrapperParent.firstChild) {
      cardWrapperParent.firstChild.remove()
    }
    anchor.element = containerElement
  } else if (anchorElement.parentElement) {
    anchor.element = anchorElement.parentElement
  }
  const url = anchorElement.getAttribute("href")
  if (!url) {
    return
  }

  const frameUrl = await fetchRedirectUrl(url)
  if (!frameUrl) {
    return
  }
  const tweetParentFrameUrls = (
    tweetParent.getAttribute("data-x-frames-urls") || ""
  ).split(",")
  if (tweetParentFrameUrls.includes(frameUrl)) {
    return
  }
  tweetParent.setAttribute(
    "data-x-frames-urls",
    tweetParentFrameUrls.concat(frameUrl).join(",")
  )

  const frameModel = await fetchFrameModel(frameUrl)
  const isValidFrame = frameModel?.frame && frameModel.status === "success"
  if (!isValidFrame) {
    return
  }
  const frameId = Math.random().toString(36).substring(2)
  const rootContainer = await createRootContainer(anchor)
  const root = createRoot(rootContainer)

  root.render(
    <InlineCSUIContainer anchor={anchor}>
      <div className={cardWrapperParent ? "w-full" : "w-full mt-3"}>
        <FrameWrapper url={frameUrl} originalUrl={url} frameId={frameId} />
      </div>
    </InlineCSUIContainer>
  )
}
