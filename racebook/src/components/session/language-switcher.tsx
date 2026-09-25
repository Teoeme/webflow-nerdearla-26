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
    <form
      action={switchLocale}
      aria-label={label}
      className="flex rounded-sm border border-line"
    >
      {(["en", "es"] as const).map((locale) => (
        <button
          key={locale}
          type="submit"
          name="locale"
          value={locale}
          aria-pressed={locale === currentLocale}
          className="text-label cursor-pointer px-3 py-1.5 text-text opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-accent aria-pressed:text-accent aria-pressed:opacity-100"
        >
          {LOCALE_BUTTON_LABEL[locale]}
        </button>
      ))}
    </form>
  );
}
