export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "hampa-theme";
export const THEME_MODES: readonly ThemeMode[] = ["light", "dark", "system"];

// Runs in <head> before first paint so a dark-mode user never sees a light flash.
// Kept dependency-free and wrapped in try/catch: storage can be blocked.
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function resolveDark(mode: ThemeMode, systemPrefersDark: boolean) {
  return mode === "dark" || (mode === "system" && systemPrefersDark);
}
