import { SiweMessage } from "siwe";

import { getAddress, isAddress } from "viem";

export type SiweVerifyResult =
  | { ok: true; wallet: `0x${string}` }
  | { ok: false; code: string; message: string };

/**
 * Verifies SIWE signature + session nonce.
 * Domain is taken from the signed message (not env) so localhost / 127.0.0.1 both work.
 */
export async function verifySiweMessage(
  message: string,
  signature: string,
  expectedNonce: string,
): Promise<SiweVerifyResult> {
  try {
    const siwe = new SiweMessage(message);

    const result = await siwe.verify({
      signature,
      nonce: expectedNonce,
    });

    if (!result.success) {
      return {
        ok: false,
        code: "SIWE_VERIFY_FAILED",
        message: "Signature verification failed",
      };
    }

    if (!isAddress(siwe.address)) {
      return {
        ok: false,
        code: "INVALID_ADDRESS",
        message: "Invalid address in SIWE message",
      };
    }

    return { ok: true, wallet: getAddress(siwe.address) };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "SIWE verification failed";
    return { ok: false, code: "SIWE_ERROR", message };
  }
}
