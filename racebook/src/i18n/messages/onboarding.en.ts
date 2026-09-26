export const onboardingEn = {
  trigger: "How it works",
  modalTitle: "How Racebook works",
  closeLabel: "Close",
  skip: "Skip",
  start: "Start",
  scene1: {
    eyebrow: "1",
    heading: "Your book of races",
    summary: "Every race you finish becomes a medal card in your book.",
    medalGold: "Gold",
    medalSilver: "Silver",
    medalBronze: "Bronze",
  },
  scene2: {
    eyebrow: "2",
    heading: "Every photo ends up with the person in it",
    summary: "Send a photo or tag a friend — it lands in their gallery too.",
    fromChip: "You",
    toChip: "Friend",
    tagBadge: "Tagged",
  },
  scene3: {
    eyebrow: "3",
    heading: "Log metrics from a screenshot",
    summary: "Drop a screenshot and the fields fill themselves.",
    aiBadge: "AI",
    fieldTime: "Time",
    fieldPace: "Pace",
    fieldDistance: "Distance",
    fieldPlace: "Place",
  },
};

export type OnboardingMessages = typeof onboardingEn;
