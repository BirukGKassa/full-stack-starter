export default function SystemDataTable({ title, description, columns, rows, emptyLabel, action }) {
  return (
    <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd]">
      <div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start"><div><h2>{title}</h2><p>{description}</p></div>{action}</div>
      <div className="w-[100%] overflow-x-auto"><table className="w-[100%] border-collapse text-left whitespace-nowrap [&_th]:py-[9px] px-[9px] [&_th]:border-b border-b-[#e9ede7] [&_th]:text-[#96a097] [&_th]:font-bold [&_th]:text-[8px] [&_th]:font-['DM_Mono',_monospace] [&_th]:tracking-[.4px] [&_th]:uppercase [&_td]:py-[11px] px-[9px] [&_td]:border-b border-b-[#f0f2ee] [&_td]:text-[#516156] [&_td]:text-[9px] [&_tbody_tr:last-child_td]:border-b-[0] [&_tbody_tr:hover]:bg-[#fbfcf9] dark:[&_th]:border-[#334237] dark:[&_th]:text-[#9aa99d] dark:[&_td]:border-[#29372d] dark:[&_td]:text-[#c1cec3] dark:[&_tbody_tr:hover]:bg-[#1d2b22] [&_th]:text-[9px] [&_td]:text-[11px]"><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>
        {rows.map((row) => <tr key={row.id}>{row.cells.map((cell, index) => <td key={index}>{cell}</td>)}</tr>)}
        {!rows.length && <tr><td colSpan={columns.length}>{emptyLabel}</td></tr>}
      </tbody></table></div>
    </section>
  );
}
