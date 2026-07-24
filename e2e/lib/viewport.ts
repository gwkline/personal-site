import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

const SCROLL = "#app-scroll-container";

export interface ViewportSnapshot {
  scale: number;
  offsetTop: number;
  offsetLeft: number;
  innerWidth: number;
  scrollWidth: number;
  scroll: {
    top: number;
    left: number;
    clientWidth: number;
    scrollWidth: number;
  } | null;
}

export const readViewport = (page: Page): Promise<ViewportSnapshot> =>
  page.evaluate((scrollSelector) => {
    const vv = window.visualViewport;
    const el = document.querySelector<HTMLElement>(scrollSelector);
    const html = document.documentElement;

    return {
      innerWidth: window.innerWidth,
      offsetLeft: vv?.offsetLeft ?? 0,
      offsetTop: vv?.offsetTop ?? 0,
      scale: vv?.scale ?? 1,
      scroll: el
        ? {
            clientWidth: el.clientWidth,
            left: el.scrollLeft,
            scrollWidth: el.scrollWidth,
            top: el.scrollTop,
          }
        : null,
      scrollWidth: Math.max(html.scrollWidth, document.body?.scrollWidth ?? 0),
    };
  }, SCROLL);

/** No stuck zoom/shift, no horizontal overflow. */
export const expectStableViewport = async (
  page: Page,
  slack = 1
): Promise<ViewportSnapshot> => {
  const state = await readViewport(page);

  expect(state.scale).toBeCloseTo(1, 2);
  expect(state.offsetTop).toBe(0);
  expect(state.offsetLeft).toBe(0);
  expect(state.scrollWidth).toBeLessThanOrEqual(state.innerWidth + slack);

  if (state.scroll) {
    expect(state.scroll.scrollWidth).toBeLessThanOrEqual(
      state.scroll.clientWidth + slack
    );
    expect(state.scroll.left).toBe(0);
  }

  return state;
};

export const scrollAppBy = async (page: Page, dy: number) => {
  await page.evaluate(
    ({ scrollSelector, dy: delta }) => {
      const el = document.querySelector<HTMLElement>(scrollSelector);
      if (el) {
        el.scrollTop += delta;
        return;
      }
      window.scrollBy(0, delta);
    },
    { dy, scrollSelector: SCROLL }
  );
};

export const scrollAppToTop = async (page: Page) => {
  await page.evaluate((scrollSelector) => {
    const el = document.querySelector<HTMLElement>(scrollSelector);
    if (el) {
      el.scrollTop = 0;
      return;
    }
    window.scrollTo(0, 0);
  }, SCROLL);
};

export const expectViewportAllowsZoom = async (page: Page) => {
  const content = await page
    .locator('meta[name="viewport"]')
    .getAttribute("content");

  expect(content).toBeTruthy();
  const normalized = (content ?? "").toLowerCase().replaceAll(/\s+/gu, "");
  expect(normalized).toContain("width=device-width");
  expect(normalized).toContain("viewport-fit=cover");
  expect(normalized).toContain("interactive-widget=resizes-content");
  expect(normalized).not.toMatch(/user-scalable=no|maximum-scale=1(?:\.0)?/u);
};
