"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#0f0f0f] p-10 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
          <div className="mb-6 flex flex-col items-center gap-3">
            <Link href="/" aria-label="Go home">
              <Image
                src="/fullDucky.png"
                alt="Ducky wordmark"
                width={150}
                height={42}
              />
            </Link>
          </div>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Login to Ducky
          </h1>
          <p className="mt-4 text-sm text-white/60 sm:text-base">
            Sign in with Discord to manage your server, subscriptions, and team
            tools.
          </p>
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
                <Link
                  className="text-white/80 hover:text-white"
                  href="/legal/terms"
                  style={{ textDecoration: "underline", textUnderlineOffset: "4px" }}
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  className="text-white/80 hover:text-white"
                  href="/legal/privacy"
                  style={{ textDecoration: "underline", textUnderlineOffset: "4px" }}
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>
          <div className="mt-6">
            <button
              className="rounded-full bg-[#5865F2] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4c57d9] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!agreed}
            >
              Continue with Discord
            </button>
          </div>
          <div className="mt-6 text-xs text-white/50">
            Need help?{" "}
            <Link className="text-white/70 hover:text-white" href="/support">
              Contact support
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
