import SystemMetrics from './system-metrics.js';
import SystemTables from './system-tables.js';

export default function SystemOverview({ overview, loading, onRefresh, onRevoke }) {
  if (!overview) return null;
  return <>
    <SystemMetrics overview={overview} />
    <button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={onRefresh} disabled={loading}>Refresh system data ↻</button>
    <SystemTables overview={overview} loading={loading} onRefresh={onRefresh} onRevoke={onRevoke} />
  </>;
}
