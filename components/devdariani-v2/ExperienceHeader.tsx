import type { ExperienceCopy } from "@/lib/devdariani-v2/copy";
import type { Locale } from "@/lib/devdariani-v2/locales";
import { DevdarianiWordmark } from "./DevdarianiWordmark";
import { LanguageSwitcher } from "./LanguageSwitcher";

type ExperienceHeaderProps = {
  copy: ExperienceCopy;
  locale: Locale;
};

export function ExperienceHeader({ copy, locale }: ExperienceHeaderProps) {
  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-40 px-5 py-5 md:px-10 md:py-7">
      <nav className="pointer-events-auto flex items-center justify-between">
        <a href="#home" className="text-[var(--text)]">
          <DevdarianiWordmark className="text-[0.82rem] md:text-[0.92rem]" compact />
        </a>
        <div className="flex items-center gap-5 md:gap-8">
          <LanguageSwitcher locale={locale} />
          <span className="hidden text-[0.62rem] uppercase tracking-[0.28em] text-[var(--text-muted)] md:block">
            {copy.meta.menu}
          </span>
          <button
            aria-label={copy.meta.menu}
            className="grid gap-1.5"
            type="button"
          >
            <span className="h-px w-8 bg-[var(--text)]" />
            <span className="h-px w-8 bg-[var(--text)]" />
          </button>
        </div>
      </nav>
    </header>
  );
}
