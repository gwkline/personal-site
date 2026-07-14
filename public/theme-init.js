(() => {
  try {
    const stored = localStorage.getItem("vite-ui-theme") || "dark";
    let resolved = stored;
    if (stored === "system") {
      resolved = matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(resolved);
  } catch {
    // The client provider will resolve the theme after hydration.
  }
})();
