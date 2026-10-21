export default function SystemDataTable({ title, description, columns, rows, emptyLabel, action }) {
  return (
    <section className="prod-card">
      <div className="prod-card-heading"><div><h2>{title}</h2><p>{description}</p></div>{action}</div>
      <div className="prod-table-wrap"><table className="prod-table"><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>
        {rows.map((row) => <tr key={row.id}>{row.cells.map((cell, index) => <td key={index}>{cell}</td>)}</tr>)}
        {!rows.length && <tr><td colSpan={columns.length}>{emptyLabel}</td></tr>}
      </tbody></table></div>
    </section>
  );
}
