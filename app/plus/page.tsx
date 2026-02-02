"use client";

import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PurchaseModal from "@/components/PurchaseModal";

const rows = [
  { feature: "Customized Bot Profile", free: false, plus: true },
  { feature: "ERLC Player Panel", free: false, plus: true },
  { feature: "Giveaway Requirements", free: false, plus: true },
  { feature: "Export Embed Message Command", free: false, plus: true },
  { feature: "ERLC Command Queueing", free: false, plus: true },
  { feature: "Reduced Cooldowns", free: false, plus: true },
  {
    feature: "Automation Limits",
    free: "10 automations, 5 actions",
    plus: "50 automations, 15 actions",
  },
  { feature: "Autoresponder Limits", free: "3 autoresponders", plus: "25 autoresponders" },
  { feature: "Reaction Board Limits", free: "1 board", plus: "10 boards" },
  { feature: "Ticket Panel Limits", free: "1 panel", plus: "5 panels" },
  { feature: "Ticket Form Limits", free: "2 questions", plus: "5 questions" },
  { feature: "ERLC Status Channels", free: "3 channels", plus: "6 channels" },
  {
    feature: "Discord Status Channels",
    free: "3 channels",
    plus: "6 channels",
  },
  { feature: "Autodelete Channels", free: "3 channels", plus: "10 channels" },
  { feature: "Sticky Messages", free: "3 messages", plus: "10 messages" },
  { feature: "Special Perks in Ducky's Pond", free: false, plus: true },
  { feature: "Priority Support", free: false, plus: true },
  { feature: "Support Ducky's Development", free: false, plus: true },
];

export default function PlusPage() {
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <PurchaseModal open={purchaseOpen} onClose={() => setPurchaseOpen(false)} />
      <section className="relative overflow-hidden px-6 pb-14 pt-24 sm:pt-28">
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <div className="mb-4 text-4xl font-semibold sm:text-5xl">
            Ducky <span className="accent-text">Plus+</span>
          </div>
          <p className="max-w-2xl text-sm text-white/60 sm:text-base">
            Unlock endless possibilities with a customized profile, increased limits, giveaway requirements, and so much more for <img src="/icons/robux.svg" alt="Robux" className="mx-1 inline h-[1.2em] w-auto align-text-bottom"/><span className="text-white font-bold">1,000</span> per server.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="btn-primary rounded-full px-6 py-3 text-sm"
              onClick={() => setPurchaseOpen(true)}
            >
              Purchase
            </button>
            <a
              className="btn-glass group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm"
              href="/support"
            >
              Support
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="mb-6 text-center text-2xl font-semibold sm:text-3xl">
            Feature Comparison
          </h2>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f]">
            <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-white/10 text-sm font-semibold text-white/80">
              <div className="px-5 py-4">Feature</div>
              <div className="px-5 py-4 text-center">Free</div>
              <div className="px-5 py-4 text-center">Ducky Plus+</div>
            </div>
            {rows.map((row) => (
              <div
                key={row.feature}
                className="plus-table-row grid grid-cols-[1.4fr_1fr_1fr] items-center border-b border-white/5 text-sm text-white/70 last:border-b-0 hover:bg-[rgba(247,232,45,0.08)]"
              >
                <div className="px-5 py-4 font-medium text-white/80">
                  {row.feature}
                </div>
                <div className="px-5 py-4 text-center">
                  {typeof row.free === "boolean" ? (
                    row.free ? (
                      <Check className="mx-auto h-4 w-4 text-emerald-400" />
                    ) : (
                      <X className="mx-auto h-4 w-4 text-red-400" />
                    )
                  ) : row.free}
                </div>
                <div className="px-5 py-4 text-center text-white">
                  {typeof row.plus === "boolean" ? (
                    row.plus ? (
                      <Check className="mx-auto h-4 w-4 text-emerald-400" />
                    ) : (
                      <X className="mx-auto h-4 w-4 text-red-400" />
                    )
                  ) : (
                    row.plus
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
