export default function LicenseHistory({ items, loading, onRetry, formatDate }) {
  if (!items.length) return null;
  return (
    <section className="space-y-3 border-t border-[#e4e4e7] pt-5 dark:border-[#3f3f46]">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-[#18181b] dark:text-[#fafafa]">License history</h3>
        <p className="text-sm text-[#71717a] dark:text-[#a1a1aa]">Recent activation and renewal records.</p>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="text-xs text-[#71717a] dark:text-[#a1a1aa]"><tr>
            {['Key suffix', 'Status', 'Activated', 'Expires', 'Added', 'Action'].map((heading) => <th className="border-b border-[#e4e4e7] px-3 py-2.5 font-medium dark:border-[#3f3f46]" key={heading}>{heading}</th>)}
          </tr></thead>
          <tbody className="text-[#3f3f46] dark:text-[#d4d4d8]">{items.map((item) => {
            return (
              <tr className="border-b border-[#f4f4f5] dark:border-[#27272a]" key={item.id}>
                <td className="px-3 py-3">•••• {item.keyLastFour}</td>
                <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${item.status === 'active' ? 'bg-[#f0fdf4] text-[#166534] dark:bg-[#052e16] dark:text-[#bbf7d0]' : item.status === 'pending' ? 'bg-[#fefce8] text-[#854d0e] dark:bg-[#422006] dark:text-[#fef08a]' : 'bg-[#f4f4f5] text-[#52525b] dark:bg-[#27272a] dark:text-[#d4d4d8]'}`}>{item.status}</span></td>
                <td className="px-3 py-3">{formatDate(item.activatedAt)}</td>
                <td className="px-3 py-3">{formatDate(item.expiresAt)}</td>
                <td className="px-3 py-3">{formatDate(item.createdAt)}</td>
                <td className="px-3 py-3">{item.status === 'pending' && <button className="font-medium text-[#52525b] underline-offset-4 hover:underline disabled:opacity-50 dark:text-[#d4d4d8]" type="button" onClick={onRetry} disabled={loading}>{loading ? 'Checking…' : 'Retry activation'}</button>}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </section>
  );
}
