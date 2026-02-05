import Image from "next/image";
import Footer from "@/components/Footer";

const TEAM_API = "https://api.duckybot.xyz/team";

type TeamMember = {
  discord_id: string;
  color?: string;
  avatar?: string;
  username?: string;
  role?: string;
  name?: string;
  category?: string;
  position?: number;
};

type TeamResponse = {
  data?: TeamMember[];
};

const CATEGORY_ORDER = [
  { key: "dev", label: "Developers" },
  { key: "management", label: "Management" },
  { key: "support", label: "Support" },
  { key: "qa", label: "Quality Assurance" },
  { key: "docs", label: "Docwriter" },
];

const categoryLabel = (value?: string) => {
  if (!value) return "Team";
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeCategory = (value?: string) => {
  const normalized = (value ?? "").toLowerCase().trim();
  if (["dev", "developer", "developers"].includes(normalized)) return "dev";
  if (
    ["management", "manager", "managers", "leadership", "mgmt"].includes(
      normalized
    )
  ) {
    return "management";
  }
  if (["support", "helper", "helpers"].includes(normalized)) return "support";
  if (
    ["qa", "quality", "quality-assurance", "quality assurance", "quality_assurance"].includes(
      normalized
    )
  ) {
    return "qa";
  }
  if (
    [
      "docs",
      "doc",
      "documentation",
      "doc writer",
      "doc writers",
      "doc-writers",
      "doc_writers",
      "docwriter",
    ].includes(normalized)
  ) {
    return "docs";
  }
  return normalized || "team";
};

const groupByCategory = (members: TeamMember[]) => {
  const order: string[] = [];
  const buckets = new Map<string, TeamMember[]>();
  members.forEach((member) => {
    const key = normalizeCategory(member.category);
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)?.push(member);
  });
  const orderedKeys = [
    ...CATEGORY_ORDER.map((item) => item.key),
    ...order.filter((key) => !CATEGORY_ORDER.some((item) => item.key === key)),
  ];

  return orderedKeys
    .filter((key) => buckets.has(key))
    .map((key) => {
      const label =
        CATEGORY_ORDER.find((item) => item.key === key)?.label ??
        categoryLabel(key);
      return {
        key,
        label,
        members:
          buckets
            .get(key)
            ?.slice()
            .sort((a, b) => (b.position ?? 0) - (a.position ?? 0)) ?? [],
      };
    });
};

async function getTeam() {
  try {
    const response = await fetch(TEAM_API, { next: { revalidate: 300 } });
    if (!response.ok) return [];
    const json = (await response.json()) as TeamResponse;
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}


const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]).join("");
  return initials.toUpperCase() || "?";
};

export default async function TeamPage() {
  const team = await getTeam();
  const groupedTeam = groupByCategory(team);
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="relative overflow-hidden px-6 pb-12 pt-20 sm:pt-24">
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">
            Meet the Team Behind <span className="accent-text">Ducky</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/60 sm:text-base">
            Dedicated innovators developing and maintaining the best bot for ERLC automation and server management.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              className="btn-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base"
              href="/careers"
            >
              Join the Team
            </a>
            <a
              className="btn-glass inline-flex items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base"
              href="/support"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 pt-6">
        <div className="mx-auto w-full max-w-6xl space-y-10">
          {groupedTeam.length === 0 ? (
            <div className="soft-card p-6 text-center text-sm text-white/60">
              Team data is unavailable right now. Please check back soon.
            </div>
          ) : (
            groupedTeam.map((group) => (
              <div key={group.key} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white sm:text-2xl">
                    {group.label}
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.members.map((member) => {
                    const accent = member.color || "#F5FF82";
                    const displayName = member.name || member.username || "Member";
                    return (
                      <div
                        key={`${member.discord_id}-${member.role}`}
                        className="card lift-card flex h-full flex-col gap-5 p-6 text-left"
                        style={{ borderColor: accent }}
                      >
                        <div className="flex items-center gap-4">
                          {member.avatar ? (
                            <Image
                              src={member.avatar}
                              alt={`${displayName} avatar`}
                              width={64}
                              height={64}
                              className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-semibold text-white">
                              {getInitials(displayName)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white/90">
                              {displayName}
                            </p>
                            {member.username && (
                              <p className="text-xs text-white/45">
                                @{member.username}
                              </p>
                            )}
                            {member.role && (
                              <p
                                className="text-xs font-semibold"
                                style={{ color: accent }}
                              >
                                {member.role}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* <div className="mt-auto flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                            {group.label}
                          </span>
                        </div> */}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
