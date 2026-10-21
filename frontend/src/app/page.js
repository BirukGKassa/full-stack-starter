import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const modules = [
  ['Operations', 'Production, planning, and manufacturing orders', '◫'],
  ['Inventory', 'Stock, warehouse, and material traceability', '▤'],
  ['Procurement', 'Purchasing, suppliers, and incoming goods', '↗'],
  ['Sales', 'Customer orders, delivery, and fulfillment', '⌑'],
  ['Finance', 'Accounting, costs, and financial reporting', '◷'],
  ['People', 'Employees, access, and workforce operations', '♧'],
  ['Quality', 'Inspections, standards, and corrective actions', '◉'],
  ['Maintenance', 'Assets, preventive care, and downtime', '⚙'],
  ['Business intelligence', 'Connected reports and company-wide insight', '▥'],
];

function licenseMessage(license) {
  if (!license) return null;
  if (!license.isActive) return 'Lyu ERP license is not active. Contact your system administrator.';
  const days = license.daysRemaining;
  if (days <= 3) return `Urgent: your Lyu ERP license expires in ${days} day${days === 1 ? '' : 's'}. Renew now to avoid interruption.`;
  if (days <= 10) return `Your Lyu ERP license has ${days} days remaining. Please renew soon.`;
  if (days <= 20) return `Your Lyu ERP license has ${days} days remaining. Plan your renewal.`;
  return `Your Lyu ERP license is currently active with ${days} days remaining.`;
}

export default function HomePage() {
  const [system, setSystem] = useState(null);

  useEffect(() => {
    let active = true;
    const load = () => fetch('/api/public/system', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`System information unavailable (${response.status})`)))
      .then((data) => { if (active) setSystem(data); })
      .catch((error) => console.error('Could not load public system information:', error));
    load();
    const timer = window.setInterval(load, 10 * 60 * 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const companyName = system?.company?.companyName || 'Lyu ERP';
  return (
    <div className="lyu-landing lyu-erp-home">
      <section className="lyu-home-hero">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" /> ONE CONNECTED BUSINESS SYSTEM</p>
          <h1>Run your whole<br />business with <em>clarity.</em></h1>
          <p className="lyu-hero-description">Lyu ERP connects the people, processes, and information behind your business—from finance and people operations to inventory, customer orders, and manufacturing.</p>
          <div className="lyu-hero-actions">
            <Link to="/go" className="button button-dark">Sign in to Lyu ERP <span aria-hidden="true">↗</span></Link>
            <a href="#modules" className="lyu-secondary-link">Explore ERP modules <span aria-hidden="true">↓</span></a>
          </div>
          <div className="lyu-company-caption"><span className="lyu-pulse" /> {companyName}</div>
        </div>
        <div className="lyu-erp-home-panel">
          <span className="lyu-preview-mark">L.</span>
          <p>LYU ERP WORKSPACE</p>
          <h2>One source of truth.<br /><em>Every team in sync.</em></h2>
          <div className="lyu-home-panel-lines"><span /><span /><span /><span /></div>
          <small>{companyName}</small>
        </div>
      </section>

      {system?.license && <div className={`lyu-license-banner ${system.license.isActive ? 'lyu-license-active' : 'lyu-license-inactive'}`} role="status">
        <span>{system.license.isActive ? '✓' : '!'}</span><p>{licenseMessage(system.license)}</p>
      </div>}

      <section className="lyu-features lyu-erp-modules" id="modules">
        <div className="lyu-section-heading">
          <p className="eyebrow"><span className="eyebrow-line" /> THE LYU ERP PLATFORM</p>
          <h2>Every function.<br /><em>Working together.</em></h2>
          <p>A unified workspace for business operations, with access tailored to each team.</p>
        </div>
        <div className="lyu-feature-grid">{modules.map(([name, detail, icon], index) => (
          <article className="lyu-feature-card" key={name}>
            <span className="lyu-feature-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="lyu-feature-icon">{icon}</span>
            <h3>{name}</h3>
            <p>{detail}</p>
          </article>
        ))}</div>
      </section>

      <section className="lyu-company-section">
        <div><p className="eyebrow"><span className="eyebrow-line" /> YOUR BUSINESS, CONNECTED</p>
          <h2>{companyName}</h2>
          <p>Company information, teams, and day-to-day operations in one secure system.</p>
        </div>
        {system?.company?.addressLine1 && <address>
          {[system.company.addressLine1, system.company.addressLine2, [system.company.city, system.company.region, system.company.postalCode].filter(Boolean).join(', '), system.company.country].filter(Boolean).map((line) => <span key={line}>{line}</span>)}
          {system.company.email && <a href={`mailto:${system.company.email}`}>{system.company.email}</a>}
        </address>}
      </section>

      <section className="lyu-cta lyu-erp-cta">
        <div><p className="eyebrow"><span className="eyebrow-line" /> LYU ERP · BUSINESS OPERATIONS</p><h2>Bring your teams<br /><em>together.</em></h2></div>
        <Link to="/go" className="button button-light">Sign in to your workspace <span aria-hidden="true">↗</span></Link>
        <span className="lyu-cta-mark">L.</span>
      </section>
    </div>
  );
}
