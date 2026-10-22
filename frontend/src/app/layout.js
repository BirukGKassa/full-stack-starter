import { Outlet } from 'react-router-dom';
import { useTheme } from '../lib/theme.js';

export default function RootLayout() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <div className="min-h-screen min-w-0 scroll-smooth bg-background font-sans text-foreground [font-synthesis:none] [text-rendering:optimizeLegibility] antialiased motion-reduce:[&_*]:scroll-auto motion-reduce:[&_*]:duration-10 motion-reduce:[&]:scroll-auto motion-reduce:[&_*::before]:duration-10 motion-reduce:[&_*::after]:duration-10">
      <main><Outlet /></main>
      <button
        className="fixed bottom-5 right-5 z-[100] grid size-11 place-items-center rounded-full border border-border bg-card text-card-foreground shadow-md transition-colors hover:bg-accent hover:text-accent-foreground"
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
