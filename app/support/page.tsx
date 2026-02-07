"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import Footer from "@/components/Footer"
import Plus from "@/public/icons/Plus.svg"
import Robux from "@/public/icons/Robux.svg"

export default function RedirectPage() {
  const [countdown, setCountdown] = useState(3)
  const redirectUrl = "https://discord.com/invite/w2dNr7vuKP"

  useEffect(() => {
    if (countdown === 0) {
      window.location.href = redirectUrl
      return
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="relative flex flex-col md:flex-row items-center gap-8 max-w-6xl w-full">
          {/* Redirect Card */}
          <div className="flex-1 w-full max-w-lg rounded-[28px] border border-white/10 bg-[#0f0f0f] p-10 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)] hover:scale-[1.02] transition-transform">
            <h1 className="text-4xl font-bold mb-4 sm:text-5xl animate-fade-in">
              Redirecting...
            </h1>
            <p className="text-white/70 text-lg sm:text-xl mb-6 animate-slide-up">
              You are being redirected to the{" "}
              <span className="font-semibold text-white">
                Ducky Communications Server
              </span>{" "}
              in <span className="font-bold text-white">{countdown}</span>{" "}
              seconds.
            </p>
          </div>

          {/* Ducky Plus Advertisement */}
          <div className="ad-block hidden md:flex flex-col w-80 rounded-[28px] bg-cover bg-center border border-white/10 p-6 shadow-lg relative hover:scale-[1.02] transition-transform">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0),rgba(0,0,0,0.25)_55%,rgba(0,0,0,0.55)_75%)] rounded-[28px]" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl flex items-center justify-center gap-2">
                <Plus className="inline h-[1.5em] w-auto align-text-bottom" />
                Ducky Plus+
              </h2>
              <p className="mb-4 text-sm text-white/70">
                Unlock custom profiles, higher limits, giveaways, and more for{" "}
                <Robux className="inline h-[1.2em] w-auto align-text-bottom" />{" "}
                <span className="font-bold text-white">1,000</span> per server.
              </p>
              <Link
                href="/plus"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/30"
              >
                Upgrade Now
              </Link>
              <span className="mt-3 text-[10px] text-white/50">
                
              </span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
