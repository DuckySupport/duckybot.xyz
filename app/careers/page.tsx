import { Icon } from "@iconify/react/offline";
import chevronRight from "@iconify/icons-material-symbols/chevron-right";
import wrench from "@iconify/icons-fa-solid/wrench";

import Footer from "@/components/Footer";

const roles = [
  {
    title: "Support Team",
    icon: <Icon icon={wrench} className="h-5 w-5" />,
    summary:
      "Assist our users, answer their questions, and provide general help regarding Ducky's features and modules.",
    requirements: [
      "Active usage of Ducky",
      "Clear, friendly communication",
      "Member of Ducky's Pond for at least 20 days",
      "Familiar with the support system",
      "Little to no moderation history"
    ],
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="relative overflow-hidden px-6 pb-14 pt-24 sm:pt-14">
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-2 text-4xl font-semibold sm:text-5xl">
            Careers at
            <span className="accent-text">Ducky</span>
          </div>
          <p className="max-w-2xl text-sm text-white/60 sm:text-base">
            Join us on our mission to <span className="accent-text">revolutionize</span> ERLC private
            server management with seamless <span className="accent-text">automation</span> and <span className="accent-text">integration</span>.
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
                          <Icon icon={chevronRight} className="requirements-bullet"/>
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
                  <Icon icon={chevronRight} className="h-6 w-6 -mr-2 transition-transform group-hover:translate-x-1" />
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
