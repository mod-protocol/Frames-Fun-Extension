import { FrameState } from "@frames.js/render";
import { Frame, FrameButton } from "frames.js";
import React, { ImgHTMLAttributes, useEffect, useState } from "react";
import { MessageSquareIcon, OctagonXIcon, TxIcon } from "./icons";
import { LoadingIndicator } from "./loading-indicator";

export type FrameUIProps = {
  frameState: FrameState;
  FrameImage?: React.FC<ImgHTMLAttributes<HTMLImageElement> & { src: string }>;
  onReset?: () => void;
};

type MessageTooltipProps = {
  message: string;
  /**
   * @defaultValue 'message'
   */
  variant?: "message" | "error";
  /**
   * @defaultValue false
   */
  inline?: boolean;
};

function MessageTooltip({
  inline = false,
  message,
  variant = "message",
}: MessageTooltipProps): JSX.Element {
  return (
    <div
      className={`${
        inline
          ? ""
          : "rounded shadow-md border border-gray-200/25 bg-white/75 dark:bg-neutral-700/75 dark:border-white/10"
      } ${variant === "error" ? "text-red-500" : ""} items-center px-5 py-3 flex gap-3 text-sm`}
    >
      {variant === "message" ? <MessageSquareIcon /> : <OctagonXIcon />}
      {message}
    </div>
  );
}

interface FrameImageComponentProps {
  src: string;
  frameUrl: string;
  frameLoading: boolean;
  aspectRatio: "1:1" | "1.91:1";
  FrameImage?: React.FC<ImgHTMLAttributes<HTMLImageElement> & { src: string }>;
  message?: string;
}

function FrameImageComponent({
  src,
  frameUrl,
  aspectRatio,
  frameLoading,
  FrameImage,
  message,
}: FrameImageComponentProps) {
  const [loadedSrc, setLoadedSrc] = useState("");

  const ImageEl = FrameImage ? FrameImage : "img";
  const styleAspectRatio =
    (aspectRatio ?? "1.91:1") === "1:1" ? "1/1" : "1.91/1";
  return (
    <div className="relative w-full" style={{ aspectRatio: styleAspectRatio }}>
      <a
        href={frameUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="w-full"
      >
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
            aspectRatio: styleAspectRatio,
          }}
        />
      </a>
      {message && (
        <div className="absolute inset-x-0 bottom-0 p-2">
          <MessageTooltip message={message} />
        </div>
      )}
    </div>
  );
}

function LinkButton(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className="flex-1 block text-center py-2 px-4 border text-sm min-w-24 rounded text-gray-700 bg-white border-gray-200 hover:bg-gray-200/50 hover:border-gray-300/75 transition-colors duration-150 dark:bg-white/10 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/15 dark:hover:border-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    />
  );
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="flex-1 py-2 px-4 border text-sm min-w-24 rounded text-gray-700 bg-white border-gray-200 hover:bg-gray-200/50 hover:border-gray-300/75 transition-colors duration-150 dark:bg-white/10 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/15 dark:hover:border-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    />
  );
}

function FrameButtonComponent({
  disabled,
  button,
  onClick,
}: {
  disabled: boolean;
  button: FrameButton;
  onClick?: () => void;
}) {
  if (button.action === "link") {
    return (
      <LinkButton
        href={button.target}
        target="_blank"
        rel="noopener noreferrer nofollow"
      >
        {button.label}
        {" ↗"}
      </LinkButton>
    );
  }
  return (
    <Button disabled={disabled} onClick={onClick}>
      {button.action === "mint" ? `⬗ ` : ""}
      {button.label}
      {button.action === "tx" ? <TxIcon /> : ""}
      {button.action === "post_redirect" ? ` ↗` : ""}
    </Button>
  );
}

function FrameContainerComponent(
  props: React.BaseHTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      className="flex flex-col overflow-hidden items-center justify-center w-full text-gray-700 rounded-md bg-gray-100 border border-gray-200 dark:bg-black dark:border-white/20 dark:text-gray-200 relative"
      {...props}
    />
  );
}

