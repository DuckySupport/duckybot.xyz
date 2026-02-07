import { NextResponse } from "next/server";
import { signSessionJwt } from "@/lib/session";

type Body = {
  token: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Body>;

  if (!body?.token) {
    return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 });
  }

  const jwtToken = signSessionJwt({
    token: body.token
  });

  const res = NextResponse.json({ ok: true });

  res.cookies.set("ducky_token", jwtToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 604800,
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ducky_token", "", { path: "/", maxAge: 0 });
  return res;
}