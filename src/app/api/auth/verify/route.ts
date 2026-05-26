import { verifySiweMessage } from "@/lib/auth/siwe-verify";
import { getSession } from "@/lib/auth/session";
import { getClientIp, jsonError, jsonOk } from "@/lib/api/response";
import { rateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`auth:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return jsonError("Too many requests", 429, {
      retryAfterSec: limited.retryAfterSec,
    });
  }

  let body: { message?: string; signature?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  if (!body.message || !body.signature) {
    return jsonError("message and signature are required", 400);
  }

  try {
    const session = await getSession();
    if (!session.nonce) {
      return jsonError(
        "Missing nonce — open dashboard and click Connect again",
        400,
        { code: "NONCE_MISSING" },
      );
    }

    const verified = await verifySiweMessage(
      body.message,
      body.signature,
      session.nonce,
    );

    if (!verified.ok) {
      return jsonError(verified.message, 401, { code: verified.code });
    }

    session.wallet = verified.wallet;
    session.nonce = undefined;
    await session.save();

    return jsonOk({ wallet: verified.wallet, authenticated: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Session configuration error";
    return jsonError(message, 500, { code: "SESSION_ERROR" });
  }
}
