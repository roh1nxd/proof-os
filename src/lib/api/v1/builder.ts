import { loadWalletProofData } from "@/lib/api/wallet-data";
import { getProfileBySlug } from "@/lib/arkiv/queries";
import { walletFromProfile } from "@/lib/arkiv/profile-wallet";
import { braga } from "@arkiv-network/sdk/chains";
import { isArkivWriterConfigured } from "@/lib/arkiv/clients";

export async function buildBuilderResponse(wallet: `0x${string}`) {
  const data = await loadWalletProofData(wallet);

  return {
    wallet,
    dataSource: {
      network: "arkiv",
      chain: "braga",
      chainId: braga.id,
      explorer: braga.blockExplorers?.default?.url ?? null,
      rpc: braga.rpcUrls.default.http[0],
    },
    profile: data.profile
      ? {
          slug: data.profile.attributes.slug ?? null,
          entityKey: data.profile.entityKey,
          arkivUrl: entityExplorerUrl(data.profile.entityKey),
          ...data.profile.payload,
        }
      : null,
    reputation: data.reputation,
    contributions: data.contributions.map((c: { entityKey: string; payload: Record<string, unknown> }) => ({
      entityKey: c.entityKey,
      arkivUrl: entityExplorerUrl(c.entityKey),
      ...c.payload,
    })),
    endorsements: data.endorsementsReceived.map((e: { entityKey: string; attributes: { from?: string }; payload: Record<string, unknown> }) => ({
      entityKey: e.entityKey,
      arkivUrl: entityExplorerUrl(e.entityKey),
      from: e.attributes.from ?? null,
      ...e.payload,
    })),
    badges: data.badges.map((b: { entityKey: string; payload: Record<string, unknown> }) => ({
      entityKey: b.entityKey,
      arkivUrl: entityExplorerUrl(b.entityKey),
      ...b.payload,
    })),
    meta: {
      arkivWriterConfigured: isArkivWriterConfigured(),
      queriedAt: new Date().toISOString(),
    },
  };
}

export async function buildProfileBySlugResponse(slug: string) {
  const profile = await getProfileBySlug(slug);
  if (!profile) return null;

  const wallet = walletFromProfile(profile);
  if (!wallet) return null;

  const builder = await buildBuilderResponse(wallet);
  return { slug, ...builder };
}

function entityExplorerUrl(entityKey: string): string {
  const base =
    braga.blockExplorers?.default?.url ??
    "https://explorer.braga.hoodi.arkiv.network";
  return `${base}/entity/${entityKey}`;
}
