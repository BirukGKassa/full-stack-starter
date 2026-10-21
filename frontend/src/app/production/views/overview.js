import { productionApi } from '../../../lib/production-api.js';
import { DataTable, MetricCard } from '../components/ui.js';
import { formatDate } from '../utils.js';

export default function OverviewView({ companyName, formatNumber, todayLogs, openOrders, averageOee, estimatedOee, scoped, activeDowntime, recentLogs, runAction, setActiveView }) {
  return (
    <>
      <section className="prod-welcome">
        <div>
          <p className="prod-eyebrow">PRODUCTION CONTROL ROOM</p>
          <h1>Good work starts<br /><em>on the floor.</em></h1>
          <p>Live production, quality, and machine activity for {companyName}.</p>
        </div>
        <button className="prod-button prod-button-primary" onClick={() => setActiveView('production')}>＋ Record a shift</button>
      </section>
      <section className="prod-metrics-grid" aria-label="Production summary">
        <MetricCard label="Good output today" value={`${formatNumber(outputToday)} ${todayLogs[0]?.outputUnit || ''}`} note={`${todayLogs.length} shift logs recorded today`} icon="↗" />
        <MetricCard label="Open work orders" value={formatNumber(openOrders, 0)} note="In progress or awaiting production" tone="blue" icon="▤" />
        <MetricCard label="Machine OEE" value={averageOee === null && estimatedOee === null ? '—' : `${formatNumber(averageOee ?? estimatedOee)}%`} note={averageOee === null ? (estimatedOee === null ? 'Record shifts to calculate an estimate' : 'Estimated from logged output and downtime') : `${scoped.machineOee.length} shift summaries`} tone="gold" icon="◉" />
        <MetricCard label="Machines down" value={formatNumber(activeDowntime.length, 0)} note={activeDowntime.length ? 'Open stoppages need attention' : 'No open downtime incidents'} tone={activeDowntime.length ? 'red' : 'green'} icon="◷" />
      </section>
      <div className="prod-content-grid">
        <section className="prod-card">
          <div className="prod-card-heading"><div><h2>Recent shift entries</h2><p>Latest shop-floor production reports</p></div><button className="prod-text-button" onClick={() => setActiveView('production')}>View all ↗</button></div>
          <DataTable columns={[
            { key: 'startTime', label: 'Date', render: (row) => formatDate(row.startTime) },
            { key: 'workCenterCode', label: 'Machine' },
            { key: 'operatorId', label: 'Operator' },
            { key: 'shiftName', label: 'Shift' },
            { key: 'outputQuantity', label: 'Good output', render: (row) => `${formatNumber(row.outputQuantity)} ${row.outputUnit || ''}` },
            { key: 'scrapQuantity', label: 'Scrap', render: (row) => formatNumber(row.scrapQuantity) },
          ]} rows={recentLogs} empty="Record a production shift to see it here." />
        </section>
        <section className="prod-card prod-downtime-card">
          <div className="prod-card-heading"><div><h2>Downtime watch</h2><p>Machines needing an operator update</p></div><span className={`prod-pill ${activeDowntime.length ? 'prod-pill-red' : 'prod-pill-green'}`}>{activeDowntime.length} active</span></div>
          {activeDowntime.length ? activeDowntime.slice(0, 5).map((incident) => (
            <div className="prod-incident" key={incident.id}><span className="prod-incident-dot" /><div><strong>{incident.workCenterCode}</strong><small>Since {new Date(incident.startTime).toLocaleString()}</small></div><button className="prod-text-button" onClick={() => runAction(() => productionApi.resolveDowntime(incident.id, { endTime: new Date().toISOString() }), 'Downtime incident resolved.')}>Resolve</button></div>
          )) : <div className="prod-calm-state"><span>✓</span><strong>All lines are clear</strong><p>New stoppages will appear here.</p></div>}
          <button className="prod-button prod-button-outline prod-full-button" onClick={() => setActiveView('downtime')}>＋ Log machine downtime</button>
        </section>
      </div>
    </>
  );
}
