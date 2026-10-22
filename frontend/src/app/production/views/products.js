import { productionApi } from '../../../lib/production-api.js';
import { DataTable, EntryCard, Input } from '../components/ui.js';

export default function ProductsView({ code, submit, saving, scoped, formatNumber, loadDetails, openBomEditor, runAction }) {
  return (
    <>
      <div className="[&_>_p:last-child]:text-[#839087] [&_>_p:last-child]:text-[11px] mt-[15px] mx-0 mb-[23px] [&_h1]:m-0 [&_h1]:text-[#1d3d2b] [&_h1]:font-semibold [&_h1]:text-[clamp(27px,_3vw,_36px)] [&_h1]:leading-[1.12] [&_h1]:font-['Manrope',_sans-serif] [&_h1]:tracking-[-1.5px] [&_>_p:last-child]:mt-2 mx-0 mb-0 dark:[&_h1]:text-[#d9e8d9] dark:[&_>_p:last-child]:text-[#a0aea3] [.group\/erp-system-page_&]:mt-2.5 mx-0 mb-0"><p className="mt-0 mx-0 mb-2.5 text-[#829183] font-bold text-[9px] font-['DM_Mono',_monospace] tracking-[1px] [.group\/erp-dashboard-top_&]:m-0 text-[10px]">OPERATIONS · PRODUCT SETUP</p><h1>Products & bills of materials</h1><p>Set up recipes and component usage before releasing manufacturing orders.</p></div>
      <EntryCard title="Create a product recipe" description="Define a finished product and its standard raw material component." onSubmit={(event) => submit(event, (form) => {
        const componentSku = String(form.get('componentSku') || '').trim();
        return productionApi.createBom({
          productSku: String(form.get('productSku')).trim().toUpperCase(),
          productName: String(form.get('productName')).trim(),
          outputQty: Number(form.get('outputQty')),
          outputUnit: String(form.get('outputUnit')).trim(),
          standardRunMinutes: Number(form.get('standardRunMinutes') || 0),
          metadata: { factory: code, productFamily: String(form.get('productFamily') || '').trim() },
          lines: componentSku ? [{
            componentSku: componentSku.toUpperCase(),
            componentName: String(form.get('componentName')).trim(),
            quantityReq: Number(form.get('quantityReq')),
            unitOfMeasure: String(form.get('unitOfMeasure')).trim(),
            unitCost: Number(form.get('unitCost') || 0),
            scrapFactor: Number(form.get('scrapFactor') || 0),
          }] : [],
        });
      }, 'Product recipe and component saved.')} busy={saving}>
        <Input label="Product SKU" name="productSku" placeholder={`${code}-PRODUCT-01`} />
        <Input label="Product name" name="productName" />
        <Input label="Standard output quantity" name="outputQty" type="number" min="0.01" step="0.01" defaultValue="1" />
        <Input label="Output unit" name="outputUnit" placeholder="piece, kg, meter…" />
        <Input label="Standard run time (minutes)" name="standardRunMinutes" type="number" min="0" step="0.1" required={false} defaultValue="0" />
        <Input label="Product family" name="productFamily" required={false} placeholder="Optional category" />
        <div className="col-span-full pt-[8px] border-t border-t-[#edf0eb] text-[#98a299] font-bold text-[8px] font-['DM_Mono',_monospace] tracking-[.7px] max-[480px]:col-start-1 dark:border-[#2d3c31]"><span>OPTIONAL · FIRST RAW MATERIAL COMPONENT</span></div>
        <Input label="Component SKU" name="componentSku" required={false} />
        <Input label="Component name" name="componentName" required={false} />
        <Input label="Quantity required" name="quantityReq" type="number" min="0" step="0.001" required={false} />
        <Input label="Component unit" name="unitOfMeasure" required={false} placeholder="kg, piece, liter…" />
        <Input label="Unit cost" name="unitCost" type="number" min="0" step="0.001" required={false} defaultValue="0" />
        <Input label="Scrap factor" name="scrapFactor" type="number" min="0" step="0.001" required={false} defaultValue="0" />
      </EntryCard>
      <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] mb-[14px]"><div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start"><div><h2>Active recipes · {code}</h2><p>Recipes are available when creating new manufacturing orders.</p></div></div>
        <DataTable columns={[
          { key: 'productSku', label: 'SKU' }, { key: 'productName', label: 'Product' }, { key: 'outputQty', label: 'Batch output', render: (row) => `${formatNumber(row.outputQty)} ${row.outputUnit}` },
          { key: 'standardRunMinutes', label: 'Run minutes' }, { key: 'actions', label: 'Actions', render: (row) => <div className="flex flex-wrap gap-[9px]"><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={() => loadDetails('BOM recipe', () => productionApi.getBom(row.id))}>View recipe</button><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={() => openBomEditor(row)}>Edit</button><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline text-[#ad5949]" onClick={() => { if (window.confirm(`Deactivate ${row.productSku}? Existing orders will not be changed.`)) runAction(() => productionApi.deactivateBom(row.id), 'BOM deactivated.'); }}>Deactivate</button></div> },
        ]} rows={scoped.boms} empty="Create a recipe to add your factory's first product." />
      </section>
    </>
  );
}
