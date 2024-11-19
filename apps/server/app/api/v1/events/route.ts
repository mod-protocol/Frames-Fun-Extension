import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { hexToBytes } from "viem/utils";
import { BROWSER_EXTENSION_INTERACTIONS } from "ffun-trpc-types/dist/lib/interactions";
import { getDevFramesFunApiClient } from "@/services/trpc";

const farcasterHubClient = getSSLHubRpcClient(
  process.env.FARCASTER_HUB_GRPC_URL
);

const bodyValidator = z.object({
  type: z.nativeEnum(BROWSER_EXTENSION_INTERACTIONS),
});

const headersValidator = z.object({
  fid: z.coerce.number().int().positive(),
  signerPublicKey: z.custom<`0x${string}`>(
    (val) => z.string().startsWith("0x").safeParse(val).success
  ),
});

export async function GET() {
  return new Response(undefined, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const { signerPublicKey, fid } = headersValidator.parse({
      fid: req.headers.get("x-fid"),
      signerPublicKey: req.headers.get("x-signer-public-key"),
    });

    // validate that signerPublicKey is a valid public key
    const signerOnChain = await farcasterHubClient.getOnChainSigner({
      fid,
      signer: hexToBytes(signerPublicKey),
    });

    if (signerOnChain.isErr()) {
      return new Response("Unauthenticated", { status: 401 });
    }

    const body = await req.json();
    const event = bodyValidator.parse(body);

    const devFrameFunClient = getDevFramesFunApiClient();

    await devFrameFunClient.interaction.recordInteraction.mutate({
      type: event.type,
      userFid: fid,
    });

    return new Response(undefined, {
      status: 204,
      headers: {
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    console.error(e);
    if (e instanceof z.ZodError) {
      return new Response("Invalid event", { status: 400 });
    }

    console.error(e);

    return new Response("Internal Server Error", { status: 500 });
  }
}
