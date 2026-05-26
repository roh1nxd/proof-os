import { NextResponse } from "next/server";

import { optionsResponse, withCors } from "@/lib/api/cors";
import { buildProfileBySlugResponse } from "@/lib/api/v1/builder";
import { getClientIp, jsonError } from "@/lib/api/response";
import { rateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function OPTIONS(request: Request) {
  return optionsResponse(request);
}

export async function GET(request: Request, { params }: Params) {
  const ip = getClientIp(request);
  const limited = rateLimit(`v1:profile:${ip}`, 200, 60_000);
  if (!limited.ok) {
    return withCors(
      request,
      jsonError("Too many requests", 429, {
        retryAfterSec: limited.retryAfterSec,
      }),
    );
  }

  const { slug } = await params;

  try {
    const data = await buildProfileBySlugResponse(slug);
    if (!data) {
      return withCors(request, jsonError("Profile not found", 404));
    }
    return withCors(request, NextResponse.json({ ok: true, data }));
  } catch (err) {
    console.error("[v1 profile]", err);
    return withCors(
      request,
      jsonError("Failed to read from Arkiv", 502, { code: "ARKIV_READ_ERROR" }),
    );
  }
}
