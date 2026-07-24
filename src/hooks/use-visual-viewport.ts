import { useEffect } from "react";

const APP_HEIGHT_VAR = "--app-height";
const KEYBOARD_INSET_VAR = "--keyboard-inset";

/**
 * Keeps CSS viewport vars in sync with the visual viewport so iOS Safari
 * keyboard open/close does not leave a dead gray band under fixed shells.
 */
export const useVisualViewport = () => {
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const vv = window.visualViewport;
      const height = vv?.height ?? window.innerHeight;
      const offsetTop = vv?.offsetTop ?? 0;
      const keyboardInset = Math.max(
        0,
        window.innerHeight - height - offsetTop
      );
      root.style.setProperty(APP_HEIGHT_VAR, `${Math.round(height)}px`);
      root.style.setProperty(
        KEYBOARD_INSET_VAR,
        `${Math.round(keyboardInset)}px`
      );
    };

    sync();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      root.style.removeProperty(APP_HEIGHT_VAR);
      root.style.removeProperty(KEYBOARD_INSET_VAR);
    };
  }, []);
};
