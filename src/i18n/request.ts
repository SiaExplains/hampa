import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { requireLocale } from "./locale";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  // An explicitly passed locale is validated too: it builds the messages import path.
  if (locale === undefined) locale = await requireLocale();
  else if (!hasLocale(routing.locales, locale)) notFound();

  return {
    locale,
    // Events happen in Berlin; render times there regardless of device zone.
    timeZone: "Europe/Berlin",
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
