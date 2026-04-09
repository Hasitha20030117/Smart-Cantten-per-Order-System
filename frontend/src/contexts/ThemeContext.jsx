import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') === 'dark';
    setDarkMode(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {/* Global Theme Toggle Button - Fixed Top Right */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-[100] bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl border border-white/60 dark:border-slate-700/60 hover:scale-105 hover:shadow-3xl transition-all duration-300 flex items-center gap-1 text-slate-900 dark:text-slate-100"
        title="Toggle dark/light mode"
        aria-label="Toggle theme"
      >
        {darkMode ? <Sun className="w-5 h-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      {children}
    </ThemeContext.Provider>
  );
};

