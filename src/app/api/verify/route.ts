import { loadWalletProofData } from "@/lib/api/wallet-data";
import { getClientIp, jsonError, jsonOk } from "@/lib/api/response";
import { verifyRequestSchema } from "@/lib/validation/schemas";
import { normalizeWallet } from "@/lib/security/wallet";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`api:verify:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return jsonError("Too many requests", 429, {
      retryAfterSec: limited.retryAfterSec,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = verifyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, {
      details: parsed.error.flatten(),
    });
  }

  const wallet = normalizeWallet(parsed.data.wallet);
  if (!wallet) return jsonError("Invalid wallet address", 400);

  const minScore = parsed.data.minScore ?? 0;

  try {
    const data = await loadWalletProofData(wallet);
    const verified = data.reputation.score >= minScore;

    return jsonOk({
      wallet,
      verified,
      score: data.reputation.score,
      minScore,
      counts: data.reputation.counts,
    });
  } catch (err) {
    console.error("[verify]", err);
    return jsonError("Verification failed", 502);
  }
}
