import type { Locale } from "../../i18n/locale";
import { switchLocale } from "../../session/actions";

type LanguageSwitcherProps = {
  currentLocale: Locale;
  label: string;
};

const LOCALE_BUTTON_LABEL: Record<Locale, string> = {
  en: "EN",
  es: "ES",
};

export function LanguageSwitcher({ currentLocale, label }: LanguageSwitcherProps) {
  return (
    <form action={switchLocale} aria-label={label} className="flex gap-0.5 lg:w-full">
      {(["en", "es"] as const).map((locale) => (
        <button
          key={locale}
          type="submit"
          name="locale"
          value={locale}
          aria-pressed={locale === currentLocale}
          className="text-label flex-1 cursor-pointer rounded-sm border border-line px-3 py-1.5 text-text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-accent aria-pressed:border-accent aria-pressed:text-accent"
        >
          {LOCALE_BUTTON_LABEL[locale]}
        </button>
      ))}
    </form>
  );
}
