import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySessionJwt } from "@/lib/session";

type MeResponse = {
  data?: {
    username: string;
    name: string;
    id: string;
    avatar: string;
  };
};

export async function GET() {
  const tokenJwt = (await cookies()).get("ducky_token")?.value;
  if (!tokenJwt) return NextResponse.json({ authenticated: false });

  let apiToken: string | undefined;

  try {
    const decoded = verifySessionJwt(tokenJwt);
    if (!decoded) return NextResponse.json({ authenticated: false });
    apiToken = decoded.token;
  } catch {
    return NextResponse.json({ authenticated: false });
  }

  if (!apiToken) return NextResponse.json({ authenticated: false });

  try {
    const r = await fetch("https://api.duckybot.xyz/users/@me", {
      method: "GET",
      headers: {
        Token: apiToken,
      },
      cache: "no-store",
    });

    if (!r.ok) return NextResponse.json({ authenticated: false });

    const json = (await r.json()) as MeResponse;
    const me = json?.data;

    if (!me?.id) return NextResponse.json({ authenticated: false });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: me.id,
        name: me.name || me.username,
        username: me.username,
        avatar: me.avatar,
      },
      tokenId: apiToken,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}