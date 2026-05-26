import { createEndorsementEntity } from "@/lib/arkiv/writes";
import { isArkivWriterConfigured } from "@/lib/arkiv/clients";
import { requireWalletSession } from "@/lib/auth/session";
import { getClientIp, jsonError, jsonOk } from "@/lib/api/response";
import { createEndorsementSchema } from "@/lib/validation/schemas";
import { normalizeWallet } from "@/lib/security/wallet";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`write:endorsement:${ip}`, 20, 60_000);
  if (!limited.ok) {
    return jsonError("Too many requests", 429, {
      retryAfterSec: limited.retryAfterSec,
    });
  }

  if (!isArkivWriterConfigured()) {
    return jsonError("Arkiv writer not configured on server", 503);
  }

  let fromWallet: `0x${string}`;
  try {
    fromWallet = await requireWalletSession();
  } catch {
    return jsonError("Authentication required", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = createEndorsementSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, {
      details: parsed.error.flatten(),
    });
  }

  const toWallet = normalizeWallet(parsed.data.toWallet);
  if (!toWallet) return jsonError("Invalid recipient wallet", 400);

  if (toWallet.toLowerCase() === fromWallet.toLowerCase()) {
    return jsonError("Cannot endorse yourself", 400);
  }

  try {
    const { entityKey, txHash } = await createEndorsementEntity(
      fromWallet,
      toWallet,
      {
        message: parsed.data.message,
        skills: parsed.data.skills,
      },
    );
    return jsonOk({ entityKey, txHash, from: fromWallet, to: toWallet });
  } catch (err) {
    console.error("[endorsement create]", err);
    const detail = err instanceof Error ? err.message : "Unknown error";
    return jsonError("Failed to write endorsement to Arkiv", 502, {
      code: "ARKIV_WRITE_ERROR",
      detail,
    });
  }
}
