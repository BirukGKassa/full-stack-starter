import { Outlet } from 'react-router-dom';
import { useTheme } from '../lib/theme.js';

export default function RootLayout() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <div className="min-h-screen min-w-[320px] scroll-smooth bg-[#f5f7f2] font-sans text-[#111a17] [font-synthesis:none] [text-rendering:optimizeLegibility] antialiased dark:bg-[#111a16] dark:text-[#e4ebe5] dark:scheme-dark [&_button:focus-visible]:outline-[3px_solid_#92bb68] [&_a:focus-visible]:outline-[3px_solid_#92bb68] [&_input:focus-visible]:outline-[3px_solid_#92bb68] [&_button:focus-visible]:outline-offset-[3px] [&_a:focus-visible]:outline-offset-[3px] [&_input:focus-visible]:outline-offset-[3px] motion-reduce:[&_*]:scroll-auto motion-reduce:[&_*]:duration-10 motion-reduce:[&]:scroll-auto motion-reduce:[&]:duration-10 motion-reduce:[&_*::before]:duration-10 motion-reduce:[&_*::after]:duration-10">
      <main><Outlet /></main>
      <button
        className="fixed z-[100] right-[22px] bottom-[22px] w-[54px] h-[54px] grid place-items-center border border-[#dce5d8] rounded-full bg-[#fffefa] text-[#254c35] shadow-[0_8px_24px_#10251a2b] text-[23px] cursor-pointer transition-[transform,box-shadow] duration-200 [&:hover]:translate-y-[-2px] [&:hover]:shadow-[0_0_28px_12px_#10251a38] dark:border-[#35463b] dark:bg-[#202d25] dark:text-[#d5e1d6]"
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
