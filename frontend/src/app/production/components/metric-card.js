export default function MetricCard({ label, value, note, tone = 'green', icon }) {
  return (
    <article className={`prod-metric prod-metric-${tone}`}>
      <div className="prod-metric-top"><span>{label}</span><i>{icon}</i></div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
