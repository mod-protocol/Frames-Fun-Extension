import { NextRequest, NextResponse } from "next/server";
import { mnemonicToAccount } from "viem/accounts";

export { OPTIONS } from "../../options";

type SignedKeyRequestSponsorship = {
  sponsorFid: number;
  signature: string; // sponsorship signature by sponsorFid
};

type SignedKeyRequestBody = {
  key: string;
  requestFid: number;
  deadline: number;
  signature: string; // key request signature by requestFid
  sponsorship?: SignedKeyRequestSponsorship;
  // custom fields
  requestSigner: string; // address of the request signer
};

const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
  name: "Farcaster SignedKeyRequestValidator",
  version: "1",
  chainId: 10,
  verifyingContract: "0x00000000fc700472606ed4fa22623acf62c60553",
} as const;

const SIGNED_KEY_REQUEST_TYPE = [
  { name: "requestFid", type: "uint256" },
  { name: "key", type: "bytes" },
  { name: "deadline", type: "uint256" },
] as const;

const SIGNATURE_VALIDITY = 86400; // 1 day

async function handler(req: NextRequest) {
  // TODO: Authentication
  try {
    const { publicKey } = (await req.json()) as { publicKey: `0x${string}` };

    const appFid = parseInt(process.env.FARCASTER_DEVELOPER_FID!);
    const appAccount = mnemonicToAccount(
      process.env.FARCASTER_DEVELOPER_MNEMONIC!
    );

    const deadline = Math.floor(Date.now() / 1000) + SIGNATURE_VALIDITY;
    const signature = await appAccount.signTypedData({
      domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
      types: {
        SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
      },
      primaryType: "SignedKeyRequest",
      message: {
        requestFid: BigInt(appFid),
        key: publicKey,
        deadline: BigInt(deadline),
      },
    });

    // Source: https://warpcast.notion.site/Signer-Request-API-Migration-Guide-Public-9e74827f9070442fb6f2a7ffe7226b3c#13811c0803584d68aac18c5b0e08cfd7
    let sponsorship: SignedKeyRequestSponsorship | undefined = undefined;
    if (
      process.env.FARCASTER_SPONSOR_FID &&
      process.env.FARCASTER_SPONSOR_MNEMONIC
    ) {
      const sponsorFid = parseInt(process.env.FARCASTER_SPONSOR_FID);
      const sponsorAccount = mnemonicToAccount(
        process.env.FARCASTER_SPONSOR_MNEMONIC
      );

      // sponsoringAccount is Viem account instance for the sponsoring FID's custody address
      // signedKeyRequestSignature is the EIP-712 signature signed by the requesting FID
      const sponsorSignature = await sponsorAccount.signMessage({
        message: { raw: signature },
      });
      sponsorship = {
        signature: sponsorSignature,
        sponsorFid: sponsorFid,
      };
    }

    const signedKeyRequest: SignedKeyRequestBody = {
      key: publicKey,
      signature,
      requestFid: appFid,
      deadline,
      sponsorship,
      requestSigner: appAccount.address,
    };

    return Response.json(signedKeyRequest);
  } catch (err) {
    console.error(err);
    const res = NextResponse.error();
    return res;
  }
}

export const GET = handler;
export const POST = handler;
