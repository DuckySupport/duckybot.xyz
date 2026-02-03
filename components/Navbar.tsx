"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import { Icon } from "@iconify/react/offline";
import menuRounded from "@iconify/icons-material-symbols/menu-rounded";
import closeRounded from "@iconify/icons-material-symbols/close-rounded";

const navItems = [
  { label: "Documentation", href: "/docs" },
  { label: "Ducky Plus+", href: "/plus" },
  { label: "Support", href: "/support" },
];

const HIDDEN_ROUTES = new Set(["/login", "/not-found"]);
const HIDDEN_ROUTE_PREFIXES = ["/dashboard", "/settings"];

export default function Navbar() {
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const avatarUrl = session?.user?.image ?? "";
  const avatarAlt = session?.user?.name ?? "Account avatar";
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!avatarMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target as Node)
      ) {
        setAvatarMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAvatarMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [avatarMenuOpen]);

  useEffect(() => {
    if (!signOutOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSignOutOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [signOutOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("modal-open", signOutOpen);
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [signOutOpen]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("menu-open", mobileMenuOpen);
    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!pathname) return;
    setMobileMenuOpen(false);
    setAvatarMenuOpen(false);
  }, [pathname]);

  if (
    pathname &&
    (HIDDEN_ROUTES.has(pathname) ||
      HIDDEN_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix)))
  ) {
    return null;
  }

  return (
    <>
      <header className="site-nav island">
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
          <div className="relative flex items-center gap-3" ref={avatarMenuRef}>
            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-sm text-white/70 lg:hidden"
              aria-label="Open mobile menu"
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => {
                setAvatarMenuOpen(false);
                setSignOutOpen(false);
                setMobileMenuOpen((open) => !open);
              }}
            >
              <Icon icon={menuRounded} className="h-5 w-5" />
            </button>
            {avatarUrl ? (
              <>
                <button
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_30px_rgba(0,0,0,0.45)] transition hover:border-white/40"
                  type="button"
                  aria-label="Open account menu"
                  onClick={() => setAvatarMenuOpen((open) => !open)}
                >
                  <Image
                    src={avatarUrl}
                    alt={avatarAlt}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                </button>
                {avatarMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-44 rounded-xl border border-white/10 bg-[#0f0f0f] p-2 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
                    <a
                      href="/dashboard"
                      className="block rounded-lg px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                      onClick={() => setAvatarMenuOpen(false)}
                    >
                      Dashboard
                    </a>
                    <a
                      href="/settings"
                      className="block rounded-lg px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                      onClick={() => setAvatarMenuOpen(false)}
                    >
                      Settings
                    </a>
                    <button
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-red-400 transition hover:bg-white/10"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        setSignOutOpen(true);
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <a
                className="btn-glass rounded-full px-5 py-2 text-sm font-semibold text-white/90 transition hover:border-white/30 hover:text-white"
                href="/login"
              >
                Login
              </a>
            )}
          </div>
        </div>
      </header>
      {signOutOpen && (
        <>
          <div
            className="fixed inset-0 z-[30] bg-transparent"
            onClick={() => setSignOutOpen(false)}
          />
          <div
            className="fixed inset-0 z-[60] grid place-items-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
              <h3 className="text-lg font-semibold text-white">
                Are you sure you want to log out?
              </h3>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  className="btn-glass rounded-full px-5 py-2.5 text-sm"
                  onClick={() => setSignOutOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-full border border-red-400/40 bg-red-500/20 px-5 py-2.5 text-sm font-semibold text-red-100 transition hover:bg-red-500/30"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute right-6 top-6 text-white/70 transition hover:text-white"
            aria-label="Close mobile menu"
            type="button"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Icon icon={closeRounded} className="h-6 w-6" />
          </button>
          <nav className="flex flex-col items-center gap-6 sm:gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="nav-link text-xl text-white/70"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            {avatarUrl ? (
              <>
                <a
                  href="/dashboard"
                  className="nav-link text-xl text-white/70"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </a>
                <a
                  href="/settings"
                  className="nav-link text-xl text-white/70"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </a>
                <button
                  type="button"
                  className="nav-link text-xl text-red-400"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSignOutOpen(true);
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="btn-primary rounded-full px-6 py-3 text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </a>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
