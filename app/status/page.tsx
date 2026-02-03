"use client";

import { useEffect, useState } from "react";

import { Icon } from "@iconify/react/offline";
import chevronRight from "@iconify/icons-material-symbols/chevron-right";

const STATUS_URL = "https://status.duckybot.xyz/";

export default function StatusRedirectPage() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    window.location.replace(STATUS_URL);
    
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
          You're being redirected to our status page.
        </p>
        <div className="mt-8 h-[48px]">
          {showButton && (
            <a
              className="btn-transparent animate-fade-in group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm sm:px-6 sm:py-2 sm:text-base"
              href={STATUS_URL}
            >
              <span>Didn't get redirected? Click here.</span>
              <Icon icon={chevronRight} className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}