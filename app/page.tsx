import { Icon } from "@iconify/react/offline";
import chevronRight from "@iconify/icons-material-symbols/chevron-right";
import addRounded from "@iconify/icons-material-symbols/add-rounded";
import shieldRounded from "@iconify/icons-material-symbols/shield-rounded";
import code from "@iconify/icons-tabler/code";
import Automation from "@/public/icons/Automation.svg";
import Plus from "@/public/icons/Plus.svg";
import Robux from "@/public/icons/Robux.svg";

import Footer from "@/components/Footer";
import Reviews from "@/components/Reviews";

const STATS_API = "https://api.duckybot.xyz/statistics";

type StatsResponse = {
  data?: {
    guilds?: number;
    users?: number;
  };
};

const formatNumber = (value?: number) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-US").format(value)
    : "?";

async function getStats() {
  try {
    const response = await fetch(STATS_API, { next: { revalidate: 300 } });
    if (!response.ok) return null;
    const json = (await response.json()) as StatsResponse;
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const stats = await getStats();
  const userCount = `${formatNumber(stats?.users)} users`;
  const guildCount = `${formatNumber(stats?.guilds)} communities`;

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white">
      <section className="relative px-4 pb-16 pt-14 sm:pb-20 sm:pt-32 md:pt-20">
        <div className="mx-auto max-w-5xl text-center">
          <a
            id="duckyVersion"
            href="https://docs.duckybot.xyz/overview/changelogs"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-4 py-1.5 text-xs font-medium text-white/90 transition hover:bg-[var(--accent)]/15 sm:px-6 sm:py-2 sm:text-sm"
          >
            v1.6.0 Stable is here!
            <Icon icon={chevronRight} className="ml-2 -mr-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
          </a>
          <h1 className="animate-fade-in mb-6 mt-6 text-3xl font-bold sm:mb-8 sm:text-4xl md:text-6xl lg:text-7xl">
            Power Your Server with{" "}
            <span className="accent-text">Ducky</span>
          </h1>
          <p className="animate-slide-up mx-auto mb-8 max-w-2xl text-base text-white/60 sm:mb-12 sm:text-lg md:text-xl">
            A multipurpose bot focused on seamlessly integrating{" "}
            <span className="accent-text">Discord</span> and{" "}
            <span className="accent-text">ERLC</span> server automation for{" "}
            <span className="accent-text">effortless</span> management.
          </p>
          <div
            className="animate-slide-up flex flex-wrap justify-center gap-3 sm:gap-4"
            style={{ animationDelay: "0.2s" }}
          >
            <a
              href="/invite"
              className="btn-primary inline-flex items-center justify-center rounded-full px-7 py-3 text-sm sm:px-8 sm:py-3 sm:text-base"
            >
              Add Ducky
            </a>
            <a
              href="/support"
              className="btn-glass group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm sm:px-8 sm:py-3 sm:text-base"
            >
              Support
              <Icon
                icon={chevronRight}
                className="h-6 w-6 -mr-3 transition-transform group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>
      </section>

      <section className="relative px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          <div className="card feature-card animate-fade-in">
            <div className="feature-icon">
              <Icon icon={shieldRounded} className="h-6 w-6" />
            </div>
            <h3 className="feature-title">Staff Management</h3>
            <p className="feature-text">
              Manage your staff team with ease using infractions, promotions,
              LOAs, feedback, and more
            </p>
          </div>
          <div className="card feature-card animate-fade-in">
            <div className="feature-icon">
              <Automation className="h-6 w-6" />
            </div>
            <h3 className="feature-title">Automation</h3>
            <p className="feature-text">
              Seamless ERLC automation with over 30+ triggers, actions, and
              conditions for effortless management
            </p>
          </div>
          <div className="card feature-card animate-fade-in">
            <div className="feature-icon">
              <Icon icon={code} className="h-6 w-6" />
            </div>
            <h3 className="feature-title">Multipurpose</h3>
            <p className="feature-text">
              Features for every server, such as Discord Moderation, Roblox
              Verification, Reaction Boards, and more
            </p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl overflow-visible px-4 py-20 text-center animate-slide-up">
        <img
          src="/affiliates/fannedlogos.png"
          alt=""
          aria-hidden="true"
          className="logo-fan-image"
        />
        <div className="trusted-text">
          <h2 className="mx-auto max-w-3xl text-4xl leading-[1.1] text-white sm:text-5xl">
            <br /> Trusted by{" "}
            <span className="accent-text font-bold" id="userCount">
              {userCount}
            </span>
            <br /> across{" "}
            <span className="accent-text font-bold" id="guildCount">
              {guildCount}
            </span>
            .
          </h2>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-2xl font-bold sm:mb-6 sm:text-3xl">
          Our Reviews
        </h2>
        <Reviews />
      </div>

      <section className="relative px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-2xl font-bold sm:mb-6 sm:text-3xl">
            Our Affiliates
          </h2>

          <div className="affiliate-grid grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            <div className="card affiliate-card lift-card vacant-card">
              <div className="flex justify-center">
                <div className="card-icon fixed-icon">
                  <img
                    src="/affiliates/CRP.png"
                    alt="California"
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
                    alt="Brixton"
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

            <div className="card affiliate-card lift-card">
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

          <div
            className="flex justify-center pt-6 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <a
              href="/affiliates"
              className="btn-transparent group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm sm:px-6 sm:py-2 sm:text-base"
            >
              <span>All Affiliates</span>
              <Icon icon={chevronRight} className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      <section className="relative -mt-8 px-4 pb-16 pt-8 sm:-mt-10 sm:pb-20 sm:pt-10">
        <div className="mx-auto max-w-6xl">
          <div className="card relative overflow-hidden bg-cover bg-center p-8 text-center hover:transform-none sm:p-12">
            <div className="plus-animated-bg" aria-hidden="true" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.0),rgba(0,0,0,0.25)_55%,rgba(0,0,0,0.55)_75%)]" />
            <div className="relative z-10">
              <h2 className="mb-4 text-2xl font-bold text-white sm:mb-6 sm:text-4xl">
                <Plus className="mr-2 inline h-[1.2em] w-auto align-text-bottom" />
                Ducky Plus+
              </h2>
              <p className="mx-auto mb-6 max-w-3xl text-sm text-white/60 sm:mb-8 sm:text-lg">
                Unlock endless possibilities with a customized profile, increased limits, giveaway requirements, and so much more
                for <Robux className="mx-1 inline h-[1.2em] w-auto align-text-bottom" /><span className="text-white font-bold">1,000</span> per server.
              </p>
              <a
                href="/plus"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/30 sm:px-6 sm:py-2 sm:text-base"
              >
                Upgrade Now
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
