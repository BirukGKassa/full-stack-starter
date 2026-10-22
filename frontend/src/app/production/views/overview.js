import { productionApi } from '../../../lib/production-api.js';
import { DataTable, MetricCard } from '../components/ui.js';
import { formatDate } from '../utils.js';

export default function OverviewView({ companyName, formatNumber, todayLogs, outputToday, openOrders, averageOee, estimatedOee, scoped, activeDowntime, recentLogs, runAction, setActiveView }) {
  return (
    <>
      <section className="flex items-end justify-between gap-5 mt-[17px] mx-0 mb-[25px] [&_h1]:m-0 [&_h1]:text-[#1d3d2b] [&_h1]:font-semibold [&_h1]:text-[clamp(32px,_4vw,_46px)] [&_h1]:leading-[1.05] [&_h1]:font-['Manrope',_sans-serif] [&_h1]:tracking-[-2.3px] [&_h1_em]:text-[#668655] [&_h1_em]:italic [&_h1_em]:font-normal [&_h1_em]:text-[1em] [&_h1_em]:font-['Georgia',_serif] [&_>_div_>_p:last-child]:text-[#839087] [&_>_div_>_p:last-child]:text-[11px] [&_>_div_>_p:last-child]:mt-[11px] mx-0 mb-0 max-[760px]:items-start max-[760px]:flex-col max-[760px]:[&_h1]:text-[36px] dark:[&_h1]:text-[#d9e8d9] dark:[&_>_div_>_p:last-child]:text-[#a0aea3]">
        <div>
          <p className="mt-0 mx-0 mb-2.5 text-[#829183] font-bold text-[9px] font-['DM_Mono',_monospace] tracking-[1px] [.group\/erp-dashboard-top_&]:m-0 text-[10px]">PRODUCTION CONTROL ROOM</p>
          <h1>Good work starts<br /><em>on the floor.</em></h1>
          <p>Live production, quality, and machine activity for {companyName}.</p>
        </div>
        <button className="group/prod-button min-h-[37px] inline-flex items-center justify-center gap-[7px] py-0 px-3.5 border border-transparent rounded-[7px] text-[10px] font-bold cursor-pointer transition-[background,color,border] duration-150 [&:disabled]:opacity-[.55] [&:disabled]:cursor-wait [.group\/prod-modal-form_&]:justify-self-end max-[480px]:[.group\/prod-form-actions_&]:w-[100%] [.group\/prod-managed-actions_&]:min-h-[34px] [.group\/prod-managed-actions_&]:py-0 px-[11px] [.group\/prod-managed-actions_&]:rounded-lg [.group\/prod-managed-actions_&]:text-[10px] bg-[#174835] text-[#f6f8f3] [&:hover:not(:disabled)]:bg-[#236244]" onClick={() => setActiveView('production')}>＋ Record a shift</button>
      </section>
      <section className="grid grid-cols-[repeat(4,_minmax(0,_1fr))] gap-3 mb-[15px] max-[1080px]:grid-cols-2 max-[480px]:grid-cols-2 max-[480px]:gap-2" aria-label="Production summary">
        <MetricCard label="Good output today" value={`${formatNumber(outputToday)} ${todayLogs[0]?.outputUnit || ''}`} note={`${todayLogs.length} shift logs recorded today`} icon="↗" />
        <MetricCard label="Open work orders" value={formatNumber(openOrders, 0)} note="In progress or awaiting production" tone="blue" icon="▤" />
        <MetricCard label="Machine OEE" value={averageOee === null && estimatedOee === null ? '—' : `${formatNumber(averageOee ?? estimatedOee)}%`} note={averageOee === null ? (estimatedOee === null ? 'Record shifts to calculate an estimate' : 'Estimated from logged output and downtime') : `${scoped.machineOee.length} shift summaries`} tone="gold" icon="◉" />
        <MetricCard label="Machines down" value={formatNumber(activeDowntime.length, 0)} note={activeDowntime.length ? 'Open stoppages need attention' : 'No open downtime incidents'} tone={activeDowntime.length ? 'red' : 'green'} icon="◷" />
      </section>
      <div className="grid grid-cols-[minmax(0,_1.5fr)_minmax(280px,_.8fr)] gap-3.5 items-start mb-[14px] max-[1080px]:grid-cols-[minmax(0,_1fr)]">
        <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd]">
          <div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start"><div><h2>Recent shift entries</h2><p>Latest shop-floor production reports</p></div><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={() => setActiveView('production')}>View all ↗</button></div>
          <DataTable columns={[
            { key: 'startTime', label: 'Date', render: (row) => formatDate(row.startTime) },
            { key: 'workCenterCode', label: 'Machine' },
            { key: 'operatorId', label: 'Operator' },
            { key: 'shiftName', label: 'Shift' },
            { key: 'outputQuantity', label: 'Good output', render: (row) => `${formatNumber(row.outputQuantity)} ${row.outputUnit || ''}` },
            { key: 'scrapQuantity', label: 'Scrap', render: (row) => formatNumber(row.scrapQuantity) },
          ]} rows={recentLogs} empty="Record a production shift to see it here." />
        </section>
        <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] group/prod-downtime-card">
          <div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start"><div><h2>Downtime watch</h2><p>Machines needing an operator update</p></div><span className={`inline-flex items-center py-1 px-[7px] rounded-[30px] text-[8px] font-bold text-[9px]${activeDowntime.length ? 'bg-[#faeae5] text-[#a45040] dark:bg-[#402c28] dark:text-[#e6ad9e]' : 'bg-[#edf5e9] text-[#54744c] dark:bg-[#273b2c] dark:text-[#b9d8aa]'}`}>{activeDowntime.length} active</span></div>
          {activeDowntime.length ? activeDowntime.slice(0, 5).map((incident) => (
            <div className="flex items-center gap-2.5 py-3 px-0.5 border-b border-b-[#eff1ed] [&_>_div]:min-w-0 [&_>_div]:grid [&_>_div]:flex-1 [&_>_div]:gap-1 [&_strong]:text-[#46584c] [&_strong]:text-[10px] [&_small]:text-[#9aa39b] [&_small]:text-[8px]" key={incident.id}><span className="w-2 h-2 rounded-full bg-[#d27d67] shadow-[0_0_0_4px_#f9e9e4]" /><div><strong>{incident.workCenterCode}</strong><small>Since {new Date(incident.startTime).toLocaleString()}</small></div><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={() => runAction(() => productionApi.resolveDowntime(incident.id, { endTime: new Date().toISOString() }), 'Downtime incident resolved.')}>Resolve</button></div>
          )) : <div className="min-h-[140px] grid content-center justify-items-center text-[#82937e] text-center [&_>_span]:w-[30px] [&_>_span]:h-[30px] [&_>_span]:grid [&_>_span]:place-items-center [&_>_span]:rounded-full [&_>_span]:bg-[#edf5e9] [&_>_span]:text-[#5d8655] [&_strong]:mt-[8px] [&_strong]:text-[#456148] [&_strong]:text-[11px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#97a298] [&_p]:text-[9px] dark:[&_strong]:text-[#c4d3c5]"><span>✓</span><strong>All lines are clear</strong><p>New stoppages will appear here.</p></div>}
          <button className="group/prod-button min-h-[37px] inline-flex items-center justify-center gap-[7px] py-0 px-3.5 border border-transparent rounded-[7px] text-[10px] font-bold cursor-pointer transition-[background,color,border] duration-150 [&:disabled]:opacity-[.55] [&:disabled]:cursor-wait [.group\/prod-modal-form_&]:justify-self-end max-[480px]:[.group\/prod-form-actions_&]:w-[100%] [.group\/prod-managed-actions_&]:min-h-[34px] [.group\/prod-managed-actions_&]:py-0 px-[11px] [.group\/prod-managed-actions_&]:rounded-lg [.group\/prod-managed-actions_&]:text-[10px] border-[#dfe6dd] bg-white text-[#52675a] [&:hover:not(:disabled)]:border-[#b8cdb0] [&:hover:not(:disabled)]:text-[#315b3a] dark:border-[#3a4a3e] dark:bg-[#1d2a22] dark:text-[#cad8cb] dark:[&:hover:not(:disabled)]:border-[#617c61] dark:[&:hover:not(:disabled)]:text-[#e0ecdb] w-[100%] mt-[12px]" onClick={() => setActiveView('downtime')}>＋ Log machine downtime</button>
        </section>
      </div>
    </>
  );
}
