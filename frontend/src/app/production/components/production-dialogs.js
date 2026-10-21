import { Input } from './ui.js';

export default function ProductionDialogs({ detailLoading, details, onCloseDetails, editingBom, onCloseEditor, onSaveBom, toast, onDismissToast }) {
  return <>
    {detailLoading && <div className="prod-detail-backdrop"><div className="prod-detail-modal"><span className="prod-loader" />Loading details…</div></div>}
    {details && <div className="prod-detail-backdrop" role="presentation" onClick={onCloseDetails}>
      <section className="prod-detail-modal" role="dialog" aria-modal="true" aria-label={details.label} onClick={(event) => event.stopPropagation()}>
        <div className="prod-modal-heading"><div><span className="prod-eyebrow">RECORD DETAILS</span><h2>{details.label}</h2></div><button className="prod-icon-button" onClick={onCloseDetails} aria-label="Close details">×</button></div>
        <pre>{JSON.stringify(details.data, null, 2)}</pre>
      </section>
    </div>}
    {editingBom && <div className="prod-detail-backdrop" role="presentation" onClick={onCloseEditor}>
      <section className="prod-detail-modal" role="dialog" aria-modal="true" aria-label="Edit product recipe" onClick={(event) => event.stopPropagation()}>
        <div className="prod-modal-heading"><div><span className="prod-eyebrow">PRODUCT SETUP</span><h2>Edit recipe</h2></div><button className="prod-icon-button" onClick={onCloseEditor} aria-label="Close edit form">×</button></div>
        <p className="prod-edit-sku">{editingBom.productSku}</p>
        <form className="prod-modal-form" onSubmit={onSaveBom}><Input label="Product name" name="productName" defaultValue={editingBom.productName} /><Input label="Standard run time (minutes)" name="standardRunMinutes" type="number" min="0" step="0.1" defaultValue={editingBom.standardRunMinutes} /><button className="prod-button prod-button-primary">Save changes</button></form>
      </section>
    </div>}
    {toast && <div className={`prod-toast prod-toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>
      <span>{toast.kind === 'success' ? '✓' : '!'}</span><p>{toast.message}</p><button onClick={onDismissToast} aria-label="Dismiss notification">×</button>
    </div>}
  </>;
}
