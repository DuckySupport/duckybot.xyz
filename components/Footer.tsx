"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react/offline";
import arrowUpRight from "@iconify/icons-tabler/arrow-up-right";
import mailFilled from "@iconify/icons-tabler/mail-filled";
import discord from "@iconify/icons-fa-brands/discord";
import github from "@iconify/icons-fa-brands/github";

const footerLinks = [
  {
    title: "Resources",
    items: [
      { label: "Documentation", href: "/docs" },
      { label: "Support", href: "/support" },
      { label: "Add Ducky", href: "/invite" },
      { label: "Changelogs", href: "/changelogs" },
      { label: "Status", href: "/status" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Relations",
    items: [
      { label: "Affiliates", href: "/affiliates" },
      { label: "Partners", href: "/partners" },
      { label: "Team", href: "/team" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Contact Us", href: "/support" },
    ],
  },
];

const STATS_API = "https://api.duckybot.xyz/statistics";
const FALLBACK_VERSION = "v1.6.0 Stable";

type StatsResponse = {
  data?: {
    version?: string;
  };
};

function formatBuildDate(value?: string) {
  if (!value) return "Unknown";
  const numeric = Number(value);
  const date = Number.isNaN(numeric)
    ? new Date(value)
    : new Date(numeric < 10_000_000_000 ? numeric * 1000 : numeric);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Footer() {
  const [version, setVersion] = useState(FALLBACK_VERSION);

  useEffect(() => {
    let ignore = false;
    const loadStats = async () => {
      try {
        const response = await fetch(STATS_API);
        if (!response.ok) return;
        const json = (await response.json()) as StatsResponse;
        const nextVersion = json?.data?.version;
        if (!ignore && typeof nextVersion === "string") {
          setVersion(nextVersion);
        }
      } catch {
        // Keep fallback version on failure.
      }
    };
    loadStats();
    return () => {
      ignore = true;
    };
  }, []);

  const branch = process.env.NEXT_PUBLIC_GIT_BRANCH || "Unknown";
  const commit = process.env.NEXT_PUBLIC_GIT_COMMIT_SHA || "Unknown";
  const commitShort = commit === "Unknown" ? commit : `${commit.slice(0, 7)}…`;
  const buildDate = formatBuildDate(process.env.NEXT_PUBLIC_BUILD_DATE);

  return (
    <footer className="mt-24 border-t border-white/10 px-6 py-16 md:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm space-y-4">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <Image
                src="/assets/fullDucky.png"
                alt="Ducky wordmark"
                width={120}
                height={34}
              />
            </div>
            <p className="text-sm text-white/60">
              Power your server with Ducky, a multipurpose bot focused on
              seamlessly integrating Discord and ERLC server automation for
              effortless management.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 md:grid-cols-3">
            {footerLinks.map((group) => (
              <div key={group.title} className="space-y-3 text-sm">
                <p className="font-semibold text-white">{group.title}</p>
                <ul className="space-y-2 text-white/60">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <a className="footer-link" href={item.href}>
                        {item.label}
                        <Icon icon={arrowUpRight} className="footer-link-icon" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row">
          <span>© 2026 Ducky Bot. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-4 text-white/60">
            <a href="https://docs.duckybot.xyz/overview/changelogs" className="group relative inline-flex items-center">
              <span
                className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition group-hover:border-white/20 group-hover:text-white"
                tabIndex={0}
                aria-describedby="build-info"
              >
                {version}
              </span>
              <div
                id="build-info"
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 w-52 -translate-x-1/2 rounded-xl border border-white/10 bg-[#0f0f0f] p-3 text-[11px] text-white/70 opacity-0 shadow-[0_16px_40px_rgba(0,0,0,0.55)] transition group-hover:opacity-100 group-focus-within:opacity-100"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-white/60">
                    <span>Branch</span>
                    <span className="text-white">{branch}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/60">
                    <span>Commit</span>
                    <span className="text-white">{commitShort}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/60">
                    <span>Build</span>
                    <span className="text-white">{buildDate}</span>
                  </div>
                </div>
              </div>
            </a>
            <a
              href="/status"
              className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs transition-colors hover:bg-success/20 !text-success"
            >
              <span className="h-2 w-2 rounded-full bg-success" />
              Status: Operational
            </a>
            <div className="flex items-center gap-3 text-white/60">
              <a href="/support">
                <Icon icon={discord} className="h-4 w-4 transition hover:text-white/100" />
              </a>
              <a
                className="transition hover:text-white"
                href="https://github.com/orgs/DuckySupport"
              >
                <Icon icon={github} className="h-4 w-4 transition hover:text-white/100" />
              </a>
              <a
                className="transition hover:text-white"
                href="mailto:support@duckybot.xyz"
              >
                <Icon icon={mailFilled} className="h-4 w-4 transition hover:text-white/100" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
