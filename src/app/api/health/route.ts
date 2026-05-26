import { getRelayerAddress, isArkivWriterConfigured } from "@/lib/arkiv/clients";
import { isSessionSecretValid } from "@/lib/env/keys";
import { jsonOk } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  const issues: string[] = [];

  if (!isSessionSecretValid()) {
    issues.push("SESSION_SECRET missing or too short in .env.local");
  }

  if (!isArkivWriterConfigured()) {
    issues.push(
      "ARKIV_PRIVATE_KEY missing or invalid in .env.local (not .env.example)",
    );
  }

  const relayer = getRelayerAddress();

  let arkivReachable = false;
  if (isArkivWriterConfigured()) {
    try {
      const { getPublicClient } = await import("@/lib/arkiv/clients");
      const client = getPublicClient();
      await client.getEntityCount();
      arkivReachable = true;
    } catch {
      issues.push("Cannot reach Arkiv RPC — check network or ARKIV_RPC_URL");
    }
  }

  const ready =
    isSessionSecretValid() && isArkivWriterConfigured() && arkivReachable;

  return jsonOk({
    ready,
    session: isSessionSecretValid(),
    arkivWriter: isArkivWriterConfigured(),
    arkivReachable,
    relayerAddress: relayer,
    issues,
    hint: issues.length
      ? "Put secrets in .env.local then restart: npm run dev"
      : "All systems go",
  });
}
