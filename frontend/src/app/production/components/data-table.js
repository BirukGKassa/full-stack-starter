import { useContext } from 'react';
import { AuditContext } from './audit-context.js';

export default function DataTable({ columns, rows, empty = 'No records found yet.', audit = [] }) {
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
    <div className="prod-table-wrap"><table className="prod-table">
      <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}{hasAudit && <th>Last changed by</th>}</tr></thead>
      <tbody>{rows.map((row, index) => {
        const lastChange = getAudit(row);
        return <tr key={row.id || row.code || `${row.orderNumber}-${index}`}>
          {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key] ?? '—'}</td>)}
          {hasAudit && <td>{lastChange ? <span className="prod-audit-meta"><strong>{lastChange.userName} · {lastChange.action}</strong><small>{lastChange.workstationName || 'Unknown workstation'} · {new Date(lastChange.createdAt).toLocaleString()}</small></span> : <span className="prod-audit-empty">No audit record</span>}</td>}
        </tr>;
      })}</tbody>
    </table></div>
  );
}
