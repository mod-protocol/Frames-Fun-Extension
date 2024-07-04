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
  matches: ["https://x.com/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const anchors = document.querySelectorAll(
    'div[data-testid="card.wrapper"] > div:first-child > a:not([data-x-frames-processed]), div[data-testid="tweetText"] > a:not([data-x-frames-processed])'
  )
  return Array.from(anchors).map((element) => ({
    element,
    insertPosition: "afterend"
  }))
}

interface FrameWrapperProps {
  url: string
  originalUrl: string
  frameId: string
}

function determineTheme(window?: Window): "dark" | "light" {
  const doc = window?.document
  if (doc) {
    const rootNode = doc.querySelector("html")
    const colorScheme = rootNode?.style.colorScheme
    if (colorScheme === "dark" || colorScheme === "light") {
      return colorScheme
    }
  }
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

const FrameWrapper = (props: FrameWrapperProps) => {
  const { url, frameId } = props
  const theme = determineTheme(window)
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

const clearWrapperParent = (el: Element) => {
  const containerElement = el
  while (el.firstChild) {
    el.firstChild.remove()
  }
  return containerElement
}

const getAnchorElement = (el: Element) => {
  const cardWrapperParent = el.closest(
    "[data-testid='card.wrapper']"
  )?.parentElement
  if (cardWrapperParent) {
    return clearWrapperParent(cardWrapperParent)
  }
  if (el.parentElement) {
    return el.parentElement
  }
  return null
}

interface FrameModel {
  frame?: {
    buttons?: any[]
    version?: string
    image?: string
  }
  status: "success" | "failure"
}

// TODO a workaround for now -- e.g. https://farcaster.vote/4ae20a8eb4caa52f5588f7bb9f3c6d6b7cf003a5b03f4589edea1000000002d1 is not parsed / validated correctly
const isValidFrame = (frameModel: FrameModel) => {
  return (
    frameModel?.frame &&
    (frameModel.status === "success" ||
      (frameModel.frame.buttons?.length ?? 0) > 0 ||
      !!frameModel.frame?.image)
  )
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
  const url = anchorElement.getAttribute("href")
  if (!url) {
    return
  }

  const frameUrl = await fetchRedirectUrl(url)
  if (!frameUrl) {
    return
  }
  const cardWrapperParent = anchorElement.closest(
    "[data-testid='card.wrapper']"
  )?.parentElement
  const tweetParentFrameUrls = (
    tweetParent.getAttribute("data-x-frames-urls") || ""
  ).split(",")
  if (tweetParentFrameUrls.includes(frameUrl)) {
    if (cardWrapperParent) {
      clearWrapperParent(cardWrapperParent)
    }
    return
  }
  tweetParent.setAttribute(
    "data-x-frames-urls",
    tweetParentFrameUrls.concat(frameUrl).join(",")
  )

  const frameModel = await fetchFrameModel(frameUrl)
  if (!isValidFrame(frameModel)) {
    return
  }

  const newAnchorElement = getAnchorElement(anchorElement)
  if (newAnchorElement) {
    anchor.element = newAnchorElement
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
