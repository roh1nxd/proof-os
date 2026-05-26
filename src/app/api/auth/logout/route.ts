import { getSession } from "@/lib/auth/session";
import { jsonOk } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  session.destroy();
  await session.save();
  return jsonOk({ loggedOut: true });
}