function FrameUIError({
  children,
  onReset,
  showButtonThreshold = 0,
}: {
  children: React.ReactNode;
  onReset?: () => void;
  showButtonThreshold?: number;
}) {
  const [isButtonShown, setIsButtonShown] = useState(false);
  useEffect(() => {
    if (showButtonThreshold > 0) {
      const timeout = setTimeout(() => {
        setIsButtonShown(true);
      }, showButtonThreshold);
      return () => clearTimeout(timeout);
    } else {
      setIsButtonShown(true);
    }
  }, [setIsButtonShown, showButtonThreshold]);
  return (
    <FrameContainerComponent style={{ aspectRatio: "1.91/1" }}>
      <div className="flex flex-col gap-3 items-center justify-center">
        <div>{children}</div>
        {onReset && isButtonShown && (
          <Button onClick={onReset} disabled={!isButtonShown}>
            Reset
          </Button>
        )}
      </div>
    </FrameContainerComponent>
  );
}

function isPartial(frame: Partial<Frame>): boolean {
  return !!(frame?.image || frame?.ogImage || frame?.buttons);
}

/** A UI component only, that should be easy for any app to integrate */
export function FrameUI({ frameState, FrameImage, onReset }: FrameUIProps) {
  const errorFrameProps = {
    onReset,
  };
  const prevFrame = frameState.framesStack?.find(
    (item, idx) => idx > 0 && item.status === "done"
  );
  const currentFrame = frameState.currentFrameStackItem;
  const frameResult =
    currentFrame?.status === "done" ? currentFrame.frameResult : null;
  const prevFrameResult =
    prevFrame?.status === "done" ? prevFrame.frameResult : null;
  const isLoading = currentFrame?.status === "pending";
  const frame: Frame | Partial<Frame> | undefined = frameResult
    ? frameResult.frame
    : prevFrameResult?.frame;
  if (!frameState.homeframeUrl) {
    return <FrameUIError {...errorFrameProps}>Missing frame url</FrameUIError>;
  }

  if (!currentFrame) {
    return null;
  }
  if (currentFrame.status === "requestError") {
    return (
      <FrameUIError {...errorFrameProps}>Failed to load Frame</FrameUIError>
    );
  }
  if (
    frameResult &&
    frameResult.status === "failure" &&
    !isPartial(frameResult.frame)
  ) {
    return <FrameUIError {...errorFrameProps}>Invalid frame</FrameUIError>;
  }

  if (!frame) {
    return (
      <FrameUIError {...errorFrameProps} showButtonThreshold={5000}>
        <LoadingIndicator />
      </FrameUIError>
    );
  }

  const handleButtonPress = async (index: number) => {
    if (frame.buttons) {
      return Promise.resolve(
        frameState.onButtonPress(frame as Frame, frame.buttons[index]!, index)
      ).catch((e) => {
        console.error(e);
      });
    }
    return Promise.resolve();
  };

  return (
    <FrameContainerComponent>
      <FrameImageComponent
        frameUrl={frameState.homeframeUrl}
        src={frame.image ?? frame.ogImage ?? ""}
        aspectRatio={frame.imageAspectRatio ?? "1.91:1"}
        frameLoading={!!isLoading}
        FrameImage={FrameImage}
        message={
          currentFrame.status === "message" ? currentFrame.message : undefined
        }
      />
      {(frame.inputText || frame.buttons) && (
        <div className="flex flex-col w-full gap-2 p-2 border-t border-gray-200 dark:border-white/10">
          {frame.inputText && (
            <input
              className="p-1.5 border box-border rounded border-gray-200 dark:border-white/15 dark:bg-white/5 dark:text-gray-200"
              value={frameState.inputText}
              type="text"
              placeholder={frame.inputText}
              onChange={(e) => frameState.setInputText(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter" && frame.buttons?.length === 1) {
                  handleButtonPress(0);
                }
              }}
            />
          )}
          <div className="flex flex-row gap-2 flex-wrap">
            {frame.buttons?.map((frameButton: FrameButton, index: number) => (
              <FrameButtonComponent
                key={index}
                disabled={!!isLoading}
                onClick={() => handleButtonPress(index)}
                button={frameButton}
              />
            ))}
          </div>
        </div>
      )}
    </FrameContainerComponent>
  );
}
