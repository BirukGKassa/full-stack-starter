import { productionApi } from '../../../lib/production-api.js';
import { DataTable, EntryCard, Input, Select, Textarea } from '../components/ui.js';

export default function QualityView({ code, submit, saving, orderOptions, scoped, formatDate, formatNumber }) {
  return (
    <>
      <div className="prod-page-heading"><p className="prod-eyebrow">OPERATIONS · PRODUCT INTEGRITY</p><h1>Quality & traceability</h1><p>Capture inspections and raw-material lot usage against each manufacturing order.</p></div>
      <div className="prod-content-grid prod-content-grid-even">
        <EntryCard title="Record quality inspection" description="Pass/fail status is evaluated using the measurement limits." onSubmit={(event) => submit(event, (form) => productionApi.createQualityInspection({
          manufacturingOrderId: form.get('manufacturingOrderId'),
          inspectorId: String(form.get('inspectorId')).trim(),
          inspectionType: String(form.get('inspectionType')).trim(),
          measuredValue: Number(form.get('measuredValue')),
          targetValue: Number(form.get('targetValue')),
          lowerLimit: form.get('lowerLimit') === '' ? null : Number(form.get('lowerLimit')),
          upperLimit: form.get('upperLimit') === '' ? null : Number(form.get('upperLimit')),
          sampleSize: Number(form.get('sampleSize') || 1),
          notes: String(form.get('notes') || '').trim() || null,
        }), 'Quality inspection saved.')} busy={saving}>
          <Select label="Manufacturing order" name="manufacturingOrderId" options={orderOptions} placeholder={orderOptions.length ? 'Select an order' : 'Create an order first'} />
          <Input label="Inspector ID" name="inspectorId" placeholder={`${code}-QA-01`} />
          <Input label="Inspection type" name="inspectionType" placeholder="thickness, gsm, moisture…" />
          <Input label="Measured value" name="measuredValue" type="number" step="0.001" />
          <Input label="Target value" name="targetValue" type="number" step="0.001" />
          <Input label="Lower limit" name="lowerLimit" type="number" step="0.001" required={false} />
          <Input label="Upper limit" name="upperLimit" type="number" step="0.001" required={false} />
          <Input label="Sample size" name="sampleSize" type="number" min="1" defaultValue="1" />
          <Textarea label="Inspection notes" name="notes" />
        </EntryCard>
        <EntryCard title="Trace material lot" description="Connect supplier raw-material batches to a finished production order." onSubmit={(event) => submit(event, (form) => productionApi.createMaterialLot({
          manufacturingOrderId: form.get('manufacturingOrderId'),
          componentSku: String(form.get('componentSku')).trim(),
          lotNumber: String(form.get('lotNumber')).trim(),
          quantityUsed: Number(form.get('quantityUsed')),
          unitOfMeasure: String(form.get('unitOfMeasure')).trim(),
        }), 'Material lot linked to work order.')} busy={saving}>
          <Select label="Manufacturing order" name="manufacturingOrderId" options={orderOptions} placeholder={orderOptions.length ? 'Select an order' : 'Create an order first'} />
          <Input label="Component SKU" name="componentSku" placeholder="Raw material item code" />
          <Input label="Supplier lot number" name="lotNumber" />
          <Input label="Quantity used" name="quantityUsed" type="number" min="0" step="0.001" />
          <Input label="Unit of measure" name="unitOfMeasure" placeholder="kg, pieces, meter…" />
        </EntryCard>
      </div>
      <section className="prod-card prod-table-card"><div className="prod-card-heading"><div><h2>Inspection history</h2><p>Recorded quality results and tolerances</p></div></div><DataTable columns={[
        { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
        { key: 'manufacturingOrderId', label: 'Order', render: (row) => scoped.orders.find((order) => order.id === row.manufacturingOrderId)?.orderNumber || row.manufacturingOrderId },
        { key: 'inspectionType', label: 'Test' }, { key: 'reading', label: 'Measured / target', render: (row) => `${row.measuredValue} / ${row.targetValue}` },
        { key: 'status', label: 'Result', render: (row) => <span className={`prod-pill ${row.status === 'Pass' ? 'prod-pill-green' : 'prod-pill-red'}`}>{row.status}</span> },
      ]} rows={[...scoped.qualityInspections].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))} empty="Inspection records will appear here." /></section>
      <section className="prod-card prod-table-card"><div className="prod-card-heading"><div><h2>Material lot traceability</h2><p>Supplier lots consumed by each order</p></div></div><DataTable columns={[
        { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
        { key: 'manufacturingOrderId', label: 'Order', render: (row) => scoped.orders.find((order) => order.id === row.manufacturingOrderId)?.orderNumber || row.manufacturingOrderId },
        { key: 'componentSku', label: 'Component' }, { key: 'lotNumber', label: 'Supplier lot' }, { key: 'quantityUsed', label: 'Quantity', render: (row) => `${formatNumber(row.quantityUsed, 3)} ${row.unitOfMeasure}` },
      ]} rows={[...scoped.materialLots].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))} empty="Material lot usage will appear here." /></section>
    </>
  );
}
