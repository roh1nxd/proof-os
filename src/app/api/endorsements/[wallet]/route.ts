import { loadWalletProofData } from "@/lib/api/wallet-data";
import { getClientIp, jsonError, jsonOk } from "@/lib/api/response";
import { normalizeWallet } from "@/lib/security/wallet";
import { rateLimit } from "@/lib/security/rate-limit";

type Params = { params: Promise<{ wallet: string }> };

export async function GET(request: Request, { params }: Params) {
  const ip = getClientIp(request);
  const limited = rateLimit(`api:endorsements:${ip}`, 120, 60_000);
  if (!limited.ok) {
    return jsonError("Too many requests", 429, {
      retryAfterSec: limited.retryAfterSec,
    });
  }

  const { wallet: raw } = await params;
  const wallet = normalizeWallet(raw);
  if (!wallet) return jsonError("Invalid wallet address", 400);

  try {
    const data = await loadWalletProofData(wallet);
    return jsonOk({
      wallet,
      endorsements: data.endorsementsReceived.map((e: { entityKey: string; payload: Record<string, unknown> }) => ({
        entityKey: e.entityKey,
        ...e.payload,
      })),
    });
  } catch (err) {
    console.error("[endorsements]", err);
    return jsonError("Failed to load endorsements from Arkiv", 502);
  }
}
