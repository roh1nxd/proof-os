import { getSession } from "@/lib/auth/session";
import { jsonOk } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    return jsonOk({
      authenticated: Boolean(session.wallet),
      wallet: session.wallet ?? null,
    });
  } catch {
    return jsonOk({ authenticated: false, wallet: null });
  }
}
