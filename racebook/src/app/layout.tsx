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
      <body>
        <header>
          <span className="italic font-black uppercase tracking-tight">
            {dictionary.common.wordmark}
          </span>
          <nav>
            <Link href="/">{dictionary.common.nav.medalBoard}</Link>
            <Link href="/inbox">{dictionary.common.nav.inbox}</Link>
          </nav>
          <AthleteSwitcher
            athletes={athletes}
            currentAthleteId={currentAthlete.id}
            label={dictionary.common.viewAsLabel}
          />
          <LanguageSwitcher
            currentLocale={currentLocale}
            label={dictionary.common.languageSwitcherLabel}
          />
        </header>
        {children}
      </body>
    </html>
  );
}
