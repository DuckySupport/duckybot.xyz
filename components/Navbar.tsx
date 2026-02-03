"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react/offline";
import menuRounded from "@iconify/icons-material-symbols/menu-rounded";

const navItems = [
  { label: "Documentation", href: "/docs" },
  { label: "Ducky Plus+", href: "/plus" },
  { label: "Support", href: "/support" },
];

export default function Navbar() {
  const [isDocked, setIsDocked] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsDocked(window.scrollY > 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-nav ${isDocked ? "island" : ""}`}>
      <div className="nav-inner">
        <a href="/" className="flex items-center gap-3" aria-label="Go home">
          <Image
            src="/assets/fullDucky.png"
            alt="Ducky wordmark"
            width={140}
            height={40}
            priority
          />
        </a>
        <nav className="hidden items-center gap-8 text-sm text-white/70 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              className="transition hover:text-white"
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-sm text-white/70 lg:hidden"
            aria-label="Open mobile menu"
            type="button"
          >
            <Icon icon={menuRounded} className="h-5 w-5" />
          </button>
          <a
            className="glass-pill rounded-full px-5 py-2 text-sm font-semibold text-white/90 transition hover:border-white/30 hover:text-white"
            href="/login"
          >
            Login
          </a>
        </div>
      </div>
    </header>
  );
}

