import FrameRender from "@/components/frame-render";
import { Providers } from "./providers";
import { FrameUrlInput } from "@/components/frame-url-input";
import { ThemeContainer } from "./home-container";

export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const url = searchParams.url as string | undefined;
  const refreshKey = searchParams.r as string | undefined;

  return (
    <ThemeContainer>
      <div className="overflow-auto sm:px-8 py-12 px-2 h-full w-full bg-gray-100 dark:bg-black/85 dark:text-gray-100">
        <div
          className="w-full transition-all duration-150 ease-in-out max-w-[640px] m-auto"
          style={{ paddingTop: url ? "0rem" : "20rem" }}
        >
          <FrameUrlInput />
          {url && (
            <div key={refreshKey || "x"} className="pt-8 w-full">
              <div className="rounded-md dark:bg-black">
                <Providers>
                  <FrameRender url={url} />
                </Providers>
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeContainer>
  );
}
