import cssText from "data-text:~style.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIAnchor,
  PlasmoCSUIJSXContainer,
  PlasmoGetInlineAnchorList,
  PlasmoRender
} from "plasmo"
import { createRoot } from "react-dom/client"

import FrameIFrame from "~components/frame-iframe"
import { fetchFrame } from "~utils/fetch-frame"
import { isValidFrame } from "~utils/is-valid-frame"

export const config: PlasmoCSConfig = {
  matches: ["https://discord.com/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

/**
 * Returns all articles in message accessories that weren't processed yet
 */
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const anchors = document.querySelectorAll(
    'div[id^="message-accessories"] > article[class*="embedWrapper"]:not([data-x-frames-processed])'
  )

  return Array.from(anchors).map((element) => ({
    element,
    insertPosition: "afterbegin"
  }))
}

interface FrameWrapperProps {
  url: string
  frameId: string
}

function determineTheme(window?: Window): "dark" | "light" {
  const doc = window?.document

  if (doc) {
    const rootNode = doc.querySelector("html")
    const isDark = rootNode?.classList.contains("theme-dark") ?? false

    return isDark ? "dark" : "light"
  }

  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

const FrameWrapper = ({ url, frameId }: FrameWrapperProps) => {
  const theme = determineTheme(window)
  return (
    <div
      data-framewrapperurl={url}
      className={`max-w-full w-full flex flex-col gap-2 ${theme}`}>
      <div onClick={(e) => e.preventDefault()}>
        <FrameIFrame url={url} frameId={frameId} theme={theme} />
      </div>
    </div>
  )
}

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async (
  { anchor, createRootContainer },
  InlineCSUIContainer
) => {
  if (!anchor || !createRootContainer || !InlineCSUIContainer) {
    return
  }

  // article contains only one div,we will replace that div with our frame ui
  anchor.element.setAttribute("data-x-frames-processed", "true")

  const styleMap = anchor.element.computedStyleMap()
  const { width: anchorWidth } = anchor.element.getBoundingClientRect()
  const maxWidth = parseInt(styleMap.get("max-width")?.toString() ?? "", 10)

  if (Number.isNaN(maxWidth) && anchor.element instanceof HTMLElement) {
    anchor.element.style.setProperty("max-width", `${anchorWidth}px`)
    // necessary for embed to be visible
    anchor.element.style.setProperty("width", "100%")
  }

  const anchorElement = anchor.element.querySelector("a")

  if (!anchorElement) {
    return
  }

  const url = anchorElement.getAttribute("href")

  if (!url) {
    return
  }

  const card = anchor.element.firstElementChild

  if (!card || !(card instanceof HTMLDivElement)) {
    return
  }

  const frame = await fetchFrame(url)

  if (!isValidFrame(frame)) {
    return
  }

  const frameId = Math.random().toString(36).substring(2)
  const newAnchor: PlasmoCSUIAnchor = {
    ...anchor,
    type: "inline",
    insertPosition: "afterend",
    element: card // place next to card, card is then removed
  }
  const rootContainer = await createRootContainer(newAnchor)
  const root = createRoot(rootContainer)

  card.remove()

  root.render(
    <InlineCSUIContainer anchor={newAnchor}>
      <FrameWrapper url={url} frameId={frameId} />
    </InlineCSUIContainer>
  )
}
