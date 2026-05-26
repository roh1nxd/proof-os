import { notFound } from "next/navigation";

import { ProfileCard } from "@/components/profile-card";
import { getProfileBySlug } from "@/lib/arkiv/queries";
import { walletFromProfile } from "@/lib/arkiv/profile-wallet";
import { loadWalletProofData } from "@/lib/api/wallet-data";

type PageProps = { params: Promise<{ slug: string }> };

export default async function PublicProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug);
  if (!profile) notFound();

  const wallet = walletFromProfile(profile);
  if (!wallet) notFound();

  const data = await loadWalletProofData(wallet);

  return (
    <main>
      <ProfileCard
        slug={slug}
        wallet={wallet}
        profile={profile}
        reputation={data.reputation}
        contributions={data.contributions}
        endorsements={data.endorsementsReceived}
        badges={data.badges}
      />
    </main>
  );
}
