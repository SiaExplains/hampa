import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "./routing";

// The [locale] segment also catches stray paths like /favicon.ico (the proxy skips
// anything with a dot), so every reader of the root param must validate it.
export async function requireLocale(): Promise<Locale> {
  const locale = await rootParams.locale();
  if (!hasLocale(routing.locales, locale)) notFound();
  return locale;
}
