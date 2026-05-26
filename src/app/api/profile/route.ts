import { normalizeSocialUrl } from "@/lib/profile/social";
import { getProfileBySlug, getProfileByWallet } from "@/lib/arkiv/queries";
import { createProfileEntity, updateProfileEntity } from "@/lib/arkiv/writes";
import { isArkivWriterConfigured } from "@/lib/arkiv/clients";
import { requireWalletSession } from "@/lib/auth/session";
import { getClientIp, jsonError, jsonOk } from "@/lib/api/response";
import { createProfileSchema, updateProfileSchema } from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`write:profile:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return jsonError("Too many requests", 429, {
      retryAfterSec: limited.retryAfterSec,
    });
  }

  if (!isArkivWriterConfigured()) {
    return jsonError("Arkiv writer not configured on server", 503);
  }

  let wallet: `0x${string}`;
  try {
    wallet = await requireWalletSession();
  } catch {
    return jsonError("Authentication required", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = createProfileSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, {
      details: parsed.error.flatten(),
    });
  }

  const existingSlug = await getProfileBySlug(parsed.data.slug);
  if (existingSlug) {
    return jsonError("Slug already taken", 409);
  }

  const existingWallet = await getProfileByWallet(wallet);
  if (existingWallet) {
    return jsonError("This wallet already has a profile", 409, {
      slug: existingWallet.attributes.slug,
    });
  }

  const d = parsed.data;

  try {
    const { entityKey, txHash } = await createProfileEntity(wallet, d.slug, {
      displayName: d.displayName,
      bio: d.bio,
      skills: d.skills,
      avatarUrl: d.avatarUrl,
      github: d.github?.trim() ? normalizeSocialUrl("github", d.github) : undefined,
      twitter: d.twitter?.trim() ? normalizeSocialUrl("twitter", d.twitter) : undefined,
      instagram: d.instagram?.trim()
        ? normalizeSocialUrl("instagram", d.instagram)
        : undefined,
      linkedin: d.linkedin?.trim() || undefined,
      website: d.website?.trim() || undefined,
      ens: d.ens,
    });

    return jsonOk({
      entityKey,
      txHash,
      slug: d.slug,
      wallet,
    });
  } catch (err) {
    console.error("[profile create]", err);
    const detail = err instanceof Error ? err.message : "Unknown error";
    return jsonError("Failed to write profile to Arkiv", 502, {
      code: "ARKIV_WRITE_ERROR",
      detail,
    });
  }
}

export async function GET() {
  let wallet: `0x${string}`;
  try {
    wallet = await requireWalletSession();
  } catch {
    return jsonError("Authentication required", 401);
  }

  const existing = await getProfileByWallet(wallet);
  if (!existing) {
    return jsonOk({ hasProfile: false, profile: null });
  }

  return jsonOk({
    hasProfile: true,
    slug: existing.attributes.slug,
    profile: existing.payload,
  });
}

export async function PUT(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`write:profile:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return jsonError("Too many requests", 429, {
      retryAfterSec: limited.retryAfterSec,
    });
  }

  if (!isArkivWriterConfigured()) {
    return jsonError("Arkiv writer not configured on server", 503);
  }

  let wallet: `0x${string}`;
  try {
    wallet = await requireWalletSession();
  } catch {
    return jsonError("Authentication required", 401);
  }

  const existing = await getProfileByWallet(wallet);
  if (!existing) {
    return jsonError("No profile found for this wallet. Create one first.", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, {
      details: parsed.error.flatten(),
    });
  }

  const d = parsed.data;
  const slug = existing.attributes.slug;

  try {
    const { entityKey, txHash } = await updateProfileEntity(wallet, slug, {
      displayName: d.displayName,
      bio: d.bio,
      skills: d.skills,
      avatarUrl: d.avatarUrl,
      github: d.github?.trim() ? normalizeSocialUrl("github", d.github) : undefined,
      twitter: d.twitter?.trim() ? normalizeSocialUrl("twitter", d.twitter) : undefined,
      instagram: d.instagram?.trim()
        ? normalizeSocialUrl("instagram", d.instagram)
        : undefined,
      linkedin: d.linkedin?.trim() || undefined,
      website: d.website?.trim() || undefined,
      ens: d.ens,
    });

    return jsonOk({
      entityKey,
      txHash,
      slug,
      wallet,
    });
  } catch (err) {
    console.error("[profile update]", err);
    const detail = err instanceof Error ? err.message : "Unknown error";
    return jsonError("Failed to update profile on Arkiv", 502, {
      code: "ARKIV_WRITE_ERROR",
      detail,
    });
  }
}
