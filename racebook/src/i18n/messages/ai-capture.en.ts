export const aiCaptureEn = {
  screenshotCapture: {
    button: "Fill from a screenshot",
    reading: "Reading your screenshot…",
    // A template, not a function: ScreenshotCapture is a client component, and a function
    // can't cross the server/client boundary as a prop (only the messages it needs to
    // render live progress client-side can). "{count}" is replaced with the number of
    // fields the capture actually filled.
    filledTemplate: "Filled {count} of 4 fields. Check them before saving.",
    errors: {
      type: "Use a JPEG, PNG or WEBP screenshot.",
      size: "That screenshot is too large — use one under 5 MB.",
      missing: "Choose a screenshot first.",
      unreadable: "We couldn't read metrics from that image — try a clearer screenshot of the summary screen.",
      unavailable: "Reading screenshots isn't available right now.",
    },
  },
};

export type AiCaptureMessages = typeof aiCaptureEn;
