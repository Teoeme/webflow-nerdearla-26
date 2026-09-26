"use client";

import { useEffect, useState } from "react";
import type { OnboardingMessages } from "@/i18n/messages/onboarding.en";

const SCENE_DURATION_MS = 4000;
const SCENE_COUNT = 3;
const MEDAL_STAGGER_STEP_MS = 150;
const FIELD_STAGGER_START_MS = 300;
const FIELD_STAGGER_STEP_MS = 200;

type Scene1Messages = OnboardingMessages["scene1"];
type Scene2Messages = OnboardingMessages["scene2"];
type Scene3Messages = OnboardingMessages["scene3"];

function SceneHeading({ eyebrow, heading }: { eyebrow: string; heading: string }) {
  return (
    <div className="motion-safe:animate-[onboarding-rise-in_500ms_ease-out_backwards]">
      <span className="text-label text-accent">{eyebrow}</span>
      <h3 className="text-heading text-xl">{heading}</h3>
    </div>
  );
}

function MedalScene({ captions }: { captions: Scene1Messages }) {
  const medals = [
    { key: "gold", swatchClassName: "bg-medal-gold", label: captions.medalGold },
    { key: "silver", swatchClassName: "bg-medal-silver", label: captions.medalSilver },
    { key: "bronze", swatchClassName: "bg-medal-bronze", label: captions.medalBronze },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-6 p-8">
      <SceneHeading eyebrow={captions.eyebrow} heading={captions.heading} />
      <div className="flex gap-4">
        {medals.map((medal, index) => (
          <div
            key={medal.key}
            style={{ animationDelay: `${index * MEDAL_STAGGER_STEP_MS}ms` }}
            className="panel motion-safe:animate-[onboarding-rise-in_500ms_ease-out_backwards] flex flex-1 flex-col items-center gap-2 p-4"
          >
            <span aria-hidden className={`h-4 w-4 rounded-full ${medal.swatchClassName}`} />
            <span className="text-label text-text-muted">{medal.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransferScene({ captions }: { captions: Scene2Messages }) {
  return (
    <div className="flex h-full flex-col justify-center gap-8 p-8">
      <SceneHeading eyebrow={captions.eyebrow} heading={captions.heading} />
      <div className="relative flex items-center justify-between px-4">
        <div className="panel flex h-16 w-16 items-center justify-center">
          <span className="text-label">{captions.fromChip}</span>
        </div>
        <span
          aria-hidden
          className="motion-safe:animate-[onboarding-fly-across_1.4s_ease-in-out_backwards] absolute top-1/2 left-16 h-10 w-10 rounded-sm bg-accent"
        />
        <div className="panel relative flex h-16 w-16 items-center justify-center">
          <span className="text-label">{captions.toChip}</span>
          <span className="motion-safe:animate-[onboarding-pop_400ms_ease-out_1.3s_backwards] absolute -top-3 -right-3 rounded-sm bg-accent px-2 py-0.5 text-label text-on-accent">
            {captions.tagBadge}
          </span>
        </div>
      </div>
    </div>
  );
}

function CaptureScene({ captions }: { captions: Scene3Messages }) {
  const fields = [captions.fieldTime, captions.fieldPace, captions.fieldDistance, captions.fieldPlace];
  return (
    <div className="flex h-full flex-col justify-center gap-6 p-8">
      <SceneHeading eyebrow={captions.eyebrow} heading={captions.heading} />
      <div className="panel relative mx-auto flex w-48 flex-col gap-2 p-3">
        <span className="motion-safe:animate-[onboarding-pop_400ms_ease-out_backwards] absolute -top-3 -right-3 rounded-sm bg-accent px-2 py-0.5 text-label text-on-accent">
          {captions.aiBadge}
        </span>
        {fields.map((field, index) => (
          <span
            key={field}
            style={{ animationDelay: `${FIELD_STAGGER_START_MS + index * FIELD_STAGGER_STEP_MS}ms` }}
            className="field-shimmer motion-safe:animate-[onboarding-rise-in_400ms_ease-out_backwards] rounded-sm border border-line px-2 py-1 text-label text-text-muted"
          >
            {field}
          </span>
        ))}
      </div>
    </div>
  );
}

// Cycles the three onboarding scenes on a timer, looping back to the first
// once the last one finishes. Each scene remounts on every visit (`key`
// below) so its entrance animations replay instead of only firing once.
export function OnboardingPlayer({
  scene1,
  scene2,
  scene3,
}: {
  scene1: Scene1Messages;
  scene2: Scene2Messages;
  scene3: Scene3Messages;
}) {
  const [activeScene, setActiveScene] = useState(0);
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    const advanceScene = () => {
      setActiveScene((current) => (current + 1) % SCENE_COUNT);
      setPlayCount((current) => current + 1);
    };
    const timer = setInterval(advanceScene, SCENE_DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="panel relative aspect-video w-full overflow-hidden">
      {activeScene === 0 && <MedalScene key={`medals-${playCount}`} captions={scene1} />}
      {activeScene === 1 && <TransferScene key={`transfer-${playCount}`} captions={scene2} />}
      {activeScene === 2 && <CaptureScene key={`capture-${playCount}`} captions={scene3} />}
    </div>
  );
}
