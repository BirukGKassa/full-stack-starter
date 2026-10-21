import SystemMetrics from './system-metrics.js';
import SystemTables from './system-tables.js';

export default function SystemOverview({ overview, loading, onRefresh, onRevoke }) {
  if (!overview) return null;
  return <>
    <SystemMetrics overview={overview} />
    <button className="prod-text-button" onClick={onRefresh} disabled={loading}>Refresh system data ↻</button>
    <SystemTables overview={overview} loading={loading} onRefresh={onRefresh} onRevoke={onRevoke} />
  </>;
}
