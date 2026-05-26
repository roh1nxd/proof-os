import { createContributionEntity } from "@/lib/arkiv/writes";
import { isArkivWriterConfigured } from "@/lib/arkiv/clients";
import { requireWalletSession } from "@/lib/auth/session";
import { getClientIp, jsonError, jsonOk } from "@/lib/api/response";
import { createContributionSchema } from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`write:contribution:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return jsonError("Too many requests", 429, {
      retryAfterSec: limited.retryAfterSec,
    });
  }

  if (!isArkivWriterConfigured()) {
    return jsonError("Arkiv writer not configured on server", 503);
  }

  let wallet: `0x${string}`;
  try {
    wallet = await requireWalletSession();
  } catch {
    return jsonError("Authentication required", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = createContributionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, {
      details: parsed.error.flatten(),
    });
  }

  try {
    const { entityKey, txHash } = await createContributionEntity(
      wallet,
      parsed.data,
    );
    return jsonOk({ entityKey, txHash, wallet });
  } catch (err) {
    console.error("[contribution create]", err);
    const detail = err instanceof Error ? err.message : "Unknown error";
    return jsonError("Failed to write contribution to Arkiv", 502, {
      code: "ARKIV_WRITE_ERROR",
      detail,
    });
  }
}
