import { NextResponse } from "next/server";

import { withCors } from "@/lib/api/cors";

export const dynamic = "force-dynamic";

const spec = {
  openapi: "3.0.3",
  info: {
    title: "ProofOS Public API",
    version: "1.0.0",
    description:
      "Proof-of-work identity API. All data is read from Arkiv Braga DB-chain entities.",
  },
  servers: [{ url: "/api/v1", description: "ProofOS v1" }],
  paths: {
    "/builders/{wallet}": {
      get: {
        summary: "Full builder profile (Arkiv-backed)",
        parameters: [
          {
            name: "wallet",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
      },
    },
    "/profiles/{slug}": {
      get: {
        summary: "Builder by public slug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
      },
    },
    "/reputation/{wallet}": {
      get: { summary: "Trust score and breakdown" },
    },
    "/contributions/{wallet}": {
      get: { summary: "Contribution proofs" },
    },
    "/endorsements/{wallet}": {
      get: { summary: "Endorsements received" },
    },
    "/verify": {
      post: {
        summary: "Verify builder meets minimum score",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["wallet"],
                properties: {
                  wallet: { type: "string" },
                  minScore: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
  },
};

export async function GET(request: Request) {
  return withCors(request, NextResponse.json(spec));
}

export async function OPTIONS(request: Request) {
  return withCors(request, new Response(null, { status: 204 }));
}
