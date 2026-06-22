export type Theme = "light" | "dark";

const KEY = "xw-theme";

export function getInitialTheme(): Theme {
  const saved = localStorage.getItem(KEY) as Theme | null;
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(KEY, theme);
  applyTheme(theme);
}
