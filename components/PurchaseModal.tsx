"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/offline";
import closeRounded from "@iconify/icons-material-symbols/close-rounded";
import contentCopyRounded from "@iconify/icons-material-symbols/content-copy-rounded";
import Success from "@/public/icons/Success.svg";

const steps = [
  {
    label: "Invite Ducky",
    detail: "to your server.",
    highlight: true,
    href: "/invite",
  },
  {
    label: "Use the",
    detail: "/plus manage",
    code: true,
  },
  {
    label: "Press the",
    detail: "Purchase Slot button.",
  },
  {
    label: "Follow the instructions",
    detail: "to complete your purchase.",
  },
  {
    label: "Apply the slot",
    detail: "by pressing the Use Slot button.",
  },
];

type PurchaseModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function PurchaseModal({ open, onClose }: PurchaseModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!open) return null;

  return (
    <div className="purchase-modal-backdrop" role="dialog" aria-modal="true">
      <div className="purchase-modal">
        <div className="purchase-modal-header">
          <h3>How to Purchase Ducky Plus+</h3>
          <button
            type="button"
            className="purchase-modal-close hover:cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon icon={closeRounded} className="h-4 w-4" />
          </button>
        </div>
        <ol className="purchase-steps">
          {steps.map((step, index) => (
            <li key={step.label}>
              <span className="step-index">{index + 1}.</span>
              <span className="step-text">
              {step.href ? (
                <a
                  className={`step-link ${step.highlight ? "step-highlight" : ""}`}
                  href={step.href}
                >
                  {step.label}
                </a>
              ) : (
                <span className={step.highlight ? "step-highlight" : ""}>
                  {step.label}
                </span>
              )}{" "}
                {step.code ? (
                  <>
                    <span
                      className="step-code"
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        navigator.clipboard.writeText(step.detail);
                        setCopied(true);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          navigator.clipboard.writeText(step.detail);
                          setCopied(true);
                        }
                      }}
                    >
                      {step.detail}
                      <span className="step-code-hint">
                        {copied ? (
                          <>
                            <Success className="h-3 w-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Icon icon={contentCopyRounded} className="h-3 w-3" />
                            Copy
                          </>
                        )}
                      </span>
                    </span>
                    <span className="step-text-muted">command.</span>
                  </>
                ) : (
                  <span>{step.detail}</span>
                )}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
