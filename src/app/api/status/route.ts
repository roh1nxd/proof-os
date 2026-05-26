import { braga } from "@arkiv-network/sdk/chains";

import { getRelayerAddress, isArkivWriterConfigured } from "@/lib/arkiv/clients";
import { isSessionSecretValid } from "@/lib/env/keys";
import { jsonOk } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  return jsonOk({
    service: "ProofOS",
    version: "1.0.0",
    config: {
      sessionConfigured: isSessionSecretValid(),
      sessionHint: isSessionSecretValid()
        ? "SESSION_SECRET is set"
        : "Run npm run setup or set SESSION_SECRET (32+ chars) in .env.local",
      arkivWriterConfigured: isArkivWriterConfigured(),
      relayerAddress: getRelayerAddress(),
    },
    arkiv: {
      role: "Primary database — all profiles, contributions, endorsements, and badges are stored as Arkiv entities",
      network: "braga",
      chainId: braga.id,
      rpc: braga.rpcUrls.default.http[0],
      explorer: braga.blockExplorers?.default?.url ?? null,
      docs: "https://docs.arkiv.network/",
      writerConfigured: isArkivWriterConfigured(),
      writerNote: isArkivWriterConfigured()
        ? "Server can write entities to Arkiv"
        : "Set ARKIV_PRIVATE_KEY in .env.local and fund with Braga GLM to enable saves",
    },
    publicApi: {
      baseUrl: "/api/v1",
      docs: "/developers",
      openApi: "/api/v1/openapi.json",
    },
  });
}
