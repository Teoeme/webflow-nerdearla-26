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
  tour: {
    title: "Try it in two minutes",
    steps: [
      "Use \"View as\" in the sidebar to act as Lucía, Tomás or Sofía (demo accounts, no login).",
      "As Lucía, open a race, add photos, and use Share on a photo to send it to Tomás or tag Sofía.",
      "Switch to Tomás and open the Inbox: accept the photo into one of his races or a new one.",
      "Open a race, choose \"Log my result\" and \"Fill from a screenshot\" to let the AI read your watch summary.",
    ],
    samplesIntro: "No screenshot at hand? Download a sample:",
    sampleLabel: "Sample",
  },
};

export type OnboardingMessages = typeof onboardingEn;
