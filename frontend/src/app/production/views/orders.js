import { productionApi } from '../../../lib/production-api.js';
import { DataTable, EntryCard, Input, Select, Textarea } from '../components/ui.js';
import { toIso } from '../utils.js';

export default function OrdersView({ code, submit, saving, bomOptions, scoped, formatNumber, formatDate, loadDetails, runAction, setActiveView }) {
  return (
    <>
      <div className="prod-page-heading"><p className="prod-eyebrow">OPERATIONS · PLANNING</p><h1>Work orders</h1><p>Create production orders, monitor progress, and keep planned quantities in view.</p></div>
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
      <section className="prod-card prod-table-card">
        <div className="prod-card-heading"><div><h2>Orders · {code}</h2><p>{scoped.orders.length} orders in this factory</p></div></div>
        <DataTable columns={[
          { key: 'orderNumber', label: 'Order' },
          { key: 'productSku', label: 'Product' },
          { key: 'targetQuantity', label: 'Target', render: (row) => formatNumber(row.targetQuantity) },
          { key: 'producedQty', label: 'Produced', render: (row) => formatNumber(row.producedQty) },
          { key: 'status', label: 'Status', render: (row) => <span className={`prod-pill ${row.status === 'Completed' ? 'prod-pill-green' : 'prod-pill-blue'}`}>{row.status}</span> },
          { key: 'dueDate', label: 'Due', render: (row) => formatDate(row.dueDate) },
          { key: 'actions', label: 'Actions', render: (row) => <div className="prod-row-actions"><button className="prod-text-button" onClick={() => loadDetails('Manufacturing order', () => productionApi.getOrder(row.id))}>Details</button><button className="prod-text-button" onClick={() => loadDetails('Order progress', () => productionApi.getOrderProgress(row.id))}>Progress</button>{row.status !== 'Completed' && <button className="prod-text-button" onClick={() => { const nextStatus = row.status === 'Draft' ? 'In Progress' : 'Completed'; if (nextStatus !== 'Completed' || window.confirm(`Mark ${row.orderNumber} as completed?`)) runAction(() => productionApi.updateOrderStatus(row.id, nextStatus), nextStatus === 'In Progress' ? 'Order moved to in progress.' : 'Order marked complete.'); }}>{row.status === 'Draft' ? 'Start' : 'Complete'}</button>}</div> },
        ]} rows={scoped.orders} empty="Create a work order to begin tracking production." />
      </section>
      <section className="prod-card prod-table-card"><div className="prod-card-heading"><div><h2>Product recipes</h2><p>Bills of materials available to this factory</p></div><button className="prod-text-button" onClick={() => setActiveView('machines')}>Add a machine ↗</button></div>
        <DataTable columns={[
          { key: 'productSku', label: 'SKU' }, { key: 'productName', label: 'Product' }, { key: 'outputQty', label: 'Batch output', render: (row) => `${formatNumber(row.outputQty)} ${row.outputUnit}` }, { key: 'standardRunMinutes', label: 'Run minutes' },
          { key: 'actions', label: '', render: (row) => <div className="prod-row-actions"><button className="prod-text-button" onClick={() => loadDetails('BOM recipe', () => productionApi.getBom(row.id))}>View recipe</button><button className="prod-text-button prod-danger-text" onClick={() => runAction(() => productionApi.deactivateBom(row.id), 'BOM deactivated.')}>Deactivate</button></div> },
        ]} rows={scoped.boms} empty="Add a bill of materials to make it available for orders." />
      </section>
    </>
  );
}
