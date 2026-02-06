import { Icon } from "@iconify/react/offline";
import chevronRight from "@iconify/icons-material-symbols/chevron-right";
import addRounded from "@iconify/icons-material-symbols/add-rounded";

import Footer from "@/components/Footer";

export default function AffiliatesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="px-6 pb-10 pt-14 sm:pt-32">
        <div className="mx-auto w-full max-w-5xl text-center">
          <h1 className="text-4xl font-semibold sm:text-6xl">
            Meet Our <span className="accent-text">Affiliates</span>
          </h1>
          <p className="mt-4 text-sm text-white/60 sm:text-base">
            Communities using <span className="accent-text">Ducky</span> to
            bring the <span className="accent-text">next generation</span> of
            ERLC automation to their servers.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
            <a
              className="btn-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base"
              href="/support"
            >
              Apply Now
            </a>
            <a
              className="btn-glass group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm sm:text-base"
              href="/partners"
            >
              Partners
              <Icon icon={chevronRight} className="h-6 w-6 -mr-2 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 pt-6">
        <div className="affiliate-grid mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          <div className="card affiliate-card lift-card">
            <div className="flex justify-center">
              <div className="card-icon fixed-icon">
                <img
                  src="/affiliates/CRP.png"
                  alt="California State Roleplay"
                  className="affiliate-logo"
                />
              </div>
            </div>
            <div className="card-content">
              <h3 className="mb-3 text-lg font-bold sm:mb-4 sm:text-xl">
                California State Roleplay
              </h3>
              <p className="text-center text-sm text-gray-300 sm:text-base">
                Welcome to California Roleplay (CRP), where we take your
                roleplay experience to the next level. Are you ready for the
                most realistic server?
              </p>
              <div className="affiliate-actions mt-6">
                <a
                  href="https://discord.gg/YrtTGqKYEX"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-accent inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm sm:px-6 sm:py-2 sm:text-base"
                >
                  <span>Join Server</span>
                </a>
              </div>
            </div>
          </div>

          <div className="card affiliate-card lift-card">
            <div className="flex justify-center">
              <div className="card-icon fixed-icon">
                <img
                  src="/affiliates/UnitedKingdom.png"
                  alt="United Kingdom: Brixton Roleplay"
                  className="affiliate-logo"
                />
              </div>
            </div>
            <div className="card-content">
              <h3 className="mb-3 text-lg font-bold sm:mb-4 sm:text-xl">
                United Kingdom: Brixton Roleplay
              </h3>
              <p className="text-center text-sm text-gray-300 sm:text-base">
                Looking for a realistic and professional Emergency Response:
                Liberty County roleplay server? ukbrx brings you an authentic
                UK-based roleplay community with dedicated staff, strict
                realism, and an engaging player base.
              </p>
              <div className="affiliate-actions mt-6">
                <a
                  href="https://discord.gg/jPWXUXjsKt"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-accent inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm sm:px-6 sm:py-2 sm:text-base"
                >
                  <span>Join Server</span>
                </a>
              </div>
            </div>
          </div>

          <div className="card affiliate-card lift-card">
            <div className="flex justify-center">
              <div className="card-icon fixed-icon">
                <img
                  src="/affiliates/CollierCounty.png"
                  alt="Collier County Roleplay"
                  className="affiliate-logo"
                />
              </div>
            </div>
            <div className="card-content">
              <h3 className="mb-3 text-lg font-bold sm:mb-4 sm:text-xl">
                Collier County Roleplay
              </h3>
              <p className="text-center text-sm text-gray-300 sm:text-base">
                A roleplay server delivering an immersive roleplay experience,
                built by the community.
              </p>
              <div className="affiliate-actions mt-6">
                <a
                  href="https://discord.gg/FamWC7D4kC"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-accent inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm sm:px-6 sm:py-2 sm:text-base"
                >
                  <span>Join Server</span>
                </a>
              </div>
            </div>
          </div>

          <div className="card affiliate-card lift-card vacant-card sm:col-span-2 lg:col-span-1">
            <div className="flex justify-center">
              <div className="card-icon fixed-icon border border-[var(--accent)]">
                <Icon icon={addRounded} className="h-8 w-8 text-gray-600" />
              </div>
            </div>
            <div className="card-content">
              <h3 className="mb-3 text-lg font-bold sm:mb-4 sm:text-xl">
                Vacant Spot
              </h3>
              <p className="text-center text-sm text-gray-300 sm:text-base">
                Apply for an affiliation and advertise your server here.
              </p>
              <div className="affiliate-actions mt-6">
                <a
                  href="/support"
                  className="btn-accent inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm sm:px-6 sm:py-2 sm:text-base"
                >
                  <span>Apply Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
