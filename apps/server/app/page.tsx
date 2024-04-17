"use client";

import FrameRender from "@/components/frame-render";
import { fallbackFrameContext } from "@frames.js/render";
import { Providers } from "./providers";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const url = searchParams.get("url");
  const [inputValue, setInputValue] = useState(url ?? "");

  const darkMode =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = darkMode ? "dark" : "light";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let url = inputValue.trim();
    if (url && url.includes(".") && !url.startsWith("http")) {
      url = `https://${url}`;
    }
    try {
      if (url) {
        new URL(url);
        router.push(`/?url=${encodeURIComponent(url)}`);
      } else {
        router.push("/");
      }
    } catch {
      setInputValue("");
    }
  };

  return (
    <div className={`${theme} w-full h-dvh flex`}>
      <div className="overflow-auto sm:px-8 py-12 px-2 h-full w-full bg-gray-100 dark:bg-black/85 dark:text-gray-100">
        <div
          className="w-full transition-all duration-150 ease-in-out max-w-[640px] m-auto"
          style={{ paddingTop: url ? "0rem" : "20rem" }}
        >
          <div className="w-full">
            <form
              className="flex w-full rounded-full shadow-lg shadow-gray-200 dark:shadow-black/20"
              onSubmit={handleSubmit}
            >
              <input
                className="flex-1 rounded-l-full px-6 py-4 dark:bg-white/20"
                placeholder="Enter frame URL"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                className="bg-black/80 hover:bg-black/90 active:bg-black dark:bg-white/15 dark:hover:bg-white/10 dark:active:bg-white/5 text-white rounded-r-full pl-6 pr-8 py-4 font-bold transition duration-150 ease-in-out"
                type="submit"
              >
                GO
              </button>
            </form>
          </div>
          {url && (
            <div className="pt-8 w-full">
              <div className="rounded-md dark:bg-black">
                <Providers theme={theme}>
                  <FrameRender url={url} frameContext={fallbackFrameContext} />
                </Providers>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
