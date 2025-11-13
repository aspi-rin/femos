import { useEffect, useMemo, useState } from "react";
import { HeroUIProvider } from "@heroui/react";
import React from "react";

const STORAGE_KEY = "theme"; // 'dark' | 'light' | 'system'

function getSystemDark() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveClassName(pref: string | null) {
  if (pref === "dark") return "dark";
  if (pref === "light") return "light";
  return getSystemDark() ? "dark" : "light";
}

export const ThemeContext = React.createContext<{
  themePref: "dark" | "light" | "system";
  setThemePref: (next: "dark" | "light" | "system") => void;
}>({ themePref: "system", setThemePref: () => {} });

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPref] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  const className = useMemo(() => resolveClassName(pref), [pref]);

  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => {
      if (!pref || pref === "system") {
        document.documentElement.className = e.matches ? "dark" : "light";
      }
    };
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [pref]);

  useEffect(() => {
    document.documentElement.className = className;
  }, [className]);

  const value = useMemo(() => ({
    themePref: (pref ?? "system") as "dark" | "light" | "system",
    setThemePref: (next: "dark" | "light" | "system") => {
      setPref(next);
      localStorage.setItem(STORAGE_KEY, next);
    },
  }), [pref]);

  return (
    <HeroUIProvider>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </HeroUIProvider>
  );
}
