import { useContext } from 'react';
import { AuditContext } from './audit-context.js';

export default function DataTable({ columns, rows, empty = 'No records found yet.', audit = [] }) {
  const sharedAudit = useContext(AuditContext);
  const auditEntries = audit.length ? audit : sharedAudit;
  if (!rows.length) return <div className="grid min-h-32 content-center justify-items-center text-center"><span className="text-2xl text-muted-foreground">◌</span><strong className="mt-2 text-sm font-medium text-foreground">Nothing to show yet</strong><p className="mt-1 text-sm text-muted-foreground">{empty}</p></div>;
  const getAudit = (row) => {
    const identifiers = [row.id, row.code, row.orderNumber, row.productSku].filter(Boolean).map(String);
    return auditEntries.filter((entry) => identifiers.includes(String(entry.recordId)))
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0];
  };
  const hasAudit = auditEntries.length > 0;
  return (
    <div className="w-full overflow-x-auto"><table className="w-full border-collapse text-left text-sm">
      <thead className="text-xs text-muted-foreground"><tr>{columns.map((column) => <th className="border-b border-border px-3 py-2.5 font-medium" key={column.key}>{column.label}</th>)}{hasAudit && <th className="border-b border-border px-3 py-2.5 font-medium">Last changed by</th>}</tr></thead>
      <tbody className="text-foreground">{rows.map((row, index) => {
        const lastChange = getAudit(row);
        return <tr className="border-b border-border transition-colors hover:bg-muted/50" key={row.id || row.code || `${row.orderNumber}-${index}`}>
          {columns.map((column) => <td className="px-3 py-3 align-top" key={column.key}>{column.render ? column.render(row) : row[column.key] ?? '—'}</td>)}
          {hasAudit && <td className="px-3 py-3 align-top">{lastChange ? <span className="grid gap-1"><strong className="text-xs font-medium">{lastChange.userName} · {lastChange.action}</strong><small className="text-xs text-muted-foreground">{lastChange.workstationName || 'Unknown workstation'} · {new Date(lastChange.createdAt).toLocaleString()}</small></span> : <span className="text-xs text-muted-foreground">No audit record</span>}</td>}
        </tr>;
      })}</tbody>
    </table></div>
  );
}
