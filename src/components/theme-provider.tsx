import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { THEME_COOKIE_NAME, type Theme } from "@/lib/theme";

type ThemeProviderProps = {
	children: ReactNode;
	defaultTheme?: Theme;
	serverTheme?: Theme;
	storageKey?: string;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
	theme: "system",
	setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

async function setThemeCookie(theme: Theme) {
	if ("cookieStore" in window) {
		const oneYear = Date.now() + 365 * 24 * 60 * 60 * 1000;
		await window.cookieStore.set({
			name: THEME_COOKIE_NAME,
			value: theme,
			path: "/",
			expires: oneYear,
			sameSite: "lax",
		});
	}
}

export function ThemeProvider({
	children,
	defaultTheme = "system",
	serverTheme,
	storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
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

	const value = {
		theme,
		setTheme: (newTheme: Theme) => {
			// Update both localStorage (for backwards compat) and cookie (for SSR)
			window.localStorage.setItem(storageKey, newTheme);
			setThemeCookie(newTheme);
			setTheme(newTheme);
		},
	};

	return (
		<ThemeProviderContext.Provider value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeProviderContext);

	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
}
