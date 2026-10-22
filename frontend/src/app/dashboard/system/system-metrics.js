export default function SystemMetrics({ overview }) {
  return (
    <section className="grid grid-cols-[repeat(4,_minmax(0,_1fr))] gap-2.5 [&_article]:grid [&_article]:gap-[7px] [&_article]:p-4 [&_article]:border border-[#e5ebe3] [&_article]:rounded-lg [&_article]:bg-[#fffefa] [&_article_>_span]:text-[#88948a] [&_article_>_span]:font-bold [&_article_>_span]:text-[9px] [&_article_>_span]:font-['DM_Mono',_monospace] [&_article_>_span]:tracking-[.7px] [&_article_>_strong]:text-[#38553d] [&_article_>_strong]:text-[17px] [&_article_>_strong]:capitalize [&_article_>_small]:text-[#718075] [&_article_>_small]:text-[10px] [&_article_>_small]:leading-[1.5] [&_article_>_small]:wrap-anywhere dark:[&_article]:border-[#35443a] dark:[&_article]:bg-[#151f19] dark:[&_article_>_span]:text-[#a8b6aa] dark:[&_article_>_small]:text-[#a8b6aa] dark:[&_article_>_strong]:text-[#d2e2d3] max-[760px]:grid-cols-2 max-[480px]:grid-cols-[1fr]">
      <article><span>DATABASE</span><strong>{overview.database.status}</strong><small>{overview.database.type} · {overview.database.host}{overview.database.database ? ` / ${overview.database.database}` : ''}</small></article>
      <article><span>SYSTEM</span><strong>{overview.system.appName}</strong><small>{overview.system.environment} · Node {overview.system.nodeVersion} · uptime {Math.floor(overview.system.uptimeSeconds / 3600)}h</small></article>
      <article><span>SESSIONS</span><strong>{overview.system.activeSessions}</strong><small>{overview.system.activeUsers} active users</small></article>
      <article><span>ERRORS</span><strong>{overview.system.errorCount}</strong><small>Recent errors retained in the system log</small></article>
    </section>
  );
}
