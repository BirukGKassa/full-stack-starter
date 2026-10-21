import { productionApi } from '../../../lib/production-api.js';
import { DataTable, EntryCard, Input, Select, Textarea } from '../components/ui.js';
import { toIso } from '../utils.js';

function localDateTime(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function ProductionEntryView({ code, orderOptions, machineOptions, reasonOptions, scoped, recentLogs, saving, submit, refresh, formatNumber, actor, workstation, onWorkstationChange }) {
  return (
    <>
      <div className="prod-page-heading"><p className="prod-eyebrow">DATA ENTRY · SHOP FLOOR</p><h1>Record a production shift</h1><p>One quick entry captures output, scrap, material trace, and any stoppage for the shift.</p></div>
      <EntryCard title="Shift production report" description="The order totals update automatically when this entry is saved." onSubmit={(event) => submit(event, (form) => {
        const downtimeReasonId = form.get('downtimeReasonId');
        const lotNumber = String(form.get('lotNumber') || '').trim();
        return productionApi.createProductionLog({
          manufacturingOrderId: form.get('manufacturingOrderId'),
          workCenterCode: form.get('workCenterCode'),
          operatorId: String(form.get('operatorId')).trim(),
          shiftName: form.get('shiftName'),
          startTime: toIso(form.get('startTime')),
          endTime: toIso(form.get('endTime')),
          durationMinutes: Number(form.get('durationMinutes')),
          outputQuantity: Number(form.get('outputQuantity')),
          outputUnit: form.get('outputUnit'),
          scrapQuantity: Number(form.get('scrapQuantity') || 0),
          companyId: code,
          notes: String(form.get('notes') || '').trim() || null,
          machineDowntime: downtimeReasonId ? {
            downtimeReasonId,
            downtimeMinutes: Number(form.get('downtimeMinutes') || 0),
            technicianId: String(form.get('technicianId') || '').trim() || null,
            notes: String(form.get('downtimeNotes') || '').trim() || null,
          } : null,
          materialLotUsed: lotNumber ? {
            componentSku: String(form.get('componentSku') || '').trim(),
            lotNumber,
            quantityUsed: Number(form.get('materialQuantity') || 0),
            unitOfMeasure: String(form.get('materialUnit') || '').trim() || form.get('outputUnit'),
          } : null,
        });
      }, 'Production shift saved successfully.')} busy={saving} submitLabel="Save shift report">
        <Select label="Manufacturing order" name="manufacturingOrderId" options={orderOptions} placeholder={orderOptions.length ? 'Select the active order' : 'Create a work order first'} />
        <Select label="Machine / line" name="workCenterCode" options={machineOptions} placeholder={machineOptions.length ? 'Select work center' : 'Register a machine first'} />
        <Input label="Operator ID" name="operatorId" placeholder={`${code}-OP-01`} />
        <Select label="Shift" name="shiftName" options={[{ value: 'Morning_Shift', label: 'Morning shift' }, { value: 'Evening_Shift', label: 'Evening shift' }, { value: 'Night_Shift', label: 'Night shift' }]} />
        <Input label="Shift start" name="startTime" type="datetime-local" defaultValue={localDateTime(new Date(new Date().setHours(6, 0, 0, 0)))} />
        <Input label="Shift end" name="endTime" type="datetime-local" defaultValue={localDateTime(new Date(new Date().setHours(14, 0, 0, 0)))} />
        <Input label="Shift duration (minutes)" name="durationMinutes" type="number" min="1" defaultValue="480" />
        <Input label="Good output" name="outputQuantity" type="number" min="0" step="0.01" />
        <Input label="Output unit" name="outputUnit" placeholder="piece, kg, meter…" />
        <Input label="Scrap quantity" name="scrapQuantity" type="number" min="0" step="0.01" required={false} defaultValue="0" />
        <Textarea label="Shift notes" name="notes" placeholder="Production notes, handover details, or unusual events" />
        <div className="prod-form-divider"><span>RECORD ATTRIBUTION · AUTOMATIC</span></div>
        <Input label="Recorded by" name="actorName" defaultValue={actor?.name || ''} readOnly required={false} />
        <Input label="Username" name="actorUsername" defaultValue={actor?.username || ''} readOnly required={false} />
        <Input label="User ID" name="actorUserId" defaultValue={actor?.id || ''} readOnly required={false} help="Captured from your signed-in account; it cannot be changed here." />
        <Input label="Workstation name" name="workstationName" value={workstation} onChange={(event) => onWorkstationChange(event.target.value)} placeholder="Name this workstation" help="A label saved in this browser, not an automatically detected PC name." required={false} />
        <div className="prod-form-divider"><span>OPTIONAL · CAPTURE STOPPAGE WITH THIS SHIFT</span></div>
        <Select label="Downtime reason" name="downtimeReasonId" options={reasonOptions} placeholder="No downtime to record" required={false} />
        <Input label="Downtime minutes" name="downtimeMinutes" type="number" min="0" required={false} defaultValue="0" />
        <Input label="Technician ID" name="technicianId" required={false} />
        <Input label="Downtime note" name="downtimeNotes" required={false} />
        <div className="prod-form-divider"><span>OPTIONAL · RAW MATERIAL TRACE</span></div>
        <Input label="Component SKU" name="componentSku" required={false} placeholder="e.g. RAW-MATERIAL-01" />
        <Input label="Supplier lot number" name="lotNumber" required={false} placeholder="Enter lot to enable traceability" />
        <Input label="Quantity consumed" name="materialQuantity" type="number" min="0" step="0.01" required={false} />
        <Input label="Material unit" name="materialUnit" required={false} placeholder="kg, pieces, meter…" />
      </EntryCard>
      <section className="prod-card prod-table-card"><div className="prod-card-heading"><div><h2>Recent entries · {code}</h2><p>Saved production reports are listed here immediately.</p></div><button className="prod-text-button" onClick={() => refresh()}>Refresh ↻</button></div><DataTable columns={[
        { key: 'startTime', label: 'Start', render: (row) => new Date(row.startTime).toLocaleString() },
        { key: 'workCenterCode', label: 'Machine' }, { key: 'manufacturingOrderId', label: 'Work order', render: (row) => scoped.orders.find((order) => order.id === row.manufacturingOrderId)?.orderNumber || row.manufacturingOrderId },
        { key: 'operatorId', label: 'Operator' }, { key: 'userName', label: 'Recorded by', render: (row) => row.userName || '—' },
        { key: 'workstationName', label: 'Workstation', render: (row) => row.workstationName || '—' },
        { key: 'outputQuantity', label: 'Good output', render: (row) => `${formatNumber(row.outputQuantity)} ${row.outputUnit || ''}` }, { key: 'scrapQuantity', label: 'Scrap', render: (row) => formatNumber(row.scrapQuantity) },
      ]} rows={recentLogs} empty="No production shift logs for this factory yet." /></section>
    </>
  );
}
