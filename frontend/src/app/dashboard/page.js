import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authClient } from '../../lib/auth-client.js';

const priorities = [
  { label: 'Make a little progress on the thing that matters most.', time: 'FOCUS', tone: 'green' },
  { label: 'Send the first version. It doesn’t have to be perfect.', time: 'UP NEXT', tone: 'peach' },
  { label: 'Step away for a moment and get some fresh air.', time: 'WHENEVER', tone: 'blue' },
];

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || 'friend';

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      navigate('/', { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  if (isPending) return <div className="page-loading">Opening your space<span>✳</span></div>;
  if (!session?.user) return <Navigate to="/go?mode=signin" replace />;

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <a href="/" className="brand"><span className="brand-mark"><span /></span><span>northstar<span className="brand-dot">.</span></span></a>
        <p className="sidebar-label">YOUR SPACE</p>
        <a className="sidebar-link sidebar-active" href="#today"><span>◷</span> Today</a>
        <a className="sidebar-link" href="#priorities"><span>▤</span> Priorities <span className="sidebar-count">3</span></a>
        <a className="sidebar-link" href="#week"><span>◫</span> Your week</a>
        <div className="sidebar-bottom"><div className="profile-chip"><span className="profile-avatar">{firstName[0]?.toUpperCase()}</span><span><strong>{session.user.name}</strong><small>{session.user.email}</small></span></div><button onClick={handleSignOut} disabled={signingOut} className="signout-button">{signingOut ? 'Signing out…' : 'Sign out'} <span>↗</span></button></div>
      </aside>
      <main className="dashboard-main" id="today">
        <div className="dashboard-top"><span className="eyebrow"><span className="eyebrow-line" /> MONDAY, OCTOBER 20</span><span className="dashboard-live"><i /> YOUR SPACE IS YOURS</span></div>
        <div className="dashboard-welcome"><div><p className="dashboard-kicker">A new day, a new page</p><h1>Good morning, {firstName}<span>✳</span></h1><p>Let’s make a little room for what matters today.</p></div><div className="weather-note"><span>☀</span><div><strong>Take it one thing at a time.</strong><small>You’re right where you need to be.</small></div></div></div>
        <div className="dashboard-grid">
          <section className="dash-panel focus-dashboard"><div className="panel-heading"><div><p className="panel-eyebrow">YOUR NORTH STAR</p><h2>Today’s direction</h2></div><span className="panel-spark">✳</span></div><div className="direction-card"><div><span className="focus-overline">MAKE SPACE FOR</span><h3>Meaningful progress</h3><p>Give your energy to one thing that moves you forward.</p></div><div className="focus-ring focus-ring-large"><span>68%</span></div></div><div className="progress-caption"><span>A good start to the day</span><span>Keep going gently ↗</span></div><div className="progress-track"><span /></div><div className="panel-footnote"><span>✦</span> Progress is a practice, not a finish line.</div></section>
          <section className="dash-panel week-panel" id="week"><div className="panel-heading"><div><p className="panel-eyebrow">A MOMENT TO PAUSE</p><h2>Your week, in balance</h2></div><span className="week-number">W43</span></div><div className="week-chart"><div className="chart-guides"><i /><i /><i /></div>{[['M', 74], ['T', 52], ['W', 88], ['T', 62], ['F', 42], ['S', 28], ['S', 20]].map(([day, value], index) => <div className="chart-day" key={`${day}-${index}`}><div className={`chart-bar ${index === 2 ? 'chart-bar-highlight' : ''}`} style={{ height: `${value}%` }} /><span>{day}</span></div>)}</div><p className="chart-caption">A healthy rhythm has room for everything.</p></section>
          <section className="dash-panel priorities-panel" id="priorities"><div className="panel-heading"><div><p className="panel-eyebrow">KEEP IT LIGHT</p><h2>A few things on your mind</h2></div><span className="priority-count">03</span></div><div className="priority-list">{priorities.map((item, index) => <div className="priority-row" key={item.label}><span className={`priority-check ${index === 0 ? 'priority-first' : ''}`}>{index === 0 ? '✳' : ''}</span><span className="priority-label">{item.label}</span><span className={`task-tag tag-${item.tone}`}>{item.time}</span></div>)}</div><button className="add-priority" onClick={() => window.alert('You are all set. Your next priority can wait until you are ready.')}>＋ Add a thought for later</button></section>
          <section className="reflection-card"><span className="reflection-mark">“</span><p>You don’t have to see the whole staircase. Just take the first step.</p><span className="reflection-credit">— MARTIN LUTHER KING JR.</span><div className="reflection-doodle">✳</div></section>
        </div>
        <footer className="dashboard-footer"><span>TAKE A BREATH. YOU’RE DOING JUST FINE.</span><span>MADE FOR THE WAY YOU THINK <b>✳</b></span></footer>
      </main>
    </div>
  );
}
