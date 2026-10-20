import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authClient } from '../../lib/auth-client.js';
import { productionApi } from '../../lib/production-api.js';
import { useTheme } from '../../lib/theme.js';

const modules = [
  { key: 'overview', title: 'Factory overview', detail: 'Daily output and the production floor', icon: '◫' },
  { key: 'production', title: 'Shift entry', detail: 'Record output, scrap, and material usage', icon: '＋' },
  { key: 'downtime', title: 'Machine downtime', detail: 'Log and resolve machine stoppages', icon: '◷' },
  { key: 'products', title: 'Products & BOMs', detail: 'Manage production recipes', icon: '◇' },
  { key: 'orders', title: 'Manufacturing orders', detail: 'Plan and track shop-floor work', icon: '▤' },
  { key: 'machines', title: 'Machines & tools', detail: 'Manage lines and tooling', icon: '⚙' },
  { key: 'quality', title: 'Quality & traceability', detail: 'Record inspections and supplier lots', icon: '◉' },
  { key: 'reports', title: 'Reports', detail: 'Review weekly and monthly results', icon: '▥' },
];

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const { theme, toggleTheme } = useTheme();
  const [signingOut, setSigningOut] = useState(false);
  const [access, setAccess] = useState(null);
  const [accessError, setAccessError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!session?.user) return;
    productionApi.getAccess().then(setAccess).catch((error) => setAccessError(error.message));
  }, [session?.user]);

  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || 'there';
  const signOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      navigate('/', { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  if (isPending) return <div className="page-loading">Opening Lyu ERP<span>✳</span></div>;
  if (!session?.user) return <Navigate to="/go?mode=signin" replace />;

  const visibleModules = modules.filter((module) => access?.user?.isAdmin || access?.modules?.includes(module.key));
  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  return (
    <main className="erp-dashboard">
      <div className="erp-dashboard-top"><div><p className="prod-eyebrow">LYU ERP · OPERATIONS</p><p>{today}</p></div><div><span className="erp-user-chip">{session.user.name}</span>{access?.user?.isAdmin && <Link to="/dashboard/settings" className="prod-button prod-button-outline">System settings</Link>}<button className="theme-toggle" onClick={toggleTheme}>{theme === 'light' ? '☾ Dark mode' : '☀ Light mode'}</button><button className="erp-signout" onClick={signOut} disabled={signingOut}>{signingOut ? 'Signing out…' : 'Sign out ↗'}</button></div></div>
      <section className="erp-dashboard-welcome"><div><span className="prod-factory-chip">YOUR WORKSPACE</span><h1>Welcome back, {firstName}.</h1><p>Your assigned production tools, reports, and daily work in one place.</p></div><Link to="/production" className="prod-button prod-button-primary">Open production workspace <span>↗</span></Link></section>
      <section className="erp-dashboard-cards"><article><span>01 · FACTORY OPERATIONS</span><h2>Keep production moving.</h2><p>Log shifts, manage manufacturing orders, and keep every machine accounted for.</p><Link to="/production">Go to production <b>↗</b></Link></article><article><span>02 · QUALITY & REPORTING</span><h2>See the full picture.</h2><p>Follow product quality, supplier lots, machine performance, and weekly trends.</p><Link to="/production">Explore reports <b>↗</b></Link></article></section>
      <section className="erp-modules"><div className="erp-modules-heading"><div><p className="prod-eyebrow">YOUR ASSIGNED WORK</p><h2>Production modules</h2><p>Only modules assigned to your account are shown here.</p></div>{access?.user?.isAdmin && <span className="prod-pill prod-pill-gold">Administrator</span>}</div>
        {accessError && <p className="form-error">{accessError}</p>}
        {!access && !accessError && <div className="page-loading">Loading assignments…</div>}
        {access && visibleModules.length === 0 && <div className="prod-empty"><strong>No modules assigned yet</strong><p>Ask your administrator to assign your production tasks.</p></div>}
        <div className="erp-module-grid">{visibleModules.map((module) => <Link to="/production" className="erp-module-card" key={module.key}><span>{module.icon}</span><div><strong>{module.title}</strong><small>{module.detail}</small></div><b>↗</b></Link>)}</div>
      </section>
      <footer className="prod-footer"><span>LYU ERP · WORKSPACE</span><span>{session.user.email}</span></footer>
    </main>
  );
}
