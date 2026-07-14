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
  resolvedTheme: "dark" | "light";
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
const initialState: ThemeProviderState = {
  resolvedTheme: "light",
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
    return;
  }
  // Cookie Store is not yet available in every supported browser.
  // oxlint-disable-next-line unicorn/no-document-cookie
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; Max-Age=31536000; Path=/; SameSite=Lax`;
};
export const ThemeProvider = ({
  children,
  defaultTheme = "dark",
  serverTheme,
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(serverTheme ?? defaultTheme);
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "dark" || stored === "light" || stored === "system") {
      queueMicrotask(() => setTheme(stored));
    }
  }, [storageKey]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => {
      setSystemTheme(media.matches ? "dark" : "light");
    };
    queueMicrotask(updateSystemTheme);
    media.addEventListener("change", updateSystemTheme);
    return () => media.removeEventListener("change", updateSystemTheme);
  }, []);

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);
  const value = useMemo(
    () => ({
      resolvedTheme,
      setTheme: (newTheme: Theme) => {
        // Update both localStorage (for backwards compat) and cookie (for SSR)
        window.localStorage.setItem(storageKey, newTheme);
        setThemeCookie(newTheme);
        setTheme(newTheme);
      },
      theme,
    }),
    [resolvedTheme, storageKey, theme]
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
