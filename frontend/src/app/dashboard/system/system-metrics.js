export default function SystemMetrics({ overview }) {
  return (
    <section className="lyu-system-metrics">
      <article><span>DATABASE</span><strong>{overview.database.status}</strong><small>{overview.database.type} · {overview.database.host}{overview.database.database ? ` / ${overview.database.database}` : ''}</small></article>
      <article><span>SYSTEM</span><strong>{overview.system.appName}</strong><small>{overview.system.environment} · Node {overview.system.nodeVersion} · uptime {Math.floor(overview.system.uptimeSeconds / 3600)}h</small></article>
      <article><span>SESSIONS</span><strong>{overview.system.activeSessions}</strong><small>{overview.system.activeUsers} active users</small></article>
      <article><span>ERRORS</span><strong>{overview.system.errorCount}</strong><small>Recent errors retained in the system log</small></article>
    </section>
  );
}
