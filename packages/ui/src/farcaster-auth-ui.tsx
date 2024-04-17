import React from "react";
import QRCode from "qrcode.react";

type Signer =
  | {
      status: string;
      signerApprovalUrl?: string;
    }
  | undefined
  | null;
export type FarcasterAuthUIProps = {
  authState?: {
    signer?: Signer;
    logout?: () => void;
  };
};

export const FarcasterAuthUI = ({ authState }: FarcasterAuthUIProps) => {
  if (
    !(
      authState?.signer?.status === "pending_approval" &&
      authState?.signer?.signerApprovalUrl
    )
  ) {
    return null;
  }
  return (
    <div className="w-full flex flex-col gap-4 text-center">
      <div className="flex flex-row w-full gap-3 justify-between items-start">
        <div className="text-violet-950 text-lg font-bold">
          Login with Farcaster to interact
        </div>
        <div className="py-1">
          <button
            className="text-violet-950/50 hover:text-violet-950/40 active:text-violet-950/25 transition ease-in-out duration-150"
            onClick={() => authState.logout?.()}
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <path
                  d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-3 w-full">
        <div>
          <div className="mb-2 text-violet-950/75">
            Scan with your phone camera
          </div>
          <div className="aspect-square w-full bg-white border border-violet-950/10 rounded flex items-center justify-center">
            <QRCode value={authState.signer?.signerApprovalUrl} size={192} />
          </div>
        </div>
        <div className="flex flex-row w-full gap-2 items-center">
          <div className="bg-violet-950/10 pt-px flex-1"></div>
          <div className="text-violet-950/50">OR</div>
          <div className="bg-violet-950/10 pt-px flex-1"></div>
        </div>
        <div className="w-full text-center">
          <a
            href={authState.signer?.signerApprovalUrl}
            target="_blank"
            className="text-md font-semibold hover:underline text-violet-950 hover:text-violet-950/75 active:text-violet-950/50"
            rel="noopener noreferrer"
          >
            Open url
            <svg
              className="inline h-4 w-4 ml-1"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <path
                  d="M10.0002 5H8.2002C7.08009 5 6.51962 5 6.0918 5.21799C5.71547 5.40973 5.40973 5.71547 5.21799 6.0918C5 6.51962 5 7.08009 5 8.2002V15.8002C5 16.9203 5 17.4801 5.21799 17.9079C5.40973 18.2842 5.71547 18.5905 6.0918 18.7822C6.5192 19 7.07899 19 8.19691 19H15.8031C16.921 19 17.48 19 17.9074 18.7822C18.2837 18.5905 18.5905 18.2839 18.7822 17.9076C19 17.4802 19 16.921 19 15.8031V14M20 9V4M20 4H15M20 4L13 11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};
