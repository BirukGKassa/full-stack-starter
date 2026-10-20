import { productionApi } from '../../../lib/production-api.js';
import { DataTable, EntryCard, Input, Select, Textarea } from '../components/ui.js';

function localDateTime() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function DowntimeView({ code, machineOptions, reasonOptions, scoped, saving, submit, runAction, downtimeCount, setDowntimeCount, formatDate, formatNumber }) {
  return (
    <>
      <div className="prod-page-heading"><p className="prod-eyebrow">DATA ENTRY · EQUIPMENT</p><h1>Machine downtime</h1><p>Log a machine stoppage separately, then resolve it when the line is running again.</p></div>
      <div className="prod-content-grid prod-content-grid-even">
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
          <div className="prod-field-wide prod-downtime-batch-tools"><strong>{downtimeCount} incident{downtimeCount === 1 ? '' : 's'}</strong><button type="button" className="prod-button prod-button-outline prod-button-small" onClick={() => setDowntimeCount((count) => Math.min(count + 1, 20))} disabled={downtimeCount >= 20}>＋ Add another incident</button></div>
          {Array.from({ length: downtimeCount }, (_, index) => <div className="prod-downtime-batch" key={index}>
            <div className="prod-downtime-batch-heading"><strong>Incident {index + 1}</strong>{downtimeCount > 1 && index === downtimeCount - 1 && <button type="button" className="prod-text-button" onClick={() => setDowntimeCount((count) => Math.max(count - 1, 1))}>Remove last</button>}</div>
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
          <label className="prod-check-field"><input type="checkbox" name="requiresTechnician" /> Technician required</label>
        </EntryCard>
      </div>
      <section className="prod-card prod-table-card">
        <div className="prod-card-heading"><div><h2>Downtime incidents</h2><p>Open and resolved machine stoppages</p></div><span className="prod-pill prod-pill-red">{scoped.downtime.filter((row) => !row.endTime).length} open</span></div>
        <DataTable columns={[
          { key: 'startTime', label: 'Started', render: (row) => new Date(row.startTime).toLocaleString() },
          { key: 'workCenterCode', label: 'Machine' },
          { key: 'downtimeReasonId', label: 'Reason', render: (row) => scoped.downtimeReasons.find((reason) => reason.id === row.downtimeReasonId)?.description || row.downtimeReasonId },
          { key: 'durationMinutes', label: 'Duration', render: (row) => row.durationMinutes ? `${row.durationMinutes} min` : 'Ongoing' },
          { key: 'status', label: 'Status', render: (row) => <span className={`prod-pill ${row.endTime ? 'prod-pill-green' : 'prod-pill-red'}`}>{row.endTime ? 'Resolved' : 'Open'}</span> },
          { key: 'actions', label: '', render: (row) => !row.endTime && <button className="prod-button prod-button-small prod-button-outline" onClick={() => runAction(() => productionApi.resolveDowntime(row.id, { endTime: new Date().toISOString() }), 'Downtime incident resolved.')}>Resolve</button> },
        ]} rows={[...scoped.downtime].sort((a, b) => new Date(b.startTime) - new Date(a.startTime))} empty="No downtime incidents recorded." />
      </section>
      <section className="prod-card prod-table-card"><div className="prod-card-heading"><div><h2>Machine OEE shift summaries</h2><p>Operational effectiveness data from the analytics API</p></div></div><DataTable columns={[
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
