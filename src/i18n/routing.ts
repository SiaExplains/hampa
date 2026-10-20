import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fa", "en", "de"],
  defaultLocale: "fa",
  // Always prefixed so links shared in Telegram are unambiguous (07-i18n.md).
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

const rtlLocales: ReadonlySet<Locale> = new Set(["fa"]);

export function directionOf(locale: Locale): "rtl" | "ltr" {
  return rtlLocales.has(locale) ? "rtl" : "ltr";
}
