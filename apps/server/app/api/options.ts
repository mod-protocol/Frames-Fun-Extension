import { NextRequest } from "next/server";

export const OPTIONS = (req: NextRequest) => {
  return new Response(null);
};
