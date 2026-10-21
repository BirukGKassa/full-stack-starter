import { productionApi } from '../../../lib/production-api.js';
import { DataTable, EntryCard, Input } from '../components/ui.js';

export default function ProductsView({ code, submit, saving, scoped, formatNumber, loadDetails, openBomEditor, runAction }) {
  return (
    <>
      <div className="prod-page-heading"><p className="prod-eyebrow">OPERATIONS · PRODUCT SETUP</p><h1>Products & bills of materials</h1><p>Set up recipes and component usage before releasing manufacturing orders.</p></div>
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
        <div className="prod-form-divider"><span>OPTIONAL · FIRST RAW MATERIAL COMPONENT</span></div>
        <Input label="Component SKU" name="componentSku" required={false} />
        <Input label="Component name" name="componentName" required={false} />
        <Input label="Quantity required" name="quantityReq" type="number" min="0" step="0.001" required={false} />
        <Input label="Component unit" name="unitOfMeasure" required={false} placeholder="kg, piece, liter…" />
        <Input label="Unit cost" name="unitCost" type="number" min="0" step="0.001" required={false} defaultValue="0" />
        <Input label="Scrap factor" name="scrapFactor" type="number" min="0" step="0.001" required={false} defaultValue="0" />
      </EntryCard>
      <section className="prod-card prod-table-card"><div className="prod-card-heading"><div><h2>Active recipes · {code}</h2><p>Recipes are available when creating new manufacturing orders.</p></div></div>
        <DataTable columns={[
          { key: 'productSku', label: 'SKU' }, { key: 'productName', label: 'Product' }, { key: 'outputQty', label: 'Batch output', render: (row) => `${formatNumber(row.outputQty)} ${row.outputUnit}` },
          { key: 'standardRunMinutes', label: 'Run minutes' }, { key: 'actions', label: 'Actions', render: (row) => <div className="prod-row-actions"><button className="prod-text-button" onClick={() => loadDetails('BOM recipe', () => productionApi.getBom(row.id))}>View recipe</button><button className="prod-text-button" onClick={() => openBomEditor(row)}>Edit</button><button className="prod-text-button prod-danger-text" onClick={() => { if (window.confirm(`Deactivate ${row.productSku}? Existing orders will not be changed.`)) runAction(() => productionApi.deactivateBom(row.id), 'BOM deactivated.'); }}>Deactivate</button></div> },
        ]} rows={scoped.boms} empty="Create a recipe to add your factory's first product." />
      </section>
    </>
  );
}
