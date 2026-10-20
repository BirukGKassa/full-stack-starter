import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const storageKey = 'lyu-erp-theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      return saved === 'dark' || saved === 'light' ? saved : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      // Theme still applies for this page load when storage is unavailable.
    }
  }, [theme]);

  useEffect(() => {
    const toggle = () => setTheme((current) => current === 'light' ? 'dark' : 'light');
    window.addEventListener('lyu-toggle-theme', toggle);
    return () => window.removeEventListener('lyu-toggle-theme', toggle);
  }, []);

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme((current) => current === 'light' ? 'dark' : 'light'),
  }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider.');
  return value;
}
