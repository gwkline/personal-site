import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

export const getServerTheme = createServerFn({ method: "GET" }).handler(() => {
	const theme = getCookie(THEME_COOKIE_NAME) as Theme | undefined;
	return theme;
});

export type Theme = "dark" | "light" | "system";

export const THEME_COOKIE_NAME = "theme";
