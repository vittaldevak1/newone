import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function ThemeToggle() {

  const { theme, toggleTheme } = useContext(ThemeContext);

  return (

    <button
      className="theme-toggle"
      onClick={toggleTheme}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>

  );

}

export default ThemeToggle;