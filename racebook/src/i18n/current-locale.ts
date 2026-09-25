import { cookies, headers } from "next/headers";
import { defaultLocale, isLocale, locales, type Locale } from "./locale";

export const LOCALE_COOKIE_NAME = "racebook_locale";

function findSupportedLocale(acceptLanguage: string): Locale | undefined {
  const requestedLanguages = acceptLanguage
    .split(",")
    .map((entry) => entry.split(";")[0].trim().split("-")[0]);
  return locales.find((locale) => requestedLanguages.includes(locale));
}

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");
  if (acceptLanguage) {
    const supportedLocale = findSupportedLocale(acceptLanguage);
    if (supportedLocale) return supportedLocale;
  }

  return defaultLocale;
}
