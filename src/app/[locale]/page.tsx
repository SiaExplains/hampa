import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_VERSION } from "@/lib/version";

// H0 placeholder home: proves fonts, direction, tokens and theming in every locale.
export default function HomePage() {
  const t = useTranslations();

  return (
    <>
      <header className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <LocaleSwitcher />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <p className="mb-6 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
          {t("home.soon")}
        </p>
        <h1 className="text-5xl font-bold tracking-tight text-primary sm:text-6xl">
          {t("meta.title")}
        </h1>
        <p className="mt-4 text-xl font-semibold sm:text-2xl">
          {t("home.tagline")}
        </p>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          {t("home.lead")}
        </p>
      </main>

      <footer className="px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        {t("footer.version", { version: APP_VERSION })}
      </footer>
    </>
  );
}
