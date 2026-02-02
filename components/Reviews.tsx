"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";

const SHOW_DURATION_MS = 8000;
const SLIDE_DURATION_MS = 1300;
const GAP_BETWEEN_MS = 1000;
const REVIEWS_API = "https://api.duckybot.xyz/feedback";
const FALLBACK_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";

type ApiReview = {
  rating?: number;
  feedback?: string;
  submitter?: {
    username?: string;
    avatar?: string;
    id?: string;
    discord_id?: string;
  };
};

type ReviewItem = {
  name: string;
  text: string;
  avatar: string;
  rating: number;
};

const resolveAvatar = (avatar?: string, id?: string) => {
  if (!avatar) return FALLBACK_AVATAR;
  if (avatar.startsWith("http") || avatar.startsWith("/") || avatar.startsWith("data:")) {
    return avatar;
  }
  if (id) {
    return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=128`;
  }
  return FALLBACK_AVATAR;
};

const chunk = (items: ReviewItem[], size: number) => {
  const result: ReviewItem[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
};

export default function Reviews() {
  const [setIndex, setSetIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [sets, setSets] = useState<ReviewItem[][]>([]);

  const reviews = useMemo(() => sets[setIndex] ?? [], [setIndex, sets]);

  const loadReviews = useCallback(async () => {
    try {
      const response = await fetch(REVIEWS_API);
      if (!response.ok) return null;
      const json = await response.json();
      if (!json?.data || !Array.isArray(json.data)) return null;
      const parsed = (json.data as ApiReview[])
        .map((item) => ({
          name: item.submitter?.username ?? "Anonymous",
          text: item.feedback ?? "",
          avatar: resolveAvatar(
            item.submitter?.avatar,
            item.submitter?.id ?? item.submitter?.discord_id
          ),
          rating: Math.max(1, Math.min(5, item.rating ?? 5)),
        }))
        .filter((item) => item.text.trim().length > 0);

      if (!parsed.length) return null;
      return chunk(parsed, 5);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadReviews().then((nextSets) => {
      if (!isMounted || !nextSets?.length) return;
      setSets(nextSets);
      setSetIndex(0);
    });

    return () => {
      isMounted = false;
    };
  }, [loadReviews]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let gapTimeoutId: NodeJS.Timeout;

    if (sets.length > 0) {
      timeoutId = setTimeout(() => {
        setPhase("out");
        gapTimeoutId = setTimeout(() => {
          loadReviews().then((nextSets) => {
            if (nextSets?.length) {
              setSets(nextSets);
              setSetIndex((prev) => (prev + 1) % nextSets.length);
            } else {
              setSetIndex((prev) => (prev + 1) % sets.length);
            }
            setPhase("in");
          });
        }, SLIDE_DURATION_MS + GAP_BETWEEN_MS);
      }, SHOW_DURATION_MS);
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(gapTimeoutId);
    };
  }, [loadReviews, setIndex, sets.length]);

  if (!reviews.length) {
    return null;
  }

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
            <img
              src={item.avatar}
              alt={`${item.name} avatar`}
              className="review-avatar-placeholder object-cover"
              loading="lazy"
            />
            <div className="review-content">
              <div className="review-header">
                <span className="review-name">{item.name}</span>
                <span className="review-stars">
                  {Array.from({ length: item.rating }).map((_, starIndex) => (
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
