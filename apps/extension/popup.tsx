import { useFarcasterIdentity } from "~hooks/use-farcaster-identity"

import "./style.css"

import { Button } from "~components/button"
import { FarcasterAuthUI } from "~components/farcaster-auth-ui"

export default function IndexPopup() {
  const { signer, hasSigner, isLoadingSigner, logout, onSignerlessFramePress } =
    useFarcasterIdentity()

  const handleClick = hasSigner ? logout : onSignerlessFramePress

  const shownAuthUi =
    signer?.status === "pending_approval" && signer?.signerApprovalUrl

  return (
    <div className="p-4 flex flex-col justify-between items-center bg-gradient-to-r from-violet-100 to-purple-100 text-violet-950 min-w-96 text-base gap-7">
      <div className="p-4 text-center flex flex-col gap-5">
        <div>
          <h2 className="text-2xl font-bold">Frames.fun</h2>
          <span className="text-sm text-slate-500">Welcome to Frames.fun</span>
        </div>
        {shownAuthUi ? (
          <div className="p-6 bg-white border border-violet-300/50 rounded">
            <FarcasterAuthUI signer={signer} logout={logout} />
          </div>
        ) : (
          <div className="text-slate-700">
            Log in with your Farcaster account and start using Farcaster frames
            on Twitter/X
          </div>
        )}
      </div>
      <div className="flex flex-col gap-5 items-center">
        {!shownAuthUi && (
          <div>
            <Button
              isLoading={isLoadingSigner}
              disabled={isLoadingSigner}
              onClick={handleClick}>
              {hasSigner ? "Logout" : "Login"}
            </Button>
          </div>
        )}
        <span className="text-xs text-slate-500">
          Powered by{" "}
          <a
            href="https://framesjs.org"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline hover:text-slate-700">
            frames.js
          </a>{" "}
          and
          <a
            href="https://openframes.xyz"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline hover:text-slate-700">
            Open Frames
          </a>
        </span>
      </div>
    </div>
  )
}
