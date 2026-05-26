import { generateNonce } from "siwe";

import { getSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    const nonce = generateNonce();
    session.nonce = nonce;
    await session.save();
    return jsonOk({ nonce });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Session not configured";
    return jsonError(message, 500, {
      code: "SESSION_NOT_CONFIGURED",
      hint: "Set SESSION_SECRET (32+ chars) in .env.local",
    });
  }
}
