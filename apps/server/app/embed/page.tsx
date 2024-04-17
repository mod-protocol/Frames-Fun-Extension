import FrameRender from "@/components/frame-render";
import { fallbackFrameContext } from "@frames.js/render";
import { Providers } from "../providers";

export default async function Home(props: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { searchParams } = props;
  const url = searchParams.url as string;
  const themeParam = searchParams.theme;
  const frameId = searchParams.frameId as string;

  const theme = themeParam === "dark" ? "dark" : "light";

  return (
    <div className={`${theme} h-dvh w-full`}>
      <div className="dark:bg-black h-full w-full">
        <Providers theme={theme}>
          <FrameRender
            frameId={frameId}
            url={url}
            frameContext={fallbackFrameContext}
          />
        </Providers>
      </div>
    </div>
  );
}
