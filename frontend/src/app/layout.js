import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

const navLinkClass = ({ isActive }) =>
  `rounded-full px-3 py-2 text-sm transition ${isActive ? 'text-forest' : 'text-ink/55 hover:text-forest'}`;

export default function RootLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/go';

  return (
    <div className="min-h-screen">
      <header className="site-header">
        <Link to="/" className="brand" aria-label="Northstar home">
          <span className="brand-mark"><span /></span>
          <span>northstar<span className="brand-dot">.</span></span>
        </Link>
        {!isAuthPage && (
          <nav className="hidden items-center gap-2 sm:flex" aria-label="Main navigation">
            <NavLink to="/" className={navLinkClass} end>Overview</NavLink>
            <a className="rounded-full px-3 py-2 text-sm text-ink/55 transition hover:text-forest" href="/#how-it-works">How it works</a>
          </nav>
        )}
        <div className="flex items-center gap-3">
          {isAuthPage ? (
            <Link to="/" className="text-sm font-semibold text-ink/60 transition hover:text-forest">Back home</Link>
          ) : (
            <>
              <Link to="/go?mode=signin" className="hidden text-sm font-semibold text-ink/65 transition hover:text-forest sm:block">Sign in</Link>
              <Link to="/go?mode=signup" className="button button-dark button-small">Get started <span aria-hidden="true">↗</span></Link>
            </>
          )}
        </div>
      </header>
      <main><Outlet /></main>
      {!isAuthPage && <footer className="site-footer"><span>© 2026 Northstar</span><span>Less noise. More meaningful work.</span></footer>}
    </div>
  );
}
