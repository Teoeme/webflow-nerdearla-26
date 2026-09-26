import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { archivo } from "./fonts";
import { listAthletes } from "../db/athletes";
import { listIncomingTransfers } from "../db/transfers";
import { listIncomingTags } from "../db/photo-tags";
import { getCurrentAthlete } from "../session/current-athlete";
import { getCurrentLocale } from "../i18n/current-locale";
import { getDictionary } from "../i18n/dictionary";
import { AthleteSwitcher } from "../components/session/athlete-switcher";
import { LanguageSwitcher } from "../components/session/language-switcher";
import { Nav } from "../components/session/nav";
import { Wordmark } from "../components/ui/wordmark";
import { OnboardingLauncher } from "../features/onboarding/onboarding-launcher";

export const metadata: Metadata = {
  title: "Racebook",
  description: "The athlete's book of races.",
};

async function countPendingInboxItems(athleteId: string): Promise<number> {
  const [incomingTransfers, incomingTags] = await Promise.all([
    listIncomingTransfers(athleteId),
    listIncomingTags(athleteId),
  ]);
  return incomingTransfers.length + incomingTags.length;
}

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
  const pendingInboxCount = await countPendingInboxItems(currentAthlete.id);

  const navItems = [
    { href: "/", label: dictionary.common.nav.medalBoard, pendingCount: 0 },
    { href: "/inbox", label: dictionary.common.nav.inbox, pendingCount: pendingInboxCount },
  ];

  return (
    <html lang={currentLocale} className={archivo.variable}>
      <body className="min-h-screen lg:flex">
        <header className="flex flex-col gap-6 border-b border-line px-6 py-4 lg:h-screen lg:w-60 lg:flex-none lg:justify-between lg:border-r lg:border-b-0 lg:py-8">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 lg:flex-col lg:items-start lg:gap-6">
            <Link href="/" className="text-lg">
              <Wordmark />
            </Link>
            <Nav items={navItems} />
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:flex-col lg:items-stretch lg:gap-3">
            <AthleteSwitcher
              athletes={athletes}
              currentAthleteId={currentAthlete.id}
              label={dictionary.common.viewAsLabel}
            />
            <LanguageSwitcher
              currentLocale={currentLocale}
              label={dictionary.common.languageSwitcherLabel}
            />
            <OnboardingLauncher messages={dictionary.onboarding} />
          </div>
        </header>
        <div className="mx-auto w-full max-w-5xl lg:h-screen lg:overflow-y-auto">{children}</div>
      </body>
    </html>
  );
}
