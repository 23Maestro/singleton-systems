type Theme = "dark" | "light";
const key = "singleton-command-center-theme";
const eventName = "command-center-theme";
let sessionTheme: Theme | undefined;

export function getTheme(): Theme {
  if (sessionTheme) return sessionTheme;
  try {
    const saved = localStorage.getItem(key);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // Keep the toggle usable when browser storage is unavailable.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getServerTheme(): Theme {
  return "dark";
}

export function setTheme(theme: Theme) {
  sessionTheme = theme;
  try {
    localStorage.setItem(key, theme);
  } catch {
    // The choice still lasts for this session.
  }
  window.dispatchEvent(new Event(eventName));
}

export function subscribeTheme(listener: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      sessionTheme = undefined;
      listener();
    }
  };
  window.addEventListener(eventName, listener);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", listener);
  return () => {
    window.removeEventListener(eventName, listener);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", listener);
  };
}
