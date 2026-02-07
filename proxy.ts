import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionJwt } from "@/lib/session";

const PROTECTED = ["/dashboard"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!PROTECTED.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get("ducky_token")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const payload = verifySessionJwt(token);
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};