import { Link } from 'react-router-dom';

const features = [
  { number: '01', title: 'Run production', text: 'Record shift output, scrap, machine events, and material usage as the work happens.', icon: '↗' },
  { number: '02', title: 'Keep every line moving', text: 'Track downtime by machine, assign work orders, and see what needs attention.', icon: '◷' },
  { number: '03', title: 'Make better decisions', text: 'Review quality, traceability, machine performance, and weekly or monthly reports.', icon: '▥' },
];

const factories = [
  { code: 'AMH', name: 'Aluminum profiles', kind: 'EXTRUSION' },
  { code: 'AMR', name: 'PP woven bags', kind: 'PACKAGING' },
  { code: 'KORKI', name: 'Bottle closures', kind: 'INJECTION MOLDING' },
  { code: 'RASA', name: 'Flour milling', kind: 'FOOD PRODUCTION' },
];

export default function HomePage() {
  return (
    <div className="lyu-landing">
      <section className="lyu-hero">
        <div className="lyu-hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> PRODUCTION, QUALITY, AND PEOPLE</p>
          <h1>Make every<br />shift <em>count.</em></h1>
          <p className="lyu-hero-description">Lyu ERP brings your shop floor into focus. Capture production, resolve downtime, manage orders, and turn factory data into decisions.</p>
          <div className="lyu-hero-actions">
            <Link to="/go?mode=signin" className="button button-dark">Open production workspace <span aria-hidden="true">↗</span></Link>
            <a href="#system" className="lyu-secondary-link">Explore the system <span aria-hidden="true">↓</span></a>
          </div>
          <div className="lyu-hero-proof"><span className="lyu-pulse" /> <p><strong>One connected workspace</strong><br />for the people who keep production moving.</p></div>
        </div>
        <div className="lyu-hero-visual">
          <div className="lyu-hero-orbit lyu-hero-orbit-one" /><div className="lyu-hero-orbit lyu-hero-orbit-two" />
          <div className="lyu-hero-status"><span className="lyu-pulse" /> LIVE PRODUCTION CONTROL</div>
          <div className="lyu-preview">
            <div className="lyu-preview-top"><span className="lyu-preview-mark">L.</span><span>FACTORY OVERVIEW</span><span>•••</span></div>
            <div className="lyu-preview-heading"><div><small>MONDAY · PRODUCTION SUMMARY</small><h2>Good shift, AMH</h2></div><span className="lyu-preview-live">LIVE</span></div>
            <div className="lyu-preview-metrics"><div><small>GOOD OUTPUT</small><strong>12,480</strong><i>units today</i></div><div><small>OPEN ORDERS</small><strong>08</strong><i>in progress</i></div></div>
            <div className="lyu-preview-chart-title"><span>SHIFT OUTPUT</span><span>LAST 7 DAYS</span></div>
            <div className="lyu-preview-bars">{[38, 55, 43, 78, 64, 88, 72].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div>
            <div className="lyu-preview-bottom"><span><i /> 3 MACHINES RUNNING</span><span>OEE 84.6%</span></div>
          </div>
          <div className="lyu-hero-note"><span>✳</span><div><small>BUILT FOR THE FLOOR</small><strong>Clarity from every shift.</strong></div></div>
        </div>
      </section>
      <section className="lyu-factory-strip"><span>SUPPORTING YOUR FACTORIES</span>{factories.map((factory) => <div key={factory.code}><strong>{factory.code}</strong><small>{factory.kind}</small></div>)}</section>
      <section className="lyu-features" id="system">
        <div className="lyu-section-heading"><p className="eyebrow"><span className="eyebrow-line" /> THE LYU ERP WORKSPACE</p><h2>Every part of production,<br /><em>working together.</em></h2><p>Practical tools for the data clerks, operators, technicians, and managers who make the work happen.</p></div>
        <div className="lyu-feature-grid">{features.map((feature) => <article className="lyu-feature-card" key={feature.number}><span className="lyu-feature-number">{feature.number}</span><span className="lyu-feature-icon">{feature.icon}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div>
      </section>
      <section className="lyu-factory-section">
        <div><p className="eyebrow"><span className="eyebrow-line" /> ONE SYSTEM, MULTIPLE FACTORIES</p><h2>Your factory has<br /><em>its own rhythm.</em></h2><p>Keep each plant’s machines, products, operators, and reports organized while sharing one reliable ERP workspace.</p></div>
        <div className="lyu-factory-list">{factories.map((factory) => <article key={factory.code}><span>{factory.code}</span><strong>{factory.name}</strong><small>{factory.kind}</small><b>↗</b></article>)}</div>
      </section>
      <section className="lyu-cta"><div><p className="eyebrow"><span className="eyebrow-line" /> READY WHEN YOUR TEAM IS</p><h2>Bring the factory<br /><em>into focus.</em></h2></div><Link to="/go?mode=signin" className="button button-light">Sign in to Lyu ERP <span aria-hidden="true">↗</span></Link><span className="lyu-cta-mark">L.</span></section>
    </div>
  );
}
