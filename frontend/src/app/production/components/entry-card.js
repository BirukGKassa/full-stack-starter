export default function EntryCard({ title, description, onSubmit, busy, submitLabel = 'Save entry', children }) {
  return (
    <form className="prod-card prod-entry-card" onSubmit={onSubmit}>
      <div className="prod-card-heading">
        <div><h2>{title}</h2><p>{description}</p></div>
      </div>
      <div className="prod-form-grid">{children}</div>
      <div className="prod-form-actions"><span>Fields marked <b>*</b> are required.</span><button className="prod-button prod-button-primary" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button></div>
    </form>
  );
}
