export default function SystemDataTable({ title, description, columns, rows, emptyLabel, action }) {
  return (
    <section className="min-w-0 space-y-4 rounded-xl border border-[#e4e4e7] bg-white p-6 shadow-sm dark:border-[#27272a] dark:bg-[#18181b] max-[640px]:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1"><h2 className="text-base font-semibold tracking-tight text-[#18181b] dark:text-[#fafafa]">{title}</h2><p className="text-sm text-[#71717a] dark:text-[#a1a1aa]">{description}</p></div>{action}
      </div>
      <div className="w-full overflow-x-auto"><table className="w-full border-collapse text-left text-sm">
        <thead className="text-xs text-[#71717a] dark:text-[#a1a1aa]"><tr>{columns.map((column) => <th className="border-b border-[#e4e4e7] px-3 py-2.5 font-medium dark:border-[#3f3f46]" key={column}>{column}</th>)}</tr></thead><tbody className="text-[#3f3f46] dark:text-[#d4d4d8]">
        {rows.map((row) => <tr className="border-b border-[#f4f4f5] hover:bg-[#fafafa] dark:border-[#27272a] dark:hover:bg-[#202024]" key={row.id}>{row.cells.map((cell, index) => <td className="px-3 py-3 align-top" key={index}>{cell}</td>)}</tr>)}
        {!rows.length && <tr><td className="px-3 py-6 text-center text-sm text-[#71717a] dark:text-[#a1a1aa]" colSpan={columns.length}>{emptyLabel}</td></tr>}
      </tbody></table></div>
    </section>
  );
}
