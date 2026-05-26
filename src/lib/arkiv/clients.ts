import { createPublicClient, createWalletClient, http } from "@arkiv-network/sdk";
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts";
import { braga } from "@arkiv-network/sdk/chains";

import { normalizePrivateKey } from "@/lib/env/keys";

function rpcTransport() {
  const url = process.env.ARKIV_RPC_URL;
  return http(url ? url : undefined);
}

let publicClient: ReturnType<typeof createPublicClient> | null = null;

export function getPublicClient() {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: braga,
      transport: rpcTransport(),
    });
  }
  return publicClient;
}

let walletClient: ReturnType<typeof createWalletClient> | null = null;

/** Server-only writer — requires ARKIV_PRIVATE_KEY with Braga GLM */
export function getWalletClient() {
  const key = normalizePrivateKey(process.env.ARKIV_PRIVATE_KEY);
  if (!key) {
    throw new Error(
      "ARKIV_PRIVATE_KEY is not configured (64-char hex, with or without 0x)",
    );
  }
  if (!walletClient) {
    walletClient = createWalletClient({
      chain: braga,
      transport: rpcTransport(),
      account: privateKeyToAccount(key),
    });
  }
  return walletClient;
}

export function isArkivWriterConfigured(): boolean {
  return normalizePrivateKey(process.env.ARKIV_PRIVATE_KEY) !== null;
}

export function getRelayerAddress(): string | null {
  const key = normalizePrivateKey(process.env.ARKIV_PRIVATE_KEY);
  if (!key) return null;
  try {
    return privateKeyToAccount(key).address;
  } catch {
    return null;
  }
}
