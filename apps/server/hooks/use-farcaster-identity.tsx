"use client";

import { useEffect, useState } from "react";
import { LOCAL_STORAGE_KEYS } from "../constants";
import { convertKeypairToHex, createKeypair } from "../lib/crypto";
import {
  FarcasterSigner,
  FarcasterSignerState,
  FrameActionBodyPayload,
  signFrameAction,
} from "@frames.js/render";

interface SignedKeyRequest {
  deeplinkUrl: string;
  isSponsored: boolean;
  key: string;
  requestFid: number;
  state: string;
  token: string;
  userFid: number;
  signerUser?: object;
  signerUserMetadata?: object;
}

export function useFarcasterIdentity(): FarcasterSignerState {
  const [isLoading, setLoading] = useState<
    FarcasterSignerState["isLoadingSigner"] | false
  >(false);
  const [farcasterUser, setFarcasterUser] = useState<FarcasterSigner | null>(
    getSignerFromLocalStorage()
  );

  function getSignerFromLocalStorage() {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem(
        LOCAL_STORAGE_KEYS.FARCASTER_USER
      );
      if (storedData) {
        const user: FarcasterSigner = JSON.parse(storedData);

        if (user.status === "pending_approval") {
          // Validate that deadline hasn't passed
          if (user.deadline && user.deadline < Math.floor(Date.now() / 1000)) {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
            return null;
          }
        }

        return user;
      }
      return null;
    }

    return null;
  }

  useEffect(() => {
    const signer = getSignerFromLocalStorage();
    if (signer) setFarcasterUser(signer);
  }, []);

  function logout() {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FARCASTER_USER, "");
    setFarcasterUser(null);
  }

  useEffect(() => {
    if (farcasterUser && farcasterUser.status === "pending_approval") {
      let intervalId: any;

      const startPolling = () => {
        intervalId = setInterval(async () => {
          try {
            let user;
            if (process.env.NEXT_PUBLIC_DEV_USER) {
              user = JSON.parse(process.env.NEXT_PUBLIC_DEV_USER);
            } else {
              const fcSignerRequestResponse = await fetch(
                `https://api.warpcast.com/v2/signed-key-request?token=${farcasterUser.token}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              const responseBody = (await fcSignerRequestResponse.json()) as {
                result: { signedKeyRequest: SignedKeyRequest };
              };
              if (responseBody.result.signedKeyRequest.state !== "completed") {
                throw new Error("hasnt succeeded yet");
              }
              user = {
                ...farcasterUser,
                ...responseBody.result,
                fid: responseBody.result.signedKeyRequest.userFid,
                status: "approved" as const,
              };
            }

            // store the user in local storage
            localStorage.setItem(
              LOCAL_STORAGE_KEYS.FARCASTER_USER,
              JSON.stringify(user)
            );

            setFarcasterUser(user);
            clearInterval(intervalId);
          } catch (error) {
            console.info(error);
          }
        }, 2000);
      };

      const stopPolling = () => {
        clearInterval(intervalId);
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopPolling();
        } else {
          startPolling();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Start the polling when the effect runs.
      startPolling();

      // Cleanup function to remove the event listener and clear interval.
      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        clearInterval(intervalId);
      };
    }
  }, [farcasterUser]);

  async function onSignerlessFramePress() {
    setLoading(true);
    await createAndStoreSigner();
    setLoading(false);
  }

  async function createAndStoreSigner() {
    try {
      const keypair = await createKeypair();
      const keypairString = convertKeypairToHex(keypair);
      const authorizationResponse = await fetch(`/api/v1/signer`, {
        method: "POST",
        body: JSON.stringify({
          publicKey: keypairString.publicKey,
        }),
      });
      const authorizationBody: {
        signature: string;
        requestFid: number;
        deadline: number;
        requestSigner: string;
        sponsorship?: {
          sponsorFid: number;
          signature: string;
        };
      } = await authorizationResponse.json();
      const { signature, requestFid, deadline, sponsorship } =
        authorizationBody;
      if (authorizationResponse.status === 200) {
        const {
          result: { signedKeyRequest },
        } = (await (
          await fetch(`https://api.warpcast.com/v2/signed-key-requests`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key: keypairString.publicKey,
              signature,
              requestFid,
              deadline,
              sponsorship,
            }),
          })
        ).json()) as {
          result: { signedKeyRequest: { token: string; deeplinkUrl: string } };
        };

        const user: FarcasterSigner = {
          ...authorizationBody,
          publicKey: keypairString.publicKey,
          deadline: deadline,
          token: signedKeyRequest.token,
          signerApprovalUrl: signedKeyRequest.deeplinkUrl,
          privateKey: keypairString.privateKey,
          status: "pending_approval",
        };
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.FARCASTER_USER,
          JSON.stringify(user)
        );
        setFarcasterUser(user);
      }
    } catch (error) {
      console.error("API Call failed", error);
    }
  }

  return {
    signer: farcasterUser,
    hasSigner: !!farcasterUser?.privateKey,
    signFrameAction: async (x) => {
      const { body, searchParams } = (await signFrameAction(x)) as {
        body: FrameActionBodyPayload;
        searchParams: URLSearchParams;
      };
      return { body, searchParams };
    },
    isLoading: null,
    isLoadingSigner: isLoading,
    onSignerlessFramePress,
    logout,
  };
}
