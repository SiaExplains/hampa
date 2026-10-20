import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { requireLocale } from "@/i18n/locale";
import { directionOf, routing } from "@/i18n/routing";
import { inter, vazirmatn } from "@/lib/fonts";
import { themeInitScript } from "@/lib/theme";
import "@/styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requireLocale();
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
    // Members-only app: nothing is indexed until launch decides what is public (H10).
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#00574b" },
    { media: "(prefers-color-scheme: dark)", color: "#0f2522" },
  ],
};

export default async function LocaleLayout({
  children,
}: LayoutProps<"/[locale]">) {
  const locale = await requireLocale();

  return (
    <html
      lang={locale}
      dir={directionOf(locale)}
      className={`${vazirmatn.variable} ${inter.variable}`}
      // The head script toggles `.dark` before hydration.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
