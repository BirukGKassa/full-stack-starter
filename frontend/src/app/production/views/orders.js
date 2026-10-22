import { productionApi } from '../../../lib/production-api.js';
import { DataTable, EntryCard, Input, Select, Textarea } from '../components/ui.js';
import { toIso } from '../utils.js';

export default function OrdersView({ code, submit, saving, bomOptions, scoped, formatNumber, formatDate, loadDetails, runAction, setActiveView }) {
  return (
    <>
      <div className="[&_>_p:last-child]:text-[#839087] [&_>_p:last-child]:text-[11px] mt-[15px] mx-0 mb-[23px] [&_h1]:m-0 [&_h1]:text-[#1d3d2b] [&_h1]:font-semibold [&_h1]:text-[clamp(27px,_3vw,_36px)] [&_h1]:leading-[1.12] [&_h1]:font-['Manrope',_sans-serif] [&_h1]:tracking-[-1.5px] [&_>_p:last-child]:mt-2 mx-0 mb-0 dark:[&_h1]:text-[#d9e8d9] dark:[&_>_p:last-child]:text-[#a0aea3] [.group\/erp-system-page_&]:mt-2.5 mx-0 mb-0"><p className="mt-0 mx-0 mb-2.5 text-[#829183] font-bold text-[9px] font-['DM_Mono',_monospace] tracking-[1px] [.group\/erp-dashboard-top_&]:m-0 text-[10px]">OPERATIONS · PLANNING</p><h1>Work orders</h1><p>Create production orders, monitor progress, and keep planned quantities in view.</p></div>
      <EntryCard title="Create manufacturing order" description="Choose an active BOM and set the target quantity." onSubmit={(event) => submit(event, (form) => productionApi.createOrder({
        companyId: code,
        orderNumber: String(form.get('orderNumber')).trim(),
        bomId: form.get('bomId'),
        productSku: form.get('productSku'),
        targetQuantity: Number(form.get('targetQuantity')),
        priority: form.get('priority'),
        batchNumber: String(form.get('batchNumber') || '').trim() || null,
        dueDate: form.get('dueDate') ? toIso(`${form.get('dueDate')}T23:59`) : null,
        notes: String(form.get('notes') || '').trim() || null,
      }), 'Work order created.')} busy={saving}>
        <Input label="Order number" name="orderNumber" placeholder={`${code}-MO-2026-001`} />
        <Select label="Bill of materials" name="bomId" options={bomOptions} placeholder={bomOptions.length ? 'Select a product recipe' : 'Create a BOM first'} />
        <Input label="Product SKU" name="productSku" placeholder="Finished product code" />
        <Input label="Target quantity" name="targetQuantity" type="number" min="0.01" step="0.01" />
        <Select label="Priority" name="priority" options={[{ value: 'Normal', label: 'Normal' }, { value: 'High', label: 'High' }, { value: 'Urgent', label: 'Urgent' }]} />
        <Input label="Batch number" name="batchNumber" required={false} placeholder="Optional lot or batch" />
        <Input label="Due date" name="dueDate" type="date" required={false} />
        <Textarea label="Instructions" name="notes" placeholder="Production notes or special requirements" />
      </EntryCard>
      <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] mb-[14px]">
        <div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start"><div><h2>Orders · {code}</h2><p>{scoped.orders.length} orders in this factory</p></div></div>
        <DataTable columns={[
          { key: 'orderNumber', label: 'Order' },
          { key: 'productSku', label: 'Product' },
          { key: 'targetQuantity', label: 'Target', render: (row) => formatNumber(row.targetQuantity) },
          { key: 'producedQty', label: 'Produced', render: (row) => formatNumber(row.producedQty) },
          { key: 'status', label: 'Status', render: (row) => <span className={`inline-flex items-center py-1 px-[7px] rounded-[30px] text-[8px] font-bold text-[9px]${row.status === 'Completed' ? 'bg-[#edf5e9] text-[#54744c] dark:bg-[#273b2c] dark:text-[#b9d8aa]' : 'bg-[#eaf1f5] text-[#557989] dark:bg-[#243641] dark:text-[#b2d0dc]'}`}>{row.status}</span> },
          { key: 'dueDate', label: 'Due', render: (row) => formatDate(row.dueDate) },
          { key: 'actions', label: 'Actions', render: (row) => <div className="flex flex-wrap gap-[9px]"><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={() => loadDetails('Manufacturing order', () => productionApi.getOrder(row.id))}>Details</button><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={() => loadDetails('Order progress', () => productionApi.getOrderProgress(row.id))}>Progress</button>{row.status !== 'Completed' && <button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={() => { const nextStatus = row.status === 'Draft' ? 'In Progress' : 'Completed'; if (nextStatus !== 'Completed' || window.confirm(`Mark ${row.orderNumber} as completed?`)) runAction(() => productionApi.updateOrderStatus(row.id, nextStatus), nextStatus === 'In Progress' ? 'Order moved to in progress.' : 'Order marked complete.'); }}>{row.status === 'Draft' ? 'Start' : 'Complete'}</button>}</div> },
        ]} rows={scoped.orders} empty="Create a work order to begin tracking production." />
      </section>
      <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] mb-[14px]"><div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start"><div><h2>Product recipes</h2><p>Bills of materials available to this factory</p></div><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={() => setActiveView('machines')}>Add a machine ↗</button></div>
        <DataTable columns={[
          { key: 'productSku', label: 'SKU' }, { key: 'productName', label: 'Product' }, { key: 'outputQty', label: 'Batch output', render: (row) => `${formatNumber(row.outputQty)} ${row.outputUnit}` }, { key: 'standardRunMinutes', label: 'Run minutes' },
          { key: 'actions', label: '', render: (row) => <div className="flex flex-wrap gap-[9px]"><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={() => loadDetails('BOM recipe', () => productionApi.getBom(row.id))}>View recipe</button><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline text-[#ad5949]" onClick={() => runAction(() => productionApi.deactivateBom(row.id), 'BOM deactivated.')}>Deactivate</button></div> },
        ]} rows={scoped.boms} empty="Add a bill of materials to make it available for orders." />
      </section>
    </>
  );
}
