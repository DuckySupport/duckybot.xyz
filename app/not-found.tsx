import Link from "next/link"
import { Icon } from "@iconify/react/offline"
import chevronRight from "@iconify/icons-material-symbols/chevron-right"
import HideNavbar from "@/components/HideNavbar"
import Footer from "@/components/Footer"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl font-semibold sm:text-6xl">
          404 <span className="accent-text">Not Found</span>
        </h1>
        <p className="mt-4 text-sm text-white/60 sm:text-base">
          The requested resource was not found in this pond. If you need help finding it, contact support&mdash; we&apos;re here to help.
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
      <Footer />
    </div>
  )
}
