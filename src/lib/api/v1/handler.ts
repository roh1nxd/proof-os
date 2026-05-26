import { NextResponse } from "next/server";

import { withCors } from "@/lib/api/cors";
import { getClientIp, jsonError } from "@/lib/api/response";
import { rateLimit } from "@/lib/security/rate-limit";
import { normalizeWallet } from "@/lib/security/wallet";

export async function v1Get(
  request: Request,
  rateKey: string,
  handler: () => Promise<unknown>,
): Promise<Response> {
  const ip = getClientIp(request);
  const limited = rateLimit(`v1:${rateKey}:${ip}`, 200, 60_000);
  if (!limited.ok) {
    return withCors(
      request,
      jsonError("Too many requests", 429, {
        retryAfterSec: limited.retryAfterSec,
      }),
    );
  }

  try {
    const data = await handler();
    return withCors(request, NextResponse.json({ ok: true, data }));
  } catch (err) {
    console.error(`[v1 ${rateKey}]`, err);
    return withCors(
      request,
      jsonError("Failed to read from Arkiv", 502, { code: "ARKIV_READ_ERROR" }),
    );
  }
}

export function v1WalletParam(raw: string): `0x${string}` | null {
  return normalizeWallet(decodeURIComponent(raw));
}
