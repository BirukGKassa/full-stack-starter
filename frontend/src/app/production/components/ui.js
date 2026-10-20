import { createContext, useContext } from 'react';

export const AuditContext = createContext([]);

export function Input({ label, name, type = 'text', required = true, defaultValue, value, onChange, readOnly = false, min, minLength, maxLength, step, placeholder, help }) {
  return (
    <label className="prod-field">
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <input name={name} type={type} required={required} {...(value === undefined ? { defaultValue } : { value })} onChange={onChange} readOnly={readOnly} min={min} minLength={minLength} maxLength={maxLength} step={step} placeholder={placeholder} />
      {help && <small>{help}</small>}
    </label>
  );
}

export function Select({ label, name, options, required = true, placeholder = 'Choose one', defaultValue }) {
  return (
    <label className="prod-field">
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <select name={name} required={required} defaultValue={defaultValue || ''}>
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export function Textarea({ label, name, required = false, placeholder }) {
  return (
    <label className="prod-field prod-field-wide">
      <span>{label}</span>
      <textarea name={name} rows="2" required={required} placeholder={placeholder} />
    </label>
  );
}

export function EntryCard({ title, description, onSubmit, busy, submitLabel = 'Save entry', children }) {
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

export function DataTable({ columns, rows, empty = 'No records found yet.', audit = [] }) {
  const sharedAudit = useContext(AuditContext);
  const auditEntries = audit.length ? audit : sharedAudit;
  if (!rows.length) return <div className="prod-empty"><span>◌</span><strong>Nothing to show yet</strong><p>{empty}</p></div>;
  const getAudit = (row) => {
    const identifiers = [row.id, row.code, row.orderNumber, row.productSku].filter(Boolean).map(String);
    return auditEntries.filter((entry) => identifiers.includes(String(entry.recordId)))
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0];
  };
  const hasAudit = auditEntries.length > 0;
  return (
    <div className="prod-table-wrap">
      <table className="prod-table">
        <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}{hasAudit && <th>Last changed by</th>}</tr></thead>
        <tbody>{rows.map((row, index) => {
          const lastChange = getAudit(row);
          return <tr key={row.id || row.code || `${row.orderNumber}-${index}`}>
            {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key] ?? '—'}</td>)}
            {hasAudit && <td>{lastChange ? <span className="prod-audit-meta"><strong>{lastChange.userName} · {lastChange.action}</strong><small>{lastChange.workstationName || 'Unknown workstation'} · {new Date(lastChange.createdAt).toLocaleString()}</small></span> : <span className="prod-audit-empty">No audit record</span>}</td>}
          </tr>;
        })}</tbody>
      </table>
    </div>
  );
}

export function MetricCard({ label, value, note, tone = 'green', icon }) {
  return (
    <article className={`prod-metric prod-metric-${tone}`}>
      <div className="prod-metric-top"><span>{label}</span><i>{icon}</i></div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
