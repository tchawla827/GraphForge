"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import {
  dismissOnboarding,
  isOnboardingDismissed,
} from "@/features/onboarding/storage";

const STEPS = [
  {
    title: "Build your graph",
    body: "Use the tool rail to add nodes, connect them, or remove elements from the canvas.",
  },
  {
    title: "Inspect and configure",
    body: "Use the right panel to toggle directed or weighted mode and edit the selected node or edge.",
  },
  {
    title: "Run and replay",
    body: "Open the algorithm tab, run an algorithm, then step or scrub through the playback timeline.",
  },
];

type SessionPayload = {
  user?: {
    id?: string;
  };
};

export function OnboardingOverlay() {
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) return;

        const data = (await response.json()) as SessionPayload;
        const nextUserId = data.user?.id;
        if (!nextUserId || cancelled) return;

        setUserId(nextUserId);
        setOpen(!isOnboardingDismissed(nextUserId));
      } catch {
        // Non-blocking UI aid only.
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const step = useMemo(() => STEPS[stepIndex], [stepIndex]);

  if (!open || !userId) {
    return null;
  }

  const isLastStep = stepIndex === STEPS.length - 1;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-start justify-center bg-black/45 px-4 py-6">
      <div className="pointer-events-auto w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Quick Start
            </p>
            <h2 className="text-lg font-semibold text-zinc-100">{step.title}</h2>
          </div>
          <span className="text-xs text-zinc-500">
            {stepIndex + 1}/{STEPS.length}
          </span>
        </div>

        <p className="text-sm leading-6 text-zinc-300">{step.body}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              dismissOnboarding(userId);
              setOpen(false);
            }}
          >
            Dismiss
          </Button>

          <div className="flex items-center gap-2">
            {stepIndex > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setStepIndex((current) => current - 1)}
              >
                Back
              </Button>
            ) : null}
            <Button
              size="sm"
              className="text-xs"
              onClick={() => {
                if (isLastStep) {
                  void track({ name: "onboarding_completed" });
                  dismissOnboarding(userId);
                  setOpen(false);
                  return;
                }
                setStepIndex((current) => current + 1);
              }}
            >
              {isLastStep ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
