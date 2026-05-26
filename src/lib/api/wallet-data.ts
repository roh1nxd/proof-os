import {
  getBadgesByWallet,
  getContributionsByWallet,
  getEndorsementsReceived,
  getProfileByWallet,
} from "@/lib/arkiv/queries";
import { computeReputation } from "@/lib/arkiv/reputation";

export async function loadWalletProofData(wallet: `0x${string}`) {
  const [profile, contributions, endorsementsReceived, badges] =
    await Promise.all([
      getProfileByWallet(wallet),
      getContributionsByWallet(wallet),
      getEndorsementsReceived(wallet),
      getBadgesByWallet(wallet),
    ]);

  const reputation = computeReputation({
    contributions,
    endorsementsReceived,
    badges,
    hasProfile: Boolean(profile),
  });

  return {
    wallet,
    profile,
    contributions,
    endorsementsReceived,
    badges,
    reputation,
  };
}
