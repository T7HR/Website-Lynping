"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem("lynping-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("lynping-theme", nextTheme);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={theme === "dark" ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
      aria-pressed={theme === "light"}
      onClick={toggleTheme}
      title={theme === "dark" ? "โหมดมืด" : "โหมดสว่าง"}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-icon theme-toggle-moon" aria-hidden="true" />
        <span className="theme-toggle-icon theme-toggle-sun" aria-hidden="true" />
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  );
}
