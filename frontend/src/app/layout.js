import { Outlet } from 'react-router-dom';
import { useTheme } from '../lib/theme.js';

export default function RootLayout() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <div className="min-h-screen">
      <main><Outlet /></main>
      <button
        className="theme-fab"
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${nextTheme} mode`}
        title={`Switch to ${nextTheme} mode`}
      >
        <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
      </button>
    </div>
  );
}
