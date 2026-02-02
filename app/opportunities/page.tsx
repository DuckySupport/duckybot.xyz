import { ArrowRight, LifeBuoy } from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const roles = [
  {
    title: "Support Team",
    icon: <LifeBuoy className="h-5 w-5" />,
    summary:
      "Help community members resolve issues, guide them through features, and keep queues flowing.",
    requirements: [
      "Active usage of Ducky",
      "Clear, friendly communication",
      "Member of Ducky's Pond for 20+ days",
      "Familiar with the support system",
      "Little to no moderation history",
    ],
  },
];

export default function OpportunitiesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <section className="px-6 pb-12 pt-28 sm:pt-32">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <h1 className="text-4xl font-semibold sm:text-6xl">
            Opportunities at <span className="accent-text">Ducky</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/60 sm:text-base">
            Join the team helping ERLC communities run smoother with automation,
            support, and thoughtful product feedback.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          {roles.map((role) => (
            <div key={role.title} className="card feature-card">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-4">
                  <div className="feature-icon">{role.icon}</div>
                  <div>
                    <h3 className="feature-title">{role.title}</h3>
                    <p className="feature-text">{role.summary}</p>
                  </div>
                  <div className="space-y-2 text-sm text-white/65">
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
                      Requirements
                    </p>
                    <ul className="requirements-list space-y-2">
                      {role.requirements.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <img
                            src="/icons/right.svg"
                            alt=""
                            className="requirements-bullet"
                            aria-hidden="true"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <a
                  className="btn-glass group mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm md:mt-0"
                  href="/support"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
