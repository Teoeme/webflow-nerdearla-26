import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { archivo } from "./fonts";
import { listAthletes } from "../db/athletes";
import { getCurrentAthlete } from "../session/current-athlete";
import { getCurrentLocale } from "../i18n/current-locale";
import { getDictionary } from "../i18n/dictionary";
import { AthleteSwitcher } from "../components/session/athlete-switcher";
import { LanguageSwitcher } from "../components/session/language-switcher";
import { Wordmark } from "../components/ui/wordmark";

const NAV_LINK_CLASS_NAME = "text-label text-text opacity-60 transition-opacity hover:opacity-100";

export const metadata: Metadata = {
  title: "Racebook",
  description: "The athlete's book of races.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [athletes, currentAthlete, currentLocale, dictionary] = await Promise.all([
    listAthletes(),
    getCurrentAthlete(),
    getCurrentLocale(),
    getDictionary(),
  ]);

  return (
    <html lang={currentLocale} className={archivo.variable}>
      <body className="min-h-screen">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
            <Link href="/" className="text-2xl">
              <Wordmark />
            </Link>
            <nav className="flex gap-6">
              <Link href="/" className={NAV_LINK_CLASS_NAME}>
                {dictionary.common.nav.medalBoard}
              </Link>
              <Link href="/inbox" className={NAV_LINK_CLASS_NAME}>
                {dictionary.common.nav.inbox}
              </Link>
            </nav>
            <div className="ml-auto flex items-center gap-6">
              <AthleteSwitcher
                athletes={athletes}
                currentAthleteId={currentAthlete.id}
                label={dictionary.common.viewAsLabel}
              />
              <LanguageSwitcher
                currentLocale={currentLocale}
                label={dictionary.common.languageSwitcherLabel}
              />
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-5xl">{children}</div>
      </body>
    </html>
  );
}
