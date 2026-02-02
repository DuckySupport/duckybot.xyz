"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";

const reviewSets = [
  [
    {
      name: "bmwnrx",
      text: "Wonderful bot. Used it for my 6.6k server.",
      avatar: "/images/avatars/itzzezy.png",
    },
    {
      name: "12345hi6789bye",
      text: "Why can't I rate this higher. Very good bot, however it could use some more features that are unique like having an eco shop and stuff.",
      avatar: "/images/avatars/mrpxlarizedgg_.png",
    },
    {
      name: "shadowishere_",
      text: "I am a developer for Ducky and I just gotta say that this bot is way better than all of the others. It has every single feature that I could ever need for any kind of server.",
      avatar: "/images/avatars/jrllyfish.png",
    },
    {
      name: "prince0nly",
      text: "This bot so cute and i love ducks",
      avatar: "/images/avatars/commander_coast.png",
    },
    {
      name: "ckkx",
      text: "Best bot for ERLC, automations and tickets built-in help so much!",
      avatar: "/images/avatars/uvloop.png",
    },
  ],
  [
    {
      name: "ghostrelay",
      text: "Clean UI, fast responses, and the staff tools are actually useful.",
      avatar: "/images/avatars/itzzezy.png",
    },
    {
      name: "aidenplays",
      text: "We switched from another bot and the automations saved hours every week.",
      avatar: "/images/avatars/mrpxlarizedgg_.png",
    },
    {
      name: "marblebee",
      text: "Moderation feels effortless now. Love the built-in templates.",
      avatar: "/images/avatars/jrllyfish.png",
    },
    {
      name: "novaqueen",
      text: "Setup was painless and the support team answered quick.",
      avatar: "/images/avatars/commander_coast.png",
    },
    {
      name: "robloxpd",
      text: "Perfect for ERLC communities — tickets and roleplay tools are solid.",
      avatar: "/images/avatars/uvloop.png",
    },
  ],
];

const SHOW_DURATION_MS = 8000;
const SLIDE_DURATION_MS = 1300;
const GAP_BETWEEN_MS = 1000;

export default function Reviews() {
  const [setIndex, setSetIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  const reviews = useMemo(() => reviewSets[setIndex], [setIndex]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let gapTimeoutId: NodeJS.Timeout;

    timeoutId = setTimeout(() => {
      setPhase("out");
      gapTimeoutId = setTimeout(() => {
        setSetIndex((prev) => (prev + 1) % reviewSets.length);
        setPhase("in");
      }, SLIDE_DURATION_MS + GAP_BETWEEN_MS);
    }, SHOW_DURATION_MS);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(gapTimeoutId);
    };
  }, [setIndex]);

  return (
    <div className="review-list" aria-live="polite">
      {reviews.map((item, index) => (
        <div
          key={`${setIndex}-${item.name}`}
          className={`review-row ${
            phase === "in" ? "review-in" : "review-out"
          }`}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="review-card soft-card">
            <div className="review-avatar-placeholder" aria-hidden="true" />
            <div className="review-content">
              <div className="review-header">
                <span className="review-name">{item.name}</span>
                <span className="review-stars">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={`${item.name}-star-${starIndex}`}
                      className="h-4 w-4"
                      fill="currentColor"
                    />
                  ))}
                </span>
              </div>
              <p className="review-text">{item.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
