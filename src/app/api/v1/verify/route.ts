import { NextResponse } from "next/server";

import { optionsResponse, withCors } from "@/lib/api/cors";
import { buildBuilderResponse } from "@/lib/api/v1/builder";
import { getClientIp, jsonError } from "@/lib/api/response";
import { verifyRequestSchema } from "@/lib/validation/schemas";
import { normalizeWallet } from "@/lib/security/wallet";
import { rateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return optionsResponse(request);
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`v1:verify:${ip}`, 100, 60_000);
  if (!limited.ok) {
    return withCors(
      request,
      jsonError("Too many requests", 429, {
        retryAfterSec: limited.retryAfterSec,
      }),
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withCors(request, jsonError("Invalid JSON body", 400));
  }

  const parsed = verifyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return withCors(
      request,
      jsonError("Validation failed", 400, {
        details: parsed.error.flatten(),
      }),
    );
  }

  const wallet = normalizeWallet(parsed.data.wallet);
  if (!wallet) {
    return withCors(request, jsonError("Invalid wallet address", 400));
  }

  const minScore = parsed.data.minScore ?? 0;

  try {
    const builder = await buildBuilderResponse(wallet);
    const verified = builder.reputation.score >= minScore;

    return withCors(
      request,
      NextResponse.json({
        ok: true,
        data: {
          wallet,
          verified,
          score: builder.reputation.score,
          minScore,
          counts: builder.reputation.counts,
        },
      }),
    );
  } catch (err) {
    console.error("[v1 verify]", err);
    return withCors(
      request,
      jsonError("Verification failed", 502, { code: "ARKIV_READ_ERROR" }),
    );
  }
}
