"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved =
      (localStorage.getItem("ao-theme") as "dark" | "light" | null) ?? "dark";
    setTheme(saved);
    document.documentElement.classList.toggle("light", saved === "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("ao-theme", next);
    document.documentElement.classList.toggle("light", next === "light");
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  );
}
