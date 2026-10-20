"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  THEME_MODES,
  THEME_STORAGE_KEY,
  isThemeMode,
  resolveDark,
  type ThemeMode,
} from "@/lib/theme";

const icons = { light: Sun, dark: Moon, system: Monitor } as const;
const listeners = new Set<() => void>();

function readMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function apply(mode: ThemeMode) {
  const dark = resolveDark(
    mode,
    matchMedia("(prefers-color-scheme: dark)").matches,
  );
  document.documentElement.classList.toggle("dark", dark);
}

function setMode(mode: ThemeMode) {
  try {
    if (mode === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  apply(mode);
  for (const l of listeners) l();
}

export function ThemeToggle() {
  const t = useTranslations("theme");
  // Server snapshot is null: nothing is marked selected until the client knows the mode,
  // which avoids a hydration mismatch without a flash (the <head> script set the class).
  const mode = useSyncExternalStore(subscribe, readMode, () => null);

  useEffect(() => {
    if (mode !== "system") return;
    const query = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [mode]);

  return (
    <div
      role="radiogroup"
      aria-label={t("label")}
      className="inline-flex items-center gap-0.5 rounded-full border bg-card p-0.5"
    >
      {THEME_MODES.map((m) => {
        const Icon = icons[m];
        const selected = mode === m;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={t(m)}
            title={t(m)}
            onClick={() => setMode(m)}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              selected && "bg-secondary text-secondary-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
