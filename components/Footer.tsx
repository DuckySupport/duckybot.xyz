import Image from "next/image";
import { ArrowUpRight, Github, Mail, MessageSquare } from "lucide-react";

const footerLinks = [
  {
    title: "Resources",
    items: [
      { label: "Documentation", href: "/docs" },
      { label: "Support", href: "/support" },
      { label: "Add Ducky", href: "/invite" },
      { label: "Changelogs", href: "/changelogs" },
      { label: "Status", href: "/status" },
      { label: "Opportunities", href: "/opportunities" },
    ],
  },
  {
    title: "Relations",
    items: [
      { label: "Affiliates", href: "/affiliates" },
      { label: "Partners", href: "/partners" },
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

export default function Footer() {
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
                        <ArrowUpRight className="footer-link-icon" />
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
            <span>v1.6.0 Stable</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Status: Operational
              </span>
            <div className="flex items-center gap-3 text-white/60">
              <a className="transition hover:text-white" href="/support">
                <MessageSquare className="h-4 w-4" />
              </a>
              <a
                className="transition hover:text-white"
                href="https://github.com/orgs/DuckySupport"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                className="transition hover:text-white"
                href="mailto:support@duckybot.xyz"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

