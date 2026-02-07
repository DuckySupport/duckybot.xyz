"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react/offline";
import Discord from "@iconify/icons-fa-brands/discord";

function generateState(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);

  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function buildDiscordAuthorizeUrl(state: string) {
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI!);
  url.searchParams.set("scope", "identify guilds");
  url.searchParams.set("state", state);
  return url.toString();
}

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const code = params.get("code");
  const stateFromDiscord = params.get("state");

  const state = useMemo(() => generateState(32), []);

  useEffect(() => {
    fetch("/api/session/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((me) => {
        if (me?.authenticated) router.replace("/dashboard");
      })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    if (!code) return;
    if (!stateFromDiscord) {
      setError("Missing state from Discord.");
      return;
    }

    const expected = sessionStorage.getItem("ducky_oauth_state");
    if (!expected || expected !== stateFromDiscord) {
      setError("State mismatch (possible CSRF). Try again.");
      return;
    }

    setBusy(true);
    setError(null);

    (async () => {
      const r = await fetch("https://api.duckybot.xyz/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Discord-Code": code,
        }
      });

      const data = await r.json();

      if (!r.ok || data?.code !== 200 || !data?.data?.token || !data?.data?.user) {
        setBusy(false);
        setError("Auth failed. Please try again.");
        return;
      }

      const r2 = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: data.data.token
        }),
      });

      if (!r2.ok) {
        setBusy(false);
        setError("Could not create session. Please try again.");
        return;
      }

      sessionStorage.removeItem("ducky_oauth_state");
      router.replace("/dashboard");
    })().catch(() => {
      setBusy(false);
      setError("Unexpected error. Please try again.");
    });
  }, [code, stateFromDiscord, router]);

  const startLogin = () => {
    setError(null);
    sessionStorage.setItem("ducky_oauth_state", state);
    window.location.assign(buildDiscordAuthorizeUrl(state));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-16">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Link href="/" aria-label="Go home">
            <Image src="/assets/fullDucky.png" alt="Ducky wordmark" width={150} height={42} />
          </Link>
        </div>

        <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#0f0f0f] p-10 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
          <h1 className="text-3xl font-semibold sm:text-4xl">Login to Ducky</h1>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-left text-sm text-white/70">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border border-white/20 bg-black/60 accent-[var(--accent)]"
              />
              <span>
                I agree to the{" "}
                <Link className="text-white/80 hover:text-white" href="/legal/terms" style={{ textDecoration: "underline", textUnderlineOffset: "4px" }}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link className="text-white/80 hover:text-white" href="/legal/privacy" style={{ textDecoration: "underline", textUnderlineOffset: "4px" }}>
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>

          <div className="mt-6">
            <button
              onClick={startLogin}
              disabled={!agreed || busy}
              className="group flex w-full items-center justify-center rounded-2xl border border-[#5865F2] bg-[#5865F2] px-5 py-3 text-sm font-semibold text-white transition enabled:hover:bg-[#4c57d9] enabled:hover:-translate-y-[3px] enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon icon={Discord} className="mr-2 h-6 w-6" />
              {busy ? "Signing you in..." : "Continue with Discord"}
            </button>
          </div>
        </div>

        <div className="mt-4 text-xs text-white/50">
          Need help?{" "}
          <Link className="text-white/70 hover:text-white" href="/support">
            Contact support
          </Link>
          .
        </div>
      </div>
    </div>
  );
}