"use client";

import { useEffect } from "react";

const DOCS_URL = "https://docs.duckybot.xyz/overview/welcome";

export default function DocsRedirectPage() {
  useEffect(() => {
    window.location.replace(DOCS_URL);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Redirecting...</h1>
        <p className="mt-4 text-sm text-white/60 sm:text-base">
          Taking you to the Ducky documentation.
        </p>
        <a
          className="btn-glass mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base"
          href={DOCS_URL}
        >
          Continue to docs
        </a>
      </div>
    </div>
  );
}
