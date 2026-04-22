import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative group flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
      <button
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-full transition-all duration-300 ${
          theme === "light"
            ? "bg-white dark:bg-slate-900 text-emerald-500 shadow-sm dark:bg-transparent"
            : "text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-300"
        }`}
        title="Light Mode"
      >
        <Sun size={16} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-1.5 rounded-full transition-all duration-300 ${
          theme === "system"
            ? "bg-white dark:bg-slate-700 text-blue-500 shadow-sm"
            : "text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-300"
        }`}
        title="System Theme"
      >
        <Monitor size={16} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-full transition-all duration-300 ${
          theme === "dark"
            ? "bg-slate-700 text-indigo-400 shadow-sm"
            : "text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-300"
        }`}
        title="Dark Mode"
      >
        <Moon size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
