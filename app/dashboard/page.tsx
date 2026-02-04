"use client";

import Image from "next/image";
import Link from "next/link";

import Footer from "@/components/Footer";

export default function DashboardComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="group flex flex-col items-center">
          <div className="mb-6 flex items-center justify-center">
            <Image
              src="/assets/fullDucky.png"
              alt="Ducky wordmark"
              width={150}
              height={42}
              priority
            />
          </div>
          <p className="text-lg font-medium text-white/70 sm:text-xl">
            Ducky dashboard
          </p>
          <div className="mt-4 h-px w-20 rounded-full bg-white/15 transition-all duration-300 ease-out group-hover:w-40" />
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Coming Soon
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/60 sm:text-base">
            We are building a unified dashboard for managing your servers,
            Plus+ slots, and automations. Check back soon.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="btn-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base"
            >
              Back to Home
            </Link>
            <Link
              href="/support"
              className="btn-glass inline-flex items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
