import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "app:theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  const effective = theme === "system" ? getSystemTheme() : theme;

  root.dataset.theme = effective;

  if (effective === "dark") {
    root.style.setProperty("--background", "#0a0a0a");
    root.style.setProperty("--foreground", "#e5e5e5");
  } else {
    root.style.setProperty("--background", "#fafafa");
    root.style.setProperty("--foreground", "#1a1a1a");
  }
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>(STORAGE_KEY, "system");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const effective = theme === "system" ? getSystemTheme() : theme;
    const next = effective === "light" ? "dark" : "light";

    setTheme(next);
  };

  return {
    theme,
    toggleTheme,
    effectiveTheme: theme === "system" ? getSystemTheme() : theme,
  };
}
