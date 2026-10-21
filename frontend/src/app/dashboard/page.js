import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authClient } from '../../lib/auth-client.js';
import { productionApi } from '../../lib/production-api.js';
import Brand from '../components/brand.js';

const modules = [
  { key: 'production', title: 'Production', detail: 'Manufacturing operations, plans, and shifts', icon: '◫', fallback: ['downtime', 'products', 'orders', 'machines', 'overview'] },
  { key: 'inventory', title: 'Inventory & warehouse', detail: 'Stock, materials, and warehouse operations', icon: '▤' },
  { key: 'purchasing', title: 'Purchasing & suppliers', detail: 'Procurement and supplier management', icon: '↗' },
  { key: 'sales', title: 'Sales & customers', detail: 'Customer orders and fulfillment', icon: '⌑' },
  { key: 'finance', title: 'Finance & accounting', detail: 'Financial operations and reporting', icon: '◷' },
  { key: 'hr', title: 'Human resources', detail: 'Employees and workforce operations', icon: '♧' },
  { key: 'quality', title: 'Quality management', detail: 'Inspections and traceability', icon: '◉' },
  { key: 'maintenance', title: 'Maintenance', detail: 'Equipment care and service planning', icon: '⚙' },
  { key: 'reports', title: 'Reports & analytics', detail: 'Business-wide reports and insights', icon: '▥' },
];

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [access, setAccess] = useState(null);
  const [system, setSystem] = useState(null);
  const [accessError, setAccessError] = useState('');
  const [signOutError, setSignOutError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!session?.user) return;
    productionApi.getAccess().then(setAccess).catch((error) => setAccessError(error.message));
    const refreshSystem = () => fetch('/api/public/system', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`System information unavailable (${response.status})`)))
      .then(setSystem)
      .catch((error) => console.error('Could not refresh system status:', error));
    refreshSystem();
    const timer = window.setInterval(refreshSystem, 10 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [session?.user]);

  const visibleModules = useMemo(() => modules.filter((module) => access?.user?.isAdmin
    || access?.modules?.includes(module.key)
    || module.fallback?.some((key) => access?.modules?.includes(key))), [access]);
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || 'there';
  const signOut = async () => {
    setSigningOut(true);
    setSignOutError('');
    try {
      await authClient.signOut();
      navigate('/', { replace: true });
    } catch (error) {
      setSignOutError(error.message || 'Could not sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  if (isPending) return <div className="page-loading">Opening Lyu ERP<span>✳</span></div>;
  if (!session?.user) return <Navigate to="/go?mode=signin" replace />;

  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  return (
    <main className="erp-dashboard">
      <div className="erp-dashboard-top">
        <div className="erp-dashboard-heading">
          <Brand />
          <p className="prod-eyebrow">LYU ERP · BUSINESS OPERATIONS</p>
          <p>{system?.company?.companyName || 'Company workspace'} · {today}</p>
        </div>
        <div className="erp-dashboard-actions">
          {(access?.user?.isAdmin || system?.isAdmin) && <><Link to="/dashboard/settings" className="prod-button prod-button-outline">User access</Link><Link to="/dashboard/system" className="prod-button prod-button-outline">System console</Link></>}
          <details className="erp-account-menu">
            <summary aria-label="Open account menu"><span className="erp-account-avatar">{session.user.name?.trim().charAt(0).toUpperCase() || 'U'}</span><span>{session.user.name}</span><b aria-hidden="true">⌄</b></summary>
            <div className="erp-account-popover">
              <div className="erp-account-popover-user"><strong>{session.user.name}</strong><small>{session.user.email}</small></div>
              <Link to="/dashboard/security">Account reset & security <span>↗</span><small>Change password and manage sessions</small></Link>
              <button type="button" onClick={signOut} disabled={signingOut}>{signingOut ? 'Signing out…' : 'Sign out'} <span>↗</span></button>
            </div>
          </details>
        </div>
      </div>
      {signOutError && <p className="form-error" role="alert">{signOutError}</p>}
      <section className="erp-dashboard-welcome"><div><span className="prod-factory-chip">{system?.company?.companyName || 'LYU ERP WORKSPACE'}</span><h1>Welcome back, {firstName}.</h1><p>Your company operations, teams, and assigned work in one secure system.</p></div>{visibleModules.some((item) => item.key === 'production') && <Link to="/production" className="prod-button prod-button-primary">Open production <span>↗</span></Link>}</section>
      {system?.license && <section className={`prod-card lyu-dashboard-license ${system.license.isActive ? 'lyu-license-active' : 'lyu-license-inactive'}`}><strong>{system.license.isActive ? `License active · ${system.license.daysRemaining} days remaining` : 'System license inactive'}</strong><p>{system.license.isActive ? 'Renewal is available during the final 10 days.' : 'System access is restricted. Contact your administrator to activate or renew the license.'}</p>{access?.user?.isAdmin && <Link className="prod-button prod-button-outline" to="/dashboard/system#license">Manage license</Link>}</section>}
      {system?.license && !system.license.isActive ? <section className="erp-modules"><div className="prod-empty"><strong>Workspace access is temporarily restricted</strong><p>{system.isAdmin ? 'Renew the system license from the admin console to restore module access.' : 'All modules remain available again after your administrator activates a valid license.'}</p></div></section> : <section className="erp-modules"><div className="erp-modules-heading"><div><p className="prod-eyebrow">YOUR ASSIGNED WORK</p><h2>ERP modules</h2><p>Only modules assigned to your account are shown here. Ask an administrator if your responsibilities change.</p></div>{access?.user?.isAdmin && <span className="prod-pill prod-pill-gold">Administrator</span>}</div>
        {accessError && <p className="form-error">{accessError}</p>}
        {!access && !accessError && <div className="page-loading">Loading assignments…</div>}
        {access && visibleModules.length === 0 && <div className="prod-empty"><strong>No modules assigned yet</strong><p>Ask your administrator to assign your work modules.</p></div>}
        <div className="erp-module-grid">{visibleModules.map((module) => <Link to={module.key === 'production' ? '/production' : '#'} className={`erp-module-card ${module.key !== 'production' ? 'erp-module-coming-soon' : ''}`} key={module.key} onClick={(event) => { if (module.key !== 'production') event.preventDefault(); }}><span>{module.icon}</span><div><strong>{module.title}</strong><small>{module.detail}</small></div><b>{module.key === 'production' ? '↗' : 'Assigned'}</b></Link>)}</div>
      </section>}
      <footer className="prod-footer"><span>LYU ERP · WORKSPACE</span><span>{session.user.name} · {session.user.email}</span></footer>
    </main>
  );
}
