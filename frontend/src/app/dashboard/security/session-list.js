function describeDevice(userAgent) {
  if (!userAgent) return 'Unknown browser or device';
  if (/Windows/i.test(userAgent)) return `Windows · ${userAgent.split(' ').slice(-2).join(' ')}`;
  if (/Mac OS|Macintosh/i.test(userAgent)) return 'Mac';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/iPhone|iPad/i.test(userAgent)) return 'iPhone / iPad';
  if (/Linux/i.test(userAgent)) return 'Linux';
  return userAgent.slice(0, 100);
}

export default function SessionList({ sessions, loading, saving, onRefresh, onRevoke }) {
  return (
    <section className="prod-card flex-1">
      <div className="prod-card-heading"><div><h2>Your active sessions</h2><p>Sign out a session on another browser or device. Your current device is marked.</p></div><button className="prod-text-button" onClick={onRefresh}>Refresh ↻</button></div>
      {loading ? <div className="prod-loading">Loading sessions…</div> : !sessions.length ? <div className="prod-empty"><strong>No active sessions</strong></div> : sessions.map((item) => (
        <article className="prod-session-row" key={item.id}>
          <div><strong>{describeDevice(item.userAgent)} {item.isCurrent && <span className="prod-pill prod-pill-green">Current device</span>}</strong><small>Last active {new Date(item.updatedAt).toLocaleString()} · Expires {new Date(item.expiresAt).toLocaleString()}</small><small>{item.ipAddress || 'IP address unavailable'}</small></div>
          <button className="prod-button prod-button-outline" disabled={saving} onClick={() => onRevoke(item)}>{item.isCurrent ? 'Sign out this device' : 'Sign out session'}</button>
        </article>
      ))}
    </section>
  );
}
