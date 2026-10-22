import { productionApi } from '../../../lib/production-api.js';
import { DataTable, EntryCard, Input, Select } from '../components/ui.js';

export default function MachinesView({ code, submit, saving, machineOptions, scoped, formatNumber, loadDetails, runAction }) {
  return (
    <>
      <div className="[&_>_p:last-child]:text-[#839087] [&_>_p:last-child]:text-[11px] mt-[15px] mx-0 mb-[23px] [&_h1]:m-0 [&_h1]:text-[#1d3d2b] [&_h1]:font-semibold [&_h1]:text-[clamp(27px,_3vw,_36px)] [&_h1]:leading-[1.12] [&_h1]:font-['Manrope',_sans-serif] [&_h1]:tracking-[-1.5px] [&_>_p:last-child]:mt-2 mx-0 mb-0 dark:[&_h1]:text-[#d9e8d9] dark:[&_>_p:last-child]:text-[#a0aea3] [.group\/erp-system-page_&]:mt-2.5 mx-0 mb-0"><p className="mt-0 mx-0 mb-2.5 text-[#829183] font-bold text-[9px] font-['DM_Mono',_monospace] tracking-[1px] [.group\/erp-dashboard-top_&]:m-0 text-[10px]">OPERATIONS · ASSETS</p><h1>Machines & tools</h1><p>Register production lines, manage tooling, and keep maintenance status current.</p></div>
      <div className="grid grid-cols-[minmax(0,_1.5fr)_minmax(280px,_.8fr)] gap-3.5 items-start mb-[14px] max-[1080px]:grid-cols-[minmax(0,_1fr)] grid-cols-2 max-[1080px]:grid-cols-2 max-[760px]:grid-cols-[minmax(0,_1fr)]">
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
      <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] mb-[14px]"><div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start"><div><h2>Registered work centers</h2><p>Machine state and line details</p></div></div><DataTable columns={[
        { key: 'code', label: 'Code' }, { key: 'name', label: 'Work center' }, { key: 'factoryType', label: 'Type' },
        { key: 'status', label: 'Status', render: (row) => <span className={`inline-flex items-center py-1 px-[7px] rounded-[30px] text-[8px] font-bold text-[9px]${row.status === 'Active' ? 'bg-[#edf5e9] text-[#54744c] dark:bg-[#273b2c] dark:text-[#b9d8aa]' : 'bg-[#f8f1df] text-[#9a8047] dark:bg-[#3a3525] dark:text-[#ddca8d]'}`}>{row.status}</span> },
        { key: 'nominalSpeed', label: 'Nominal speed', render: (row) => `${formatNumber(row.nominalSpeed)} ${row.speedUnit || ''}` },
        { key: 'actions', label: 'Actions', render: (row) => <div className="flex flex-wrap gap-[9px]"><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={() => loadDetails('Work center', () => productionApi.getWorkCenter(row.code))}>Details</button><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={() => runAction(() => productionApi.updateWorkCenter(row.code, { status: row.status === 'Active' ? 'Maintenance' : 'Active' }), row.status === 'Active' ? 'Machine marked for maintenance.' : 'Machine returned to active status.')}>{row.status === 'Active' ? 'Mark maintenance' : 'Set active'}</button></div> },
      ]} rows={scoped.workCenters} empty="Register a work center before entering production." /></section>
      <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] mb-[14px]"><div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start"><div><h2>Tooling register</h2><p>Cycle life and maintenance actions</p></div></div><DataTable columns={[
        { key: 'code', label: 'Tool code' }, { key: 'name', label: 'Tool' }, { key: 'assignedWorkCenterCode', label: 'Machine' },
        { key: 'lifetime', label: 'Cycle life', render: (row) => `${formatNumber(row.currentCycles)} / ${formatNumber(row.maxCycles)}` },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: '', render: (row) => <div className="flex flex-wrap gap-[9px]"><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={() => {
          const cycles = Number(window.prompt(`Cycles to add to ${row.code}`, '100'));
          if (Number.isFinite(cycles) && cycles > 0) runAction(() => productionApi.addToolCycles(row.code, cycles), 'Tool cycle count updated.');
        }}>Add cycles</button><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={() => runAction(() => productionApi.serviceTool(row.code), 'Tool maintenance recorded.')}>Service</button></div> },
      ]} rows={scoped.tools} empty="No tools have been registered for this factory." /></section>
    </>
  );
}
