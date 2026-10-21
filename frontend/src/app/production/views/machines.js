import { productionApi } from '../../../lib/production-api.js';
import { DataTable, EntryCard, Input, Select } from '../components/ui.js';

export default function MachinesView({ code, submit, saving, machineOptions, scoped, formatNumber, loadDetails, runAction }) {
  return (
    <>
      <div className="prod-page-heading"><p className="prod-eyebrow">OPERATIONS · ASSETS</p><h1>Machines & tools</h1><p>Register production lines, manage tooling, and keep maintenance status current.</p></div>
      <div className="prod-content-grid prod-content-grid-even">
        <EntryCard title="Register a machine or line" description="Work center codes identify each line in production reports." onSubmit={(event) => submit(event, (form) => productionApi.createWorkCenter({
          plantId: `${code}-PLANT-01`,
          code: String(form.get('code')).trim().toUpperCase(),
          name: form.get('name'),
          factoryType: form.get('factoryType'),
          costPerHour: Number(form.get('costPerHour') || 0),
          nominalSpeed: Number(form.get('nominalSpeed') || 0),
          speedUnit: String(form.get('speedUnit') || '').trim() || null,
        }), 'Machine registered.')} busy={saving}>
          <Input label="Machine code" name="code" placeholder={`${code}-LINE-01`} />
          <Input label="Machine name" name="name" />
          <Input label="Factory type" name="factoryType" defaultValue={code.toLowerCase()} />
          <Input label="Hourly operating cost" name="costPerHour" type="number" min="0" step="0.01" required={false} defaultValue="0" />
          <Input label="Nominal speed" name="nominalSpeed" type="number" min="0" step="0.01" required={false} defaultValue="0" />
          <Input label="Speed unit" name="speedUnit" required={false} placeholder="pieces_per_hour" />
        </EntryCard>
        <EntryCard title="Register a tool or die" description="Track cycle life and assigned machine for maintenance planning." onSubmit={(event) => submit(event, (form) => productionApi.createTool({
          code: String(form.get('code')).trim().toUpperCase(),
          name: form.get('name'),
          toolType: form.get('toolType'),
          maxCycles: Number(form.get('maxCycles')),
          assignedWorkCenterCode: String(form.get('assignedWorkCenterCode') || '').trim() || null,
        }), 'Tool registered.')} busy={saving}>
          <Input label="Tool code" name="code" placeholder={`${code}-TOOL-01`} />
          <Input label="Tool name" name="name" />
          <Input label="Tool type" name="toolType" placeholder="die, mold, roller…" />
          <Input label="Maximum cycles" name="maxCycles" type="number" min="1" />
          <Select label="Assigned work center" name="assignedWorkCenterCode" options={machineOptions} required={false} placeholder="Unassigned" />
        </EntryCard>
      </div>
      <section className="prod-card prod-table-card"><div className="prod-card-heading"><div><h2>Registered work centers</h2><p>Machine state and line details</p></div></div><DataTable columns={[
        { key: 'code', label: 'Code' }, { key: 'name', label: 'Work center' }, { key: 'factoryType', label: 'Type' },
        { key: 'status', label: 'Status', render: (row) => <span className={`prod-pill ${row.status === 'Active' ? 'prod-pill-green' : 'prod-pill-gold'}`}>{row.status}</span> },
        { key: 'nominalSpeed', label: 'Nominal speed', render: (row) => `${formatNumber(row.nominalSpeed)} ${row.speedUnit || ''}` },
        { key: 'actions', label: 'Actions', render: (row) => <div className="prod-row-actions"><button className="prod-text-button" onClick={() => loadDetails('Work center', () => productionApi.getWorkCenter(row.code))}>Details</button><button className="prod-text-button" onClick={() => runAction(() => productionApi.updateWorkCenter(row.code, { status: row.status === 'Active' ? 'Maintenance' : 'Active' }), row.status === 'Active' ? 'Machine marked for maintenance.' : 'Machine returned to active status.')}>{row.status === 'Active' ? 'Mark maintenance' : 'Set active'}</button></div> },
      ]} rows={scoped.workCenters} empty="Register a work center before entering production." /></section>
      <section className="prod-card prod-table-card"><div className="prod-card-heading"><div><h2>Tooling register</h2><p>Cycle life and maintenance actions</p></div></div><DataTable columns={[
        { key: 'code', label: 'Tool code' }, { key: 'name', label: 'Tool' }, { key: 'assignedWorkCenterCode', label: 'Machine' },
        { key: 'lifetime', label: 'Cycle life', render: (row) => `${formatNumber(row.currentCycles)} / ${formatNumber(row.maxCycles)}` },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: '', render: (row) => <div className="prod-row-actions"><button className="prod-text-button" onClick={() => {
          const cycles = Number(window.prompt(`Cycles to add to ${row.code}`, '100'));
          if (Number.isFinite(cycles) && cycles > 0) runAction(() => productionApi.addToolCycles(row.code, cycles), 'Tool cycle count updated.');
        }}>Add cycles</button><button className="prod-text-button" onClick={() => runAction(() => productionApi.serviceTool(row.code), 'Tool maintenance recorded.')}>Service</button></div> },
      ]} rows={scoped.tools} empty="No tools have been registered for this factory." /></section>
    </>
  );
}
