import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

function parseEnv(path) {
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const localPath = join(root, ".env.local");
const examplePath = join(root, ".env.example");

const local = parseEnv(localPath);
const example = parseEnv(examplePath);

const merged = {
  SESSION_SECRET:
    local.SESSION_SECRET ||
    example.SESSION_SECRET ||
    "",
  ARKIV_PRIVATE_KEY:
    local.ARKIV_PRIVATE_KEY || example.ARKIV_PRIVATE_KEY || "",
  NEXT_PUBLIC_APP_URL:
    local.NEXT_PUBLIC_APP_URL ||
    example.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",
  ARKIV_RPC_URL: local.ARKIV_RPC_URL || example.ARKIV_RPC_URL || "",
};

const lines = [
  "# ProofOS local config (auto-merged — do not commit)",
  `SESSION_SECRET=${merged.SESSION_SECRET}`,
  `NEXT_PUBLIC_APP_URL=${merged.NEXT_PUBLIC_APP_URL}`,
  "",
];

if (merged.ARKIV_PRIVATE_KEY) {
  const key = merged.ARKIV_PRIVATE_KEY.startsWith("0x")
    ? merged.ARKIV_PRIVATE_KEY
    : `0x${merged.ARKIV_PRIVATE_KEY}`;
  lines.push(`ARKIV_PRIVATE_KEY=${key}`);
} else {
  lines.push("# ARKIV_PRIVATE_KEY=");
}

if (merged.ARKIV_RPC_URL) {
  lines.push(`ARKIV_RPC_URL=${merged.ARKIV_RPC_URL}`);
}

writeFileSync(localPath, lines.join("\n") + "\n");
console.log("Wrote .env.local with:", Object.keys(merged).filter((k) => merged[k]).join(", "));

// Reset .env.example to safe placeholders (never real secrets)
writeFileSync(
  examplePath,
  `# Copy to .env.local — NEVER put real secrets here
SESSION_SECRET=

ARKIV_PRIVATE_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000

# ARKIV_RPC_URL=https://braga.hoodi.arkiv.network/rpc
`,
);
console.log("Reset .env.example to placeholders only.");
