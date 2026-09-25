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
    <form action={switchLocale} aria-label={label}>
      {(["en", "es"] as const).map((locale) => (
        <button
          key={locale}
          type="submit"
          name="locale"
          value={locale}
          aria-pressed={locale === currentLocale}
        >
          {LOCALE_BUTTON_LABEL[locale]}
        </button>
      ))}
    </form>
  );
}
