import Link from "next/link";
import { getAlternateLocale, type Locale } from "@/lib/devdariani-v2/locales";

type LanguageSwitcherProps = {
  locale: Locale;
};

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const alternate = getAlternateLocale(locale);

  return (
    <Link
      className="text-[0.66rem] uppercase tracking-[0.24em] text-[var(--text-muted)] transition hover:text-[var(--text)]"
      href={`/experience-v2/${alternate}`}
    >
      {locale.toUpperCase()} / {alternate.toUpperCase()}
    </Link>
  );
}
