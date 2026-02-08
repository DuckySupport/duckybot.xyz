import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySessionJwt } from "@/lib/session";

async function getToken() {
  const tokenJwt = (await cookies()).get("ducky_token")?.value;
  if (!tokenJwt) return null;
  const decoded = verifySessionJwt(tokenJwt);
  if (!decoded?.token) return null;
  return decoded.token;
}

export async function GET() {
  const token = await getToken();
  if (!token) return NextResponse.json({ code: 401, message: "Unauthorized" }, { status: 401 });

  const meRes = await fetch("https://api.duckybot.xyz/users/@me", {
    method: "GET",
    headers: { Token: token },
    cache: "no-store",
  });

  if (!meRes.ok) {
    return NextResponse.json({ code: 401, message: "Unauthorized" }, { status: 401 });
  }

  const meJson = await meRes.json().catch(() => null) as any;
  const discordId = meJson?.data?.id as string | undefined;

  if (!discordId) {
    return NextResponse.json({ code: 401, message: "Unauthorized" }, { status: 401 });
  }

  const linkRes = await fetch(`https://api.duckybot.xyz/links/${discordId}`, {
    method: "GET",
    headers: { Token: token },
    cache: "no-store",
  });

  const linkJson = await linkRes.json().catch(() => null);
  return NextResponse.json(linkJson ?? {}, { status: linkRes.status });
}

export async function POST(req: Request) {
  const token = await getToken();
  if (!token) return NextResponse.json({ code: 401, message: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { robloxCode?: string } | null;
  const robloxCode = body?.robloxCode;

  if (!robloxCode) {
    return NextResponse.json({ code: 400, message: "Missing robloxCode" }, { status: 400 });
  }

  const r = await fetch("https://api.duckybot.xyz/links", {
    method: "POST",
    headers: {
      Token: token,
      "Roblox-Code": robloxCode,
    },
    cache: "no-store",
  });

  const json = await r.json().catch(() => null);
  return NextResponse.json(json ?? {}, { status: r.status });
}

export async function DELETE() {
  const token = await getToken();
  if (!token) return NextResponse.json({ code: 401, message: "Unauthorized" }, { status: 401 });

  const r = await fetch("https://api.duckybot.xyz/links", {
    method: "DELETE",
    headers: { Token: token },
    cache: "no-store",
  });

  const json = await r.json().catch(() => null);
  return NextResponse.json(json ?? {}, { status: r.status });
}
