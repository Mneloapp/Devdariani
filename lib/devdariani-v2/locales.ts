export const locales = ["en", "ka"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getAlternateLocale(locale: Locale) {
  return locale === "en" ? "ka" : "en";
}
