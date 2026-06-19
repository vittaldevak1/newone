import { createContext, useEffect, useState, useCallback } from "react";
import { PALETTES } from '../palettes';

export const ThemeContext = createContext();

function ThemeProvider({ children }) {

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const [palette, setPalette] = useState(
    localStorage.getItem("palette") || "indigo"
  );

  const applyPalette = useCallback((paletteId) => {
    const p = PALETTES[paletteId];
    if (!p) return;
    const vars = theme === 'dark' ? p.dark : p.light;
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem("theme", theme);
    applyPalette(palette);
  }, [theme, palette, applyPalette]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const changePalette = (id) => {
    setPalette(id);
    localStorage.setItem("palette", id);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, palette, changePalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
