"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const FrameUrlInput = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentUrl = searchParams.get("url");
  const [inputValue, setInputValue] = useState(currentUrl ?? "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let url = inputValue.trim();
    if (url && url.includes(".") && !url.startsWith("http")) {
      url = `https://${url}`;
    }
    try {
      if (url) {
        new URL(url);
        router.replace(
          `/?url=${encodeURIComponent(url)}&r=${Math.random().toString(36).substring(2)}`
        );
      } else {
        router.replace("/");
      }
    } catch {
      setInputValue("");
    }
  };

  return (
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
  );
};
