"use client";

import { useEffect, useState } from "react";

const DOCS_URL = "https://docs.duckybot.xyz/overview/welcome";

export default function DocsRedirectPage() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    window.location.replace(DOCS_URL);
    
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Redirecting...</h1>
        <p className="mt-4 text-sm text-white/60 sm:text-base">
          You're being redirected to our documentation.
        </p>
        <div className="mt-8 h-[48px]">
          {showButton && (
            <a
              className="btn-transparent animate-fade-in inline-flex items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base"
              href={DOCS_URL}
            >
              Didn't get redirected? Click here.
            </a>
          )}
        </div>
      </div>
    </div>
  );
}