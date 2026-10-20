import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { authClient } from '../lib/auth-client';
import { useTheme } from '../lib/theme.js';

const navLinkClass = ({ isActive }) =>
  `rounded-full px-3 py-2 text-sm transition ${isActive ? 'text-forest' : 'text-ink/55 hover:text-forest'}`;

export default function RootLayout() {
  const { data: session, isPending } = authClient.useSession();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isAuthPage = location.pathname === '/go';

  return (
    <div className="min-h-screen">
      <main><Outlet /></main>
      {!isAuthPage && <footer className="site-footer"><span>© 2026 Lyu ERP</span><span>Production, quality, and people in one place.</span></footer>}
    </div>
  );
}


      // <header className="site-header">
      //   <Link to="/" className="brand" aria-label="Lyu ERP home">
      //     <span className="brand-mark"><span /></span>
      //     <span className='text-black dark:text-white'>LYU<span className="brand-dot"> ERP</span></span>
      //   </Link>
      //   {session?.user && (
      //     <nav className="hidden items-center gap-2 sm:flex" aria-label="Main navigation">
      //       <NavLink to="/" className={navLinkClass} end>Overview</NavLink>
      //       <NavLink to="/dashboard" className={navLinkClass} end>Workspace</NavLink>
      //       <NavLink to="/production" className={navLinkClass}>Production</NavLink>
      //     </nav>
      //   )}
      //   <div className="flex items-center gap-3">
      //     <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? '☾' : '☀'}<span>{theme === 'light' ? 'Dark' : 'Light'}</span></button>
      //     {session?.user ? (
      //       <>
      //         {/* <Link to="/dashboard" className={` hidden text-sm font-semibold text-ink/60 transition hover:text-forest sm:block`}>Workspace</Link> */}
      //       </>
      //     ) : (
      //       <>
      //         <Link to="/go?mode=signin" className="hidden text-sm font-semibold text-ink/65 transition hover:text-forest sm:block">Sign in</Link>
      //         <Link to="/go?mode=signup" className="button button-dark button-small">Create account <span aria-hidden="true">↗</span></Link>
      //       </>
      //     )}
      //   </div>
      // </header>



