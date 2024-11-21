import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { APIRouter } from "ffun-trpc-types/dist/server/api/root";
import superjson from "superjson";

export function getDevFramesFunApiClient(authToken?: string) {
  const client = createTRPCClient<APIRouter>({
    links: [
      httpBatchLink({
        url: process.env.DEV_FRAMES_FUN_API_TRPC_URL,
        transformer: superjson,
        async headers() {
          return {
            ...(authToken && {
              authorization: authToken,
            }),
            "x-api-key": process.env.DEV_FRAMES_FUN_API_KEY,
          };
        },
      }),
    ],
  });

  return client;
}
