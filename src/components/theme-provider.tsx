import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { THEME_COOKIE_NAME } from "@/lib/theme";
import type { Theme } from "@/lib/theme";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  serverTheme?: Theme;
  storageKey?: string;
}
interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
const initialState: ThemeProviderState = {
  setTheme: () => null,
  theme: "system",
};
const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
const setThemeCookie = async (theme: Theme) => {
  if ("cookieStore" in window) {
    const oneYear = Date.now() + 365 * 24 * 60 * 60 * 1000;
    await window.cookieStore.set({
      expires: oneYear,
      name: THEME_COOKIE_NAME,
      path: "/",
      sameSite: "lax",
      value: theme,
    });
  }
};
export const ThemeProvider = ({
  children,
  defaultTheme = "system",
  serverTheme,
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // On server or initial render, use serverTheme if available
    if (serverTheme) {
      return serverTheme;
    }
    if (typeof window === "undefined") {
      return defaultTheme;
    }
    // Check localStorage for backwards compatibility
    const stored = window.localStorage.getItem(storageKey) as Theme | null;
    return stored ?? defaultTheme;
  });
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }
    root.classList.add(theme);
  }, [theme]);
  const value = useMemo(
    () => ({
      setTheme: (newTheme: Theme) => {
        // Update both localStorage (for backwards compat) and cookie (for SSR)
        window.localStorage.setItem(storageKey, newTheme);
        setThemeCookie(newTheme);
        setTheme(newTheme);
      },
      theme,
    }),
    [storageKey, theme]
  );
  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
};
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
