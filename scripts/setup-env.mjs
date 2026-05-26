import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const envPath = join(root, ".env.local");
const examplePath = join(root, ".env.example");

const secret = randomBytes(32).toString("base64url");

let content = "";
if (existsSync(envPath)) {
  content = readFileSync(envPath, "utf8");
  if (/SESSION_SECRET=.+/.test(content) && !/SESSION_SECRET=\s*$/.test(content)) {
    console.log(".env.local already has SESSION_SECRET — leaving it.");
  } else {
    content = content.replace(
      /SESSION_SECRET=.*/,
      `SESSION_SECRET=${secret}`,
    );
    writeFileSync(envPath, content);
    console.log("Updated SESSION_SECRET in .env.local");
  }
} else if (existsSync(examplePath)) {
  content = readFileSync(examplePath, "utf8");
  content = content.replace(/SESSION_SECRET=\s*$/, `SESSION_SECRET=${secret}`);
  writeFileSync(envPath, content);
  console.log("Created .env.local with a new SESSION_SECRET");
} else {
  writeFileSync(
    envPath,
    `SESSION_SECRET=${secret}\nNEXT_PUBLIC_APP_URL=http://localhost:3000\nARKIV_PRIVATE_KEY=\n`,
  );
  console.log("Created .env.local");
}

console.log("\nNext steps:");
console.log("  1. Add ARKIV_PRIVATE_KEY (test wallet) to .env.local");
console.log("  2. Fund it with Braga GLM — https://docs.arkiv.network/");
console.log("  3. npm run dev → http://localhost:3000/dashboard");
