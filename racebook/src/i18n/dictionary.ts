import { getCurrentLocale } from "./current-locale";
import type { Locale } from "./locale";
import { commonEn } from "./messages/common.en";
import { commonEs } from "./messages/common.es";
import type { CommonMessages } from "./messages/common.en";
import { resultsEn } from "./messages/results.en";
import { resultsEs } from "./messages/results.es";
import type { ResultsMessages } from "./messages/results.en";
import { galleryEn } from "./messages/gallery.en";
import { galleryEs } from "./messages/gallery.es";
import type { GalleryMessages } from "./messages/gallery.en";
import { aiCaptureEn } from "./messages/ai-capture.en";
import { aiCaptureEs } from "./messages/ai-capture.es";
import type { AiCaptureMessages } from "./messages/ai-capture.en";
import { onboardingEn } from "./messages/onboarding.en";
import { onboardingEs } from "./messages/onboarding.es";
import type { OnboardingMessages } from "./messages/onboarding.en";

export type Dictionary = {
  common: CommonMessages;
  results: ResultsMessages;
  gallery: GalleryMessages;
  aiCapture: AiCaptureMessages;
  onboarding: OnboardingMessages;
};

const dictionaries: Record<Locale, Dictionary> = {
  en: { common: commonEn, results: resultsEn, gallery: galleryEn, aiCapture: aiCaptureEn, onboarding: onboardingEn },
  es: { common: commonEs, results: resultsEs, gallery: galleryEs, aiCapture: aiCaptureEs, onboarding: onboardingEs },
};

export async function getDictionary(): Promise<Dictionary> {
  const locale = await getCurrentLocale();
  return dictionaries[locale];
}
