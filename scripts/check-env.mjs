import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const envPath = join(root, ".env.local");

function loadEnv(path) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnv(envPath);
process.env.SESSION_SECRET = env.SESSION_SECRET;
process.env.ARKIV_PRIVATE_KEY = env.ARKIV_PRIVATE_KEY;
process.env.NEXT_PUBLIC_APP_URL = env.NEXT_PUBLIC_APP_URL;

function normalizePrivateKey(raw) {
  if (!raw?.trim()) return null;
  const hex = raw.trim().startsWith("0x") ? raw.trim().slice(2) : raw.trim();
  if (!/^[a-fA-F0-9]{64}$/.test(hex)) return null;
  return `0x${hex}`;
}

const session = env.SESSION_SECRET ?? "";
const key = normalizePrivateKey(env.ARKIV_PRIVATE_KEY);

let ok = true;
if (session.length < 32) {
  console.log("FAIL SESSION_SECRET: need 32+ chars");
  ok = false;
} else {
  console.log("OK   SESSION_SECRET");
}

if (!key) {
  console.log("FAIL ARKIV_PRIVATE_KEY: missing or invalid (need 64 hex chars)");
  ok = false;
} else {
  console.log("OK   ARKIV_PRIVATE_KEY");
  const { privateKeyToAccount } = await import("@arkiv-network/sdk/accounts");
  const addr = privateKeyToAccount(key).address;
  console.log("     Relayer:", addr);
}

console.log("OK   NEXT_PUBLIC_APP_URL:", env.NEXT_PUBLIC_APP_URL || "(default)");

if (ok && key) {
  try {
    const { createPublicClient, http } = await import("@arkiv-network/sdk");
    const { braga } = await import("@arkiv-network/sdk/chains");
    const client = createPublicClient({ chain: braga, transport: http() });
    const count = await client.getEntityCount();
    console.log("OK   Arkiv RPC reachable, entity count:", String(count));
  } catch (e) {
    console.log("WARN Arkiv RPC:", e.message);
  }
}

process.exit(ok ? 0 : 1);
