import { getAddress, isAddress } from "viem";

export function normalizeWallet(input: string): `0x${string}` | null {
  if (!isAddress(input)) return null;
  return getAddress(input);
}

export function walletQueryKey(wallet: `0x${string}`): string {
  return wallet.toLowerCase();
}
