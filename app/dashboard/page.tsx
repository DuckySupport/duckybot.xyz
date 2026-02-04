"use client";

import Image from "next/image";
import Link from "next/link";

import { Icon } from "@iconify/react/offline";
import chevronRight from "@iconify/icons-material-symbols/chevron-right";

import Footer from "@/components/Footer";

export default function DashboardComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex flex-col items-center">
          <div className="mb-2 flex items-center justify-center">
            <Image
              src="/assets/fullDucky.png"
              alt="Ducky wordmark"
              width={200}
              height={92}
              priority
            />
          </div>
          <div className="mt-4 h-px w-40 rounded-full bg-white/15 transition-all duration-300 ease-out" />
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Coming Soon
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/60 sm:text-base">
            We're hard at work building a dashboard to moderate & automate your server with ease.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary rounded-full px-6 py-3 text-sm">
              Home
            </Link>
            <Link
              href="/support"
              className="btn-glass group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm"
            >
              Support
              <Icon
                icon={chevronRight}
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
          </Link>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
