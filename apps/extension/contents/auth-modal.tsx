import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoCSUIProps } from "plasmo"
import { useEffect, useState } from "react"

import { Button } from "~components/button"
import { FarcasterAuthUI } from "~components/farcaster-auth-ui"
import { useFarcasterIdentity } from "~hooks/use-farcaster-identity"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*", "https://discord.com/*"]
}

interface AuthModalContainerProps extends React.PropsWithChildren {
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  shown: boolean
}

const AuthModalContainer: React.FC<AuthModalContainerProps> = ({
  children,
  onClick,
  shown
}) => {
  const darkMode =
    window && window.matchMedia("(prefers-color-scheme: dark)").matches
  return (
    <div
      className={`fixed w-full h-full bg-gray-950/75 flex items-center justify-center transition ease-in-out duration-200 ${darkMode ? "dark" : "light"}`}
      onClick={onClick}
      style={{ display: shown ? "flex" : "none" }}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}

const Countdown: React.FC<{ seconds: number }> = ({ seconds }) => {
  const [count, setCount] = useState(seconds)

  useEffect(() => {
    if (count <= 0) {
      return
    }
    const interval = setInterval(() => {
      setCount((c) => c - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [count])

  return <span>{count}</span>
}

const AUTO_CLOSE_TIMEOUT_SECONDS = 10

const AuthModal: React.FC<PlasmoCSUIProps> = () => {
  const [shown, setShown] = useState(false)

  const { signer, logout } = useFarcasterIdentity({
    enablePolling: true
  })

  const pendingApproval = signer?.status === "pending_approval"

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined

    if (signer?.status === "approved" && shown) {
      timeout = setTimeout(
        () => setShown(false),
        AUTO_CLOSE_TIMEOUT_SECONDS * 1000
      )
    } else {
      setShown(signer?.status === "pending_approval")
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [pendingApproval, signer?.status, shown])

  const handleClose = () => {
    // remove the identity if it is not approved
    // this cleans up the pending approval state
    if (signer?.status !== "approved") {
      logout?.()
    }

    setShown(false)
  }

  return (
    <AuthModalContainer onClick={handleClose} shown={shown}>
      <div className="relative p-8 flex flex-col justify-between items-center bg-white rounded-md text-violet-950 text-base min-w-72 gap-5">
        {signer?.status === "approved" ? (
          <div className="flex flex-col gap-2 max-w-72 text-center items-center">
            <div className="text-xl font-semibold">Logged in succesfully!</div>
            <div className="text-lg">
              You can now close the modal or it will close automatically in{" "}
              <span className="font-bold">
                <Countdown seconds={AUTO_CLOSE_TIMEOUT_SECONDS} />
              </span>{" "}
              seconds.
            </div>
            <div className="pt-3">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        ) : (
          <FarcasterAuthUI signer={signer} logout={logout} />
        )}
      </div>
    </AuthModalContainer>
  )
}

export default AuthModal
