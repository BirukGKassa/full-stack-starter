import SystemMetrics from './system-metrics.js';
import SystemTables from './system-tables.js';

export default function SystemOverview({ overview, loading, onRefresh, onRevoke }) {
  if (!overview) return null;
  return <>
    <div className="mb-4 space-y-1">
      <h2 className="text-base font-semibold tracking-tight text-[#18181b] dark:text-[#fafafa]">System health and activity</h2>
      <p className="text-sm text-[#71717a] dark:text-[#a1a1aa]">Review service status, active sessions, user activity, and recent operational events.</p>
    </div>
    <SystemMetrics overview={overview} />
    <button className="my-4 inline-flex h-9 items-center justify-center rounded-md border border-[#e4e4e7] bg-white px-3 text-sm font-medium text-[#18181b] hover:bg-[#f4f4f5] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a1a1aa] dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#fafafa] dark:hover:bg-[#27272a]" onClick={onRefresh} disabled={loading}>Refresh system data ↻</button>
    <SystemTables overview={overview} loading={loading} onRefresh={onRefresh} onRevoke={onRevoke} />
  </>;
}
