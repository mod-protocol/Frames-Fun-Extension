import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://not-twitter.com/*", "https://not-x.com/*"]
}

window.addEventListener("load", () => {
  alert("LOADED")
})
