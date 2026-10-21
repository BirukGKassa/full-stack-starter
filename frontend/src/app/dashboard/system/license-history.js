export default function LicenseHistory({ items, loading, onRetry, formatDate }) {
  if (!items.length) return null;
  return <div className="prod-table-wrap"><table className="prod-table"><thead><tr><th>Key suffix</th><th>Status</th><th>Activated</th><th>Expires</th><th>Added</th><th>Action</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}>
    <td>•••• {item.keyLastFour}</td><td><span className={`prod-user-status ${item.status === 'active' ? 'prod-user-status-active' : 'prod-user-status-inactive'}`}>{item.status}</span></td>
    <td>{formatDate(item.activatedAt)}</td><td>{formatDate(item.expiresAt)}</td><td>{formatDate(item.createdAt)}</td>
    <td>{item.status === 'pending' && <button className="prod-text-button" type="button" onClick={onRetry} disabled={loading}>{loading ? 'Checking…' : 'Retry activation'}</button>}</td>
  </tr>)}</tbody></table></div>;
}
