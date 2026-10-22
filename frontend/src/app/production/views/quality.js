import { productionApi } from '../../../lib/production-api.js';
import { DataTable, EntryCard, Input, Select, Textarea } from '../components/ui.js';

export default function QualityView({ code, submit, saving, orderOptions, scoped, formatDate, formatNumber }) {
  return (
    <>
      <div className="[&_>_p:last-child]:text-[#839087] [&_>_p:last-child]:text-[11px] mt-[15px] mx-0 mb-[23px] [&_h1]:m-0 [&_h1]:text-[#1d3d2b] [&_h1]:font-semibold [&_h1]:text-[clamp(27px,_3vw,_36px)] [&_h1]:leading-[1.12] [&_h1]:font-['Manrope',_sans-serif] [&_h1]:tracking-[-1.5px] [&_>_p:last-child]:mt-2 mx-0 mb-0 dark:[&_h1]:text-[#d9e8d9] dark:[&_>_p:last-child]:text-[#a0aea3] [.group\/erp-system-page_&]:mt-2.5 mx-0 mb-0"><p className="mt-0 mx-0 mb-2.5 text-[#829183] font-bold text-[9px] font-['DM_Mono',_monospace] tracking-[1px] [.group\/erp-dashboard-top_&]:m-0 text-[10px]">OPERATIONS · PRODUCT INTEGRITY</p><h1>Quality & traceability</h1><p>Capture inspections and raw-material lot usage against each manufacturing order.</p></div>
      <div className="grid grid-cols-[minmax(0,_1.5fr)_minmax(280px,_.8fr)] gap-3.5 items-start mb-[14px] max-[1080px]:grid-cols-[minmax(0,_1fr)] grid-cols-2 max-[1080px]:grid-cols-2 max-[760px]:grid-cols-[minmax(0,_1fr)]">
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
      <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] mb-[14px]"><div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start"><div><h2>Inspection history</h2><p>Recorded quality results and tolerances</p></div></div><DataTable columns={[
        { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
        { key: 'manufacturingOrderId', label: 'Order', render: (row) => scoped.orders.find((order) => order.id === row.manufacturingOrderId)?.orderNumber || row.manufacturingOrderId },
        { key: 'inspectionType', label: 'Test' }, { key: 'reading', label: 'Measured / target', render: (row) => `${row.measuredValue} / ${row.targetValue}` },
        { key: 'status', label: 'Result', render: (row) => <span className={`inline-flex items-center py-1 px-[7px] rounded-[30px] text-[8px] font-bold text-[9px]${row.status === 'Pass' ? 'bg-[#edf5e9] text-[#54744c] dark:bg-[#273b2c] dark:text-[#b9d8aa]' : 'bg-[#faeae5] text-[#a45040] dark:bg-[#402c28] dark:text-[#e6ad9e]'}`}>{row.status}</span> },
      ]} rows={[...scoped.qualityInspections].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))} empty="Inspection records will appear here." /></section>
      <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] mb-[14px]"><div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start"><div><h2>Material lot traceability</h2><p>Supplier lots consumed by each order</p></div></div><DataTable columns={[
        { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
        { key: 'manufacturingOrderId', label: 'Order', render: (row) => scoped.orders.find((order) => order.id === row.manufacturingOrderId)?.orderNumber || row.manufacturingOrderId },
        { key: 'componentSku', label: 'Component' }, { key: 'lotNumber', label: 'Supplier lot' }, { key: 'quantityUsed', label: 'Quantity', render: (row) => `${formatNumber(row.quantityUsed, 3)} ${row.unitOfMeasure}` },
      ]} rows={[...scoped.materialLots].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))} empty="Material lot usage will appear here." /></section>
    </>
  );
}
