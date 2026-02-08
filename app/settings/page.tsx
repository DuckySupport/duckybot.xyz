"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Footer from "@/components/Footer";

type MiniSelectOption = {
  value: string;
  label?: string;
  description?: string;
};

type MiniSelectProps = {
  value: string;
  options: MiniSelectOption[];
  ariaLabel: string;
  onChange: (value: string) => void;
};

function MiniSelect({ value, options, ariaLabel, onChange }: MiniSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      {(() => {
        const active = options.find((option) => option.value === value);
        const activeLabel = active?.label ?? active?.value ?? value;
        return (
          <button
            type="button"
            className="inline-flex min-w-[120px] items-center justify-between gap-2 rounded-full border border-white/10 bg-[#0b0b0b] px-3 py-1.5 text-sm font-medium text-white/75 transition hover:border-white/30 hover:text-white"
            onClick={() => setOpen((current) => !current)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={ariaLabel}
          >
            <span>{activeLabel}</span>
            <span
              className={`text-white/50 transition ${
                open ? "rotate-180 text-white/70" : ""
              }`}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        );
      })()}
      {open ? (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-white/10 bg-[#0f0f0f] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                value === option.value
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span className="text-sm font-medium">
                {option.label ?? option.value}
              </span>
              {option.description ? (
                <span className="mt-1 block text-xs text-white/45">
                  {option.description}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type SessionMeResponse =
  | {
      authenticated: true;
      user: { id: string; name: string; username: string; avatar: string };
      tokenId?: string;
    }
  | { authenticated: false };

export default function SettingsPage() {
  const [session, setSession] = useState<SessionMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [robloxLinked, setRobloxLinked] = useState(false);
  const [robloxProfile, setRobloxProfile] = useState<null | {
    name: string;
    displayName: string;
    id: number;
    avatar: string;
    profile: string;
  }>(null);
  const [rbStatus, setRbStatus] = useState("");
  const [rbBusy, setRbBusy] = useState(false);
  const [userSettings, setUserSettings] = useState({
    autoShifts: false,
    defaultAfk: false,
    globalAfk: false,
    infractionNotifications: true,
    ticketNotifications: true,
    punishmentNotifications: "Both",
    trackPlaytime: true,
    useBloxlinkApi: true,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch("/api/session/me", { cache: "no-store" });
        const data = (await r.json()) as SessionMeResponse;
        if (!mounted) return;
        setSession(data);
      } catch {
        if (!mounted) return;
        setSession({ authenticated: false });
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const avatarUrl =
    session && "authenticated" in session && session.authenticated
      ? session.user.avatar
      : "";
  const userName =
    session && "authenticated" in session && session.authenticated
      ? session.user.name
      : "Discord user";
  const userUsername =
    session && "authenticated" in session && session.authenticated
      ? session.user.username
      : "";

  const initials = useMemo(() => {
    const name =
      session && "authenticated" in session && session.authenticated
        ? session.user.name?.trim()
        : "";
    if (!name) return "DU";
    const parts = name.split(" ").filter(Boolean);
    return parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [session]);

  const timezoneLabel = useMemo(() => {
    if (typeof Intl === "undefined") return "Local time";
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";
  }, []);

  const setBooleanSetting = (
    key: keyof typeof userSettings,
    value: "Enabled" | "Disabled",
  ) => {
    setUserSettings((current) => ({
      ...current,
      [key]: value === "Enabled",
    }));
  };

  const isAuthed =
    session !== null && "authenticated" in session && session.authenticated;

  const buildRobloxAuthorizeUrl = (state: string) => {
    const url = new URL("https://authorize.roblox.com/");
    url.searchParams.set("client_id", process.env.NEXT_PUBLIC_ROBLOX_CLIENT_ID || "");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid");
    url.searchParams.set("redirect_uri", process.env.NEXT_PUBLIC_ROBLOX_REDIRECT_URI || "");
    url.searchParams.set("state", state);
    return url.toString();
  };

  const newState = () => {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    let bin = "";
    for (const b of arr) bin += String.fromCharCode(b);
    const s = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    sessionStorage.setItem("rb_oauth_state", s);
    return s;
  };

  const refreshRobloxLink = async () => {
    const r = await fetch("/api/links", { cache: "no-store" });

    if (r.status === 404) {
      setRobloxLinked(false);
      setRobloxProfile(null);
      return;
    }

    const data = (await r.json().catch(() => null)) as any;

    if (r.ok && data?.data?.roblox?.id) {
      setRobloxLinked(true);
      setRobloxProfile({
        name: data.data.roblox.name,
        displayName: data.data.roblox.displayName,
        id: data.data.roblox.id,
        avatar: data.data.roblox.avatar,
        profile: data.data.roblox.profile,
      });
      return;
    }

    setRobloxLinked(false);
    setRobloxProfile(null);
  };

  useEffect(() => {
    if (!isAuthed) return;

    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    (async () => {
      await refreshRobloxLink();

      if (!code) return;

      const expected = sessionStorage.getItem("rb_oauth_state");
      if (!expected || !state || expected !== state) {
        setRbStatus("Roblox login failed. Try again.");
        return;
      }

      setRbBusy(true);
      setRbStatus("Linking Roblox account...");

      const linkRes = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ robloxCode: code }),
      });

      const linkData = (await linkRes.json().catch(() => null)) as any;

      if (!linkRes.ok) {
        setRbStatus(linkData?.message || "Failed to link Roblox account.");
        setRbBusy(false);
        return;
      }

      setRbStatus(linkData?.message || "Roblox linked!");
      sessionStorage.removeItem("rb_oauth_state");

      url.searchParams.delete("code");
      url.searchParams.delete("state");
      window.history.replaceState({}, "", url.toString());

      await refreshRobloxLink();
      setRbBusy(false);
    })().catch(() => {
      setRbStatus("Unexpected Roblox linking error.");
      setRbBusy(false);
    });
  }, [isAuthed]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <main className="px-6 pb-16 pt-12 sm:pt-16">
        <div className="mx-auto w-full max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Account Settings
            </h1>
            <p className="mt-3 text-sm text-white/60 sm:text-base">
              Manage your Discord identity and account preferences.
            </p>
          </div>

          <div className="mt-10 rounded-[28px] border border-white/10 bg-[#0f0f0f] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:p-8">
            <div className="group">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={userName}
                    width={72}
                    height={72}
                    className="h-16 w-16 rounded-full border border-white/10 object-cover"
                  />
                ) : (
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-semibold text-white/70 ${
                      isLoading ? "animate-pulse" : ""
                    }`}
                  >
                    {initials}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white/60">
                    Discord account
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    {isLoading ? "Loading..." : userName}
                  </h2>
                  {userUsername ? (
                    <p className="text-sm text-white/60">{userUsername}</p>
                  ) : null}
                  {!isAuthed && !isLoading ? (
                    <Link
                      href="/login"
                      className="btn-primary mt-3 inline-flex items-center justify-center rounded-full px-4 py-2 text-xs"
                    >
                      Connect Discord
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="mx-auto mt-6 h-px w-72 rounded-full bg-white/10" />

              <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-left">
                  {robloxProfile?.avatar ? (
                    <Image
                      src={robloxProfile.avatar}
                      alt="Roblox avatar"
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white/70">
                      RB
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white/60">
                      Roblox account
                    </p>
                    <p className="text-sm font-semibold text-white/80">
                      {robloxProfile ? `${robloxProfile.displayName} (@${robloxProfile.name})` : "Not linked"}
                    </p>
                    <p className="text-xs text-white/50">
                      {rbStatus
                        ? rbStatus
                        : robloxLinked
                          ? "Linked to your Roblox account."
                          : "Not linked yet."}
                    </p>
                  </div>
                </div>
                                <button
                  type="button"
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition ${
                    robloxLinked ? "btn-glass" : "btn-primary"
                  }`}
                  disabled={!isAuthed || rbBusy}
                  onClick={async () => {
                    if (!isAuthed || rbBusy) return;

                    setRbStatus("");
                    setRbBusy(true);

                    try {
                      if (robloxLinked) {
                        setRbStatus("Unlinking Roblox...");
                        const r = await fetch("/api/links", { method: "DELETE" });
                        const data = (await r.json().catch(() => null)) as any;

                        if (!r.ok) {
                          setRbStatus(data?.message || "Failed to unlink.");
                          setRbBusy(false);
                          return;
                        }

                        setRbStatus(data?.message || "Roblox unlinked.");
                        setRobloxLinked(false);
                        setRobloxProfile(null);
                        setRbBusy(false);
                        return;
                      }

                      const state = newState();
                      window.location.assign(buildRobloxAuthorizeUrl(state));
                    } catch {
                      setRbStatus("Something went wrong.");
                      setRbBusy(false);
                    }
                  }}
                >
                  {robloxLinked ? "Unlink Roblox" : "Link Roblox"}
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              <details className="group settings-accordion rounded-2xl border border-white/10 bg-black/40 p-2 transition hover:border-white/20">
                <summary className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-3 text-base font-semibold text-white/85 transition hover:bg-white/5 group-open:bg-white/5">
                  <span>Notifications</span>
                  <span className="settings-chevron inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition group-hover:text-white/70">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </summary>

                <div className="mt-2 grid gap-4 px-3 pb-3 text-sm text-white/60">
                  <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-4">
                    <p className="text-sm font-medium text-white/60">
                      User settings
                    </p>

                    <div className="mt-4 grid gap-3">
                      {[
                        {
                          key: "autoShifts",
                          label: "AutoShifts",
                          description: "Automatically manage shift reminders.",
                        },
                        {
                          key: "defaultAfk",
                          label: "Default AFK",
                          description: "Set AFK automatically after inactivity.",
                        },
                        {
                          key: "globalAfk",
                          label: "Global AFK",
                          description: "Share AFK status across servers.",
                        },
                        {
                          key: "infractionNotifications",
                          label: "Infraction Notifications",
                          description: "Alerts for new infractions.",
                        },
                        {
                          key: "ticketNotifications",
                          label: "Ticket Notifications",
                          description: "Updates for ticket activity.",
                        },
                        {
                          key: "trackPlaytime",
                          label: "Track Playtime",
                          description: "Log session playtime automatically.",
                        },
                        {
                          key: "useBloxlinkApi",
                          label: "Use Bloxlink API",
                          description: "Enable Roblox verification lookup.",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white/5 px-3 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-white/80">
                              {item.label}
                            </p>
                            <p className="text-xs text-white/45">
                              {item.description}
                            </p>
                          </div>

                          <MiniSelect
                            value={
                              userSettings[item.key as keyof typeof userSettings]
                                ? "Enabled"
                                : "Disabled"
                            }
                            options={[
                              { value: "Enabled" },
                              { value: "Disabled" },
                            ]}
                            ariaLabel={`${item.label} setting`}
                            onChange={(value) =>
                              setBooleanSetting(
                                item.key as keyof typeof userSettings,
                                value as "Enabled" | "Disabled",
                              )
                            }
                          />
                        </div>
                      ))}

                      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white/5 px-3 py-3">
                        <div>
                          <p className="text-sm font-semibold text-white/80">
                            Timezone
                          </p>
                          <p className="text-xs text-white/45">
                            Auto-detected from your device.
                          </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-semibold text-white/70">
                          {timezoneLabel}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white/5 px-3 py-3">
                        <div>
                          <p className="text-sm font-semibold text-white/80">
                            Punishment Notifications
                          </p>
                          <p className="text-xs text-white/45">
                            Choose how you want punishment alerts.
                          </p>
                        </div>
                        <MiniSelect
                          value={userSettings.punishmentNotifications}
                          options={[
                            {
                              value: "In-Game PMs",
                              description: "Use the in-game :pm command.",
                            },
                            {
                              value: "Discord DMs",
                              description: "Use your Discord DMs.",
                            },
                            {
                              value: "Both",
                              description: "Use both Discord DMs and in-game PMs.",
                            },
                            {
                              value: "None",
                              description: "Do not notify in any way.",
                            },
                          ]}
                          ariaLabel="Punishment notification setting"
                          onChange={(value) =>
                            setUserSettings((current) => ({
                              ...current,
                              punishmentNotifications: value as
                                | "In-Game PMs"
                                | "Discord DMs"
                                | "Both"
                                | "None",
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}