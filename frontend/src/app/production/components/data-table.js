import { useContext } from 'react';
import { AuditContext } from './audit-context.js';

export default function DataTable({ columns, rows, empty = 'No records found yet.', audit = [] }) {
  const sharedAudit = useContext(AuditContext);
  const auditEntries = audit.length ? audit : sharedAudit;
  if (!rows.length) return <div className="min-h-[130px] grid content-center justify-items-center text-[#9aa59c] text-center [&_>_span]:text-[#8ca37f] [&_>_span]:text-[22px] [&_strong]:mt-[6px] [&_strong]:text-[#68786d] [&_strong]:text-[10px] [&_p]:mt-1 mx-0 mb-0 [&_p]:text-[9px] dark:[&_strong]:text-[#c4d3c5]"><span>◌</span><strong>Nothing to show yet</strong><p>{empty}</p></div>;
  const getAudit = (row) => {
    const identifiers = [row.id, row.code, row.orderNumber, row.productSku].filter(Boolean).map(String);
    return auditEntries.filter((entry) => identifiers.includes(String(entry.recordId)))
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0];
  };
  const hasAudit = auditEntries.length > 0;
  return (
    <div className="w-[100%] overflow-x-auto"><table className="w-[100%] border-collapse text-left whitespace-nowrap [&_th]:py-[9px] px-[9px] [&_th]:border-b border-b-[#e9ede7] [&_th]:text-[#96a097] [&_th]:font-bold [&_th]:text-[8px] [&_th]:font-['DM_Mono',_monospace] [&_th]:tracking-[.4px] [&_th]:uppercase [&_td]:py-[11px] px-[9px] [&_td]:border-b border-b-[#f0f2ee] [&_td]:text-[#516156] [&_td]:text-[9px] [&_tbody_tr:last-child_td]:border-b-[0] [&_tbody_tr:hover]:bg-[#fbfcf9] dark:[&_th]:border-[#334237] dark:[&_th]:text-[#9aa99d] dark:[&_td]:border-[#29372d] dark:[&_td]:text-[#c1cec3] dark:[&_tbody_tr:hover]:bg-[#1d2b22] [&_th]:text-[9px] [&_td]:text-[11px]">
      <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}{hasAudit && <th>Last changed by</th>}</tr></thead>
      <tbody>{rows.map((row, index) => {
        const lastChange = getAudit(row);
        return <tr key={row.id || row.code || `${row.orderNumber}-${index}`}>
          {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key] ?? '—'}</td>)}
          {hasAudit && <td>{lastChange ? <span className="[&_small]:text-[#929d93] [&_small]:text-[8px] grid gap-1 [&_strong]:text-[#617367] [&_strong]:text-[8px] [&_strong]:font-semibold [&_small]:whitespace-normal gap-[3px] whitespace-normal [&_strong]:text-[#66786b] [&_strong]:text-[9px] [&_small]:text-[#98a39a] dark:[&_small]:text-[#9aa99d] dark:[&_strong]:text-[#b7c6b9]"><strong>{lastChange.userName} · {lastChange.action}</strong><small>{lastChange.workstationName || 'Unknown workstation'} · {new Date(lastChange.createdAt).toLocaleString()}</small></span> : <span className="text-[#617367] text-[8px] font-semibold text-[#a1aaa2] text-[9px] dark:text-[#b7c6b9]">No audit record</span>}</td>}
        </tr>;
      })}</tbody>
    </table></div>
  );
}
