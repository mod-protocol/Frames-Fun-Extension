import { FrameState } from "@frames.js/render";
import { FrameButton } from "frames.js";
import React, { ImgHTMLAttributes, useState } from "react";

export type FrameUIProps = {
  frameState: FrameState;
  FrameImage?: React.FC<ImgHTMLAttributes<HTMLImageElement> & { src: string }>;
  onReset?: () => void;
};

interface FrameImageComponentProps {
  src: string;
  frameLoading: boolean;
  aspectRatio: "1:1" | "1.91:1";
  FrameImage?: React.FC<ImgHTMLAttributes<HTMLImageElement> & { src: string }>;
}

function FrameImageComponent({
  src,
  aspectRatio,
  frameLoading,
  FrameImage,
}: FrameImageComponentProps) {
  const [loadedSrc, setLoadedSrc] = useState("");

  const ImageEl = FrameImage ? FrameImage : "img";
  return (
    <ImageEl
      src={src}
      alt="Frame image"
      className="w-full rounded-t-md"
      width={"100%"}
      onLoad={() => setLoadedSrc(src)}
      onError={() => setLoadedSrc(src)}
      style={{
        filter: frameLoading || src !== loadedSrc ? "blur(4px)" : undefined,
        objectFit: "cover",
        aspectRatio: (aspectRatio ?? "1.91:1") === "1:1" ? "1/1" : "1.91/1",
      }}
    />
  );
}

function FrameButtonComponent(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      type="button"
      className="flex-1 py-2 px-4 border text-sm min-w-24 rounded text-gray-700 bg-white border-gray-200 hover:bg-gray-200/50 hover:border-gray-300/75 transition-colors duration-150 dark:bg-white/10 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/15 dark:hover:border-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    />
  );
}

function FrameContainerComponent(
  props: React.BaseHTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      className="flex flex-col overflow-hidden items-center justify-center w-full text-gray-700 rounded-md bg-gray-100 border border-gray-200 dark:bg-black dark:border-white/20 dark:text-gray-200"
      {...props}
    />
  );
}

function FrameUIError({
  children,
  onReset,
}: {
  children: React.ReactNode;
  onReset?: () => void;
}) {
  return (
    <FrameContainerComponent style={{ aspectRatio: "1.91/1" }}>
      <div className="flex flex-col gap-3 items-center justify-center">
        <div>{children}</div>
        {onReset && (
          <div>
            <FrameButtonComponent onClick={onReset}>Reset</FrameButtonComponent>
          </div>
        )}
      </div>
    </FrameContainerComponent>
  );
}

function TxIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 16 16"
      className="ml-1 mb-[2px] text-gray-400 inline-block select-none align-text-middle overflow-visible"
      width="12"
      height="12"
      fill="currentColor"
    >
      <path d="M9.504.43a1.516 1.516 0 0 1 2.437 1.713L10.415 5.5h2.123c1.57 0 2.346 1.909 1.22 3.004l-7.34 7.142a1.249 1.249 0 0 1-.871.354h-.302a1.25 1.25 0 0 1-1.157-1.723L5.633 10.5H3.462c-1.57 0-2.346-1.909-1.22-3.004L9.503.429Zm1.047 1.074L3.286 8.571A.25.25 0 0 0 3.462 9H6.75a.75.75 0 0 1 .694 1.034l-1.713 4.188 6.982-6.793A.25.25 0 0 0 12.538 7H9.25a.75.75 0 0 1-.683-1.06l2.008-4.418.003-.006a.036.036 0 0 0-.004-.009l-.006-.006-.008-.001c-.003 0-.006.002-.009.004Z"></path>
    </svg>
  );
}

/** A UI component only, that should be easy for any app to integrate */
export function FrameUI({ frameState, FrameImage, onReset }: FrameUIProps) {
  const errorFrameProps = {
    onReset,
  };
  if (!frameState.homeframeUrl) {
    return <FrameUIError {...errorFrameProps}>Missing frame url</FrameUIError>;
  } else if (frameState.error) {
    return (
      <FrameUIError {...errorFrameProps}>Failed to load Frame</FrameUIError>
    );
  } else if (
    frameState.homeframeUrl &&
    !frameState.frame &&
    !frameState.isLoading
  ) {
    return (
      <FrameUIError {...errorFrameProps}>Failed to load Frame</FrameUIError>
    );
  } else if (!frameState.frame) {
    if (frameState.isLoading) {
      return <FrameUIError>Loading...</FrameUIError>;
    }
    return <FrameUIError {...errorFrameProps}>Frame not present</FrameUIError>;
  } else if (!frameState.isFrameValid) {
    return <FrameUIError {...errorFrameProps}>Invalid frame</FrameUIError>;
  }

  return (
    <FrameContainerComponent>
      <FrameImageComponent
        src={frameState.frame.image}
        aspectRatio={frameState.frame.imageAspectRatio ?? "1.91:1"}
        frameLoading={!!frameState.isLoading}
        FrameImage={FrameImage}
      />
      <div className="flex flex-col w-full gap-2 p-2 border-t border-gray-200 dark:border-white/10">
        {frameState.frame.inputText && (
          <input
            className="p-1.5 border box-border rounded border-gray-200 dark:border-white/15 dark:bg-white/5 dark:text-gray-200"
            value={frameState.inputText}
            type="text"
            placeholder={frameState.frame.inputText}
            onChange={(e) => frameState.setInputText(e.target.value)}
            onKeyUp={(e) => {
              if (
                e.key === "Enter" &&
                frameState.frame?.buttons?.length === 1
              ) {
                frameState.onButtonPress(frameState.frame.buttons[0], 0);
              }
            }}
          />
        )}
        <div className="flex flex-row gap-2 flex-wrap">
          {frameState.frame.buttons?.map(
            (frameButton: FrameButton, index: number) => (
              <FrameButtonComponent
                type="button"
                disabled={!!frameState.isLoading}
                onClick={() => frameState.onButtonPress(frameButton, index)}
                key={index}
              >
                {frameButton.action === "mint" ? `⬗ ` : ""}
                {frameButton.label}
                {frameButton.action === "tx" ? <TxIcon /> : ""}
                {frameButton.action === "post_redirect" ||
                frameButton.action === "link"
                  ? ` ↗`
                  : ""}
              </FrameButtonComponent>
            )
          )}
        </div>
      </div>
    </FrameContainerComponent>
  );
}
