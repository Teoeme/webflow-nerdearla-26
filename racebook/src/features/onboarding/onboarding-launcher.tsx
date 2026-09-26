"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { OnboardingMessages } from "@/i18n/messages/onboarding.en";
import { OnboardingPlayer } from "./onboarding-player";
import { SAMPLE_SCREENSHOTS } from "@/features/ai-capture/sample-screenshots";

const ONBOARDING_SEEN_STORAGE_KEY = "racebook_onboarding_seen";

// The Modal's own trigger is never shown: this component opens it itself
// (on first visit, or from the visible "How it works" button) and drives it
// as a controlled dialog, the same pattern SharePanel uses elsewhere.
const HIDDEN_TRIGGER = <button type="button" tabIndex={-1} aria-hidden="true" className="sr-only" />;

function hasSeenOnboarding(): boolean {
  try {
    return window.localStorage.getItem(ONBOARDING_SEEN_STORAGE_KEY) === "true";
  } catch {
    return true; // storage unavailable: don't force the modal open
  }
}

function markOnboardingSeen(): void {
  try {
    window.localStorage.setItem(ONBOARDING_SEEN_STORAGE_KEY, "true");
  } catch {
    // storage unavailable: nothing to persist, next visit just won't auto-open either
  }
}

export function OnboardingLauncher({ messages }: { messages: OnboardingMessages }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasSeenOnboarding()) setOpen(true);
  }, []);

  function close() {
    markOnboardingSeen();
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-label text-text-muted transition-colors hover:text-text"
      >
        {messages.trigger}
      </button>
      <Modal
        trigger={HIDDEN_TRIGGER}
        title={messages.modalTitle}
        closeLabel={messages.closeLabel}
        open={open}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}
        size="wide"
      >
        <div className="flex flex-col gap-4">
          <OnboardingPlayer scene1={messages.scene1} scene2={messages.scene2} scene3={messages.scene3} />
          <ul className="flex flex-col gap-1 text-sm text-text-muted">
            <li>{messages.scene1.summary}</li>
            <li>{messages.scene2.summary}</li>
            <li>{messages.scene3.summary}</li>
          </ul>
          <div className="flex flex-col gap-2 rounded-sm border border-line p-3">
            <p className="text-label text-text-muted">{messages.tour.title}</p>
            <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm">
              {messages.tour.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="text-sm text-text-muted">
              {messages.tour.samplesIntro}{" "}
              {SAMPLE_SCREENSHOTS.map((sample, index) => (
                <a
                  key={sample}
                  href={sample}
                  download
                  className="text-accent underline-offset-2 hover:underline"
                >
                  {index > 0 ? " · " : ""}
                  {messages.tour.sampleLabel} {index + 1}
                </a>
              ))}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={close}>
              {messages.skip}
            </Button>
            <Button type="button" variant="primary" onClick={close}>
              {messages.start}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
