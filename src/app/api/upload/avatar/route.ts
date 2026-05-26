import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";

import { requireWalletSession } from "@/lib/auth/session";
import { getClientIp, jsonError, jsonOk } from "@/lib/api/response";
import { rateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function sniffMime(buf: Buffer): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50) return "image/png";
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46
  )
    return "image/webp";
  return null;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`upload:avatar:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return jsonError("Too many uploads", 429);
  }

  let wallet: `0x${string}`;
  try {
    wallet = await requireWalletSession();
  } catch {
    return jsonError("Connect wallet first", 401);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Invalid form data", 400);
  }

  const file = form.get("avatar");
  if (!(file instanceof File)) {
    return jsonError("Missing avatar file", 400);
  }

  if (file.size > MAX_BYTES) {
    return jsonError("Max file size is 2MB", 400);
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const mime = sniffMime(buf);
  if (!mime || !ALLOWED.has(mime)) {
    return jsonError("Only JPG, PNG, or WEBP allowed", 400);
  }

  const ext = ALLOWED.get(mime)!;
  const hash = createHash("sha256").update(wallet.toLowerCase()).digest("hex").slice(0, 16);
  const filename = `${hash}-${Date.now()}.${ext}`;
  const dir = join(process.cwd(), "public", "uploads", "avatars");

  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buf);

  const avatarUrl = `/uploads/avatars/${filename}`;
  return jsonOk({ avatarUrl });
}
