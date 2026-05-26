import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  wallet?: `0x${string}`;
  nonce?: string;
};

const sessionOptions = {
  password: process.env.SESSION_SECRET ?? "",
  cookieName: "proofos_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession() {
  if (!sessionOptions.password || sessionOptions.password.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireWalletSession(): Promise<`0x${string}`> {
  const session = await getSession();
  if (!session.wallet) {
    throw new Error("UNAUTHORIZED");
  }
  return session.wallet;
}
