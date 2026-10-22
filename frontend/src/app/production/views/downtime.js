import { productionApi } from '../../../lib/production-api.js';
import { DataTable, EntryCard, Input, Select, Textarea } from '../components/ui.js';

function localDateTime() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function DowntimeView({ code, machineOptions, reasonOptions, scoped, saving, submit, runAction, downtimeCount, setDowntimeCount, formatDate, formatNumber }) {
  return (
    <>
      <div className="[&_>_p:last-child]:text-[#839087] [&_>_p:last-child]:text-[11px] mt-[15px] mx-0 mb-[23px] [&_h1]:m-0 [&_h1]:text-[#1d3d2b] [&_h1]:font-semibold [&_h1]:text-[clamp(27px,_3vw,_36px)] [&_h1]:leading-[1.12] [&_h1]:font-['Manrope',_sans-serif] [&_h1]:tracking-[-1.5px] [&_>_p:last-child]:mt-2 mx-0 mb-0 dark:[&_h1]:text-[#d9e8d9] dark:[&_>_p:last-child]:text-[#a0aea3] [.group\/erp-system-page_&]:mt-2.5 mx-0 mb-0"><p className="mt-0 mx-0 mb-2.5 text-[#829183] font-bold text-[9px] font-['DM_Mono',_monospace] tracking-[1px] [.group\/erp-dashboard-top_&]:m-0 text-[10px]">DATA ENTRY · EQUIPMENT</p><h1>Machine downtime</h1><p>Log a machine stoppage separately, then resolve it when the line is running again.</p></div>
      <div className="grid grid-cols-[minmax(0,_1.5fr)_minmax(280px,_.8fr)] gap-3.5 items-start mb-[14px] max-[1080px]:grid-cols-[minmax(0,_1fr)] grid-cols-2 max-[1080px]:grid-cols-2 max-[760px]:grid-cols-[minmax(0,_1fr)]">
        <EntryCard title="Log stoppages" description="Record one or several incidents for this factory. Leave a duration blank to create an open incident." onSubmit={(event) => submit(event, (form) => {
          const incidents = Array.from({ length: downtimeCount }, (_, index) => {
            const duration = form.get(`durationMinutes-${index}`);
            const startTime = new Date(form.get(`startTime-${index}`)).toISOString();
            return {
              companyId: code,
              workCenterCode: form.get(`workCenterCode-${index}`),
              downtimeReasonId: form.get(`downtimeReasonId-${index}`),
              startTime,
              endTime: duration ? new Date(new Date(startTime).getTime() + Number(duration) * 60000).toISOString() : null,
              durationMinutes: duration ? Number(duration) : null,
              technicianId: String(form.get(`technicianId-${index}`) || '').trim() || null,
              notes: String(form.get(`notes-${index}`) || '').trim() || null,
            };
          });
          return productionApi.createDowntime({ incidents });
        }, 'Machine downtime incidents recorded.')} busy={saving} submitLabel={`Save ${downtimeCount} incident${downtimeCount === 1 ? '' : 's'}`}>
          <div className="col-span-full max-[480px]:col-start-1 flex items-center justify-between gap-3 pt-0 px-0 pb-[3px] text-[#506456] text-[10px] dark:text-[#c1d0c2]"><strong>{downtimeCount} incident{downtimeCount === 1 ? '' : 's'}</strong><button type="button" className="group/prod-button min-h-[37px] inline-flex items-center justify-center gap-[7px] py-0 px-3.5 border border-transparent rounded-[7px] text-[10px] font-bold cursor-pointer transition-[background,color,border] duration-150 [&:disabled]:opacity-[.55] [&:disabled]:cursor-wait [.group\/prod-modal-form_&]:justify-self-end max-[480px]:[.group\/prod-form-actions_&]:w-[100%] [.group\/prod-managed-actions_&]:min-h-[34px] [.group\/prod-managed-actions_&]:py-0 px-[11px] [.group\/prod-managed-actions_&]:rounded-lg [.group\/prod-managed-actions_&]:text-[10px] border-[#dfe6dd] bg-white text-[#52675a] [&:hover:not(:disabled)]:border-[#b8cdb0] [&:hover:not(:disabled)]:text-[#315b3a] dark:border-[#3a4a3e] dark:bg-[#1d2a22] dark:text-[#cad8cb] dark:[&:hover:not(:disabled)]:border-[#617c61] dark:[&:hover:not(:disabled)]:text-[#e0ecdb] min-h-[29px] py-0 px-2.5 text-[9px]" onClick={() => setDowntimeCount((count) => Math.min(count + 1, 20))} disabled={downtimeCount >= 20}>＋ Add another incident</button></div>
          {Array.from({ length: downtimeCount }, (_, index) => <div className="col-span-full grid grid-cols-2 gap-3 p-3 border border-[#e5ebe3] rounded-[7px] bg-[#fafcf8] max-[480px]:grid-cols-[minmax(0,_1fr)] dark:border-[#334237] dark:bg-[#151f19]" key={index}>
            <div className="col-span-full flex items-center justify-between text-[#47604c] text-[10px] dark:text-[#c1d0c2]"><strong>Incident {index + 1}</strong>{downtimeCount > 1 && index === downtimeCount - 1 && <button type="button" className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={() => setDowntimeCount((count) => Math.max(count - 1, 1))}>Remove last</button>}</div>
            <Select label="Machine / line" name={`workCenterCode-${index}`} options={machineOptions} placeholder={machineOptions.length ? 'Select work center' : 'Register a machine first'} />
            <Select label="Reason" name={`downtimeReasonId-${index}`} options={reasonOptions} placeholder={reasonOptions.length ? 'Select downtime reason' : 'Add a downtime reason first'} />
            <Input label="Stoppage start" name={`startTime-${index}`} type="datetime-local" defaultValue={localDateTime()} />
            <Input label="Duration (minutes)" name={`durationMinutes-${index}`} type="number" min="1" required={false} placeholder="Leave blank if still stopped" />
            <Input label="Technician ID" name={`technicianId-${index}`} required={false} />
            <Textarea label="Notes" name={`notes-${index}`} placeholder="Describe the issue or work being done" />
          </div>)}
        </EntryCard>
        <EntryCard title="Add a downtime reason" description="Keep reason codes consistent across the factory." onSubmit={(event) => submit(event, (form) => productionApi.createDowntimeReason({
          category: form.get('category'),
          reasonCode: String(form.get('reasonCode')).trim().toUpperCase(),
          description: form.get('description'),
          requiresTechnician: form.get('requiresTechnician') === 'on',
        }), 'Downtime reason added.')} busy={saving}>
          <Input label="Category" name="category" placeholder="Mechanical, changeover, material…" />
          <Input label="Reason code" name="reasonCode" placeholder={`${code}-MECHANICAL`} />
          <Input label="Description" name="description" />
          <label className="flex items-center gap-2 text-[#607065] text-[10px] [&_input]:accent-[#315b3a] dark:text-[#c0cdc2]"><input type="checkbox" name="requiresTechnician" /> Technician required</label>
        </EntryCard>
      </div>
      <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] mb-[14px]">
        <div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start"><div><h2>Downtime incidents</h2><p>Open and resolved machine stoppages</p></div><span className="inline-flex items-center py-1 px-[7px] rounded-[30px] text-[8px] font-bold text-[9px] bg-[#faeae5] text-[#a45040] dark:bg-[#402c28] dark:text-[#e6ad9e]">{scoped.downtime.filter((row) => !row.endTime).length} open</span></div>
        <DataTable columns={[
          { key: 'startTime', label: 'Started', render: (row) => new Date(row.startTime).toLocaleString() },
          { key: 'workCenterCode', label: 'Machine' },
          { key: 'downtimeReasonId', label: 'Reason', render: (row) => scoped.downtimeReasons.find((reason) => reason.id === row.downtimeReasonId)?.description || row.downtimeReasonId },
          { key: 'durationMinutes', label: 'Duration', render: (row) => row.durationMinutes ? `${row.durationMinutes} min` : 'Ongoing' },
          { key: 'status', label: 'Status', render: (row) => <span className={`inline-flex items-center py-1 px-[7px] rounded-[30px] text-[8px] font-bold text-[9px]${row.endTime ? 'bg-[#edf5e9] text-[#54744c] dark:bg-[#273b2c] dark:text-[#b9d8aa]' : 'bg-[#faeae5] text-[#a45040] dark:bg-[#402c28] dark:text-[#e6ad9e]'}`}>{row.endTime ? 'Resolved' : 'Open'}</span> },
          { key: 'actions', label: '', render: (row) => !row.endTime && <button className="group/prod-button min-h-[37px] inline-flex items-center justify-center gap-[7px] py-0 px-3.5 border border-transparent rounded-[7px] text-[10px] font-bold cursor-pointer transition-[background,color,border] duration-150 [&:disabled]:opacity-[.55] [&:disabled]:cursor-wait [.group\/prod-modal-form_&]:justify-self-end max-[480px]:[.group\/prod-form-actions_&]:w-[100%] [.group\/prod-managed-actions_&]:min-h-[34px] [.group\/prod-managed-actions_&]:py-0 px-[11px] [.group\/prod-managed-actions_&]:rounded-lg [.group\/prod-managed-actions_&]:text-[10px] min-h-[29px] py-0 px-2.5 text-[9px] border-[#dfe6dd] bg-white text-[#52675a] [&:hover:not(:disabled)]:border-[#b8cdb0] [&:hover:not(:disabled)]:text-[#315b3a] dark:border-[#3a4a3e] dark:bg-[#1d2a22] dark:text-[#cad8cb] dark:[&:hover:not(:disabled)]:border-[#617c61] dark:[&:hover:not(:disabled)]:text-[#e0ecdb]" onClick={() => runAction(() => productionApi.resolveDowntime(row.id, { endTime: new Date().toISOString() }), 'Downtime incident resolved.')}>Resolve</button> },
        ]} rows={[...scoped.downtime].sort((a, b) => new Date(b.startTime) - new Date(a.startTime))} empty="No downtime incidents recorded." />
      </section>
      <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] mb-[14px]"><div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start"><div><h2>Machine OEE shift summaries</h2><p>Operational effectiveness data from the analytics API</p></div></div><DataTable columns={[
        { key: 'performanceDate', label: 'Date', render: (row) => formatDate(row.performanceDate) },
        { key: 'workCenterCode', label: 'Machine' }, { key: 'shiftName', label: 'Shift' },
        { key: 'availabilityRate', label: 'Availability', render: (row) => `${formatNumber(row.availabilityRate)}%` },
        { key: 'performanceRate', label: 'Performance', render: (row) => `${formatNumber(row.performanceRate)}%` },
        { key: 'qualityRate', label: 'Quality', render: (row) => `${formatNumber(row.qualityRate)}%` },
        { key: 'oeeScore', label: 'OEE', render: (row) => `${formatNumber(row.oeeScore)}%` },
      ]} rows={[...scoped.machineOee].sort((a, b) => new Date(b.performanceDate) - new Date(a.performanceDate)).slice(0, 25)} empty="Machine summaries will appear here when available." /></section>
    </>
  );
}
