import type { Metadata } from "next";
import { fetchMetadata } from "frames.js/next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "New api example",
    description: "This is a new api example",
    // other: {
    //   ...(await fetchMetadata(new URL("/tx/frames", "http://localhost:3000"))),
    // },
  };
}

export default async function Home() {
  return <div>Rent farcaster storage example</div>;
}
