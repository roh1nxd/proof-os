import { optionsResponse, withCors } from "@/lib/api/cors";
import { buildBuilderResponse } from "@/lib/api/v1/builder";
import { v1Get, v1WalletParam } from "@/lib/api/v1/handler";
import { jsonError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ wallet: string }> };

export async function OPTIONS(request: Request) {
  return optionsResponse(request);
}

export async function GET(request: Request, { params }: Params) {
  const { wallet: raw } = await params;
  const wallet = v1WalletParam(raw);
  if (!wallet) {
    return withCors(request, jsonError("Invalid wallet address", 400));
  }

  return v1Get(request, "endorsements", async () => {
    const builder = await buildBuilderResponse(wallet);
    return { wallet, endorsements: builder.endorsements };
  });
}
