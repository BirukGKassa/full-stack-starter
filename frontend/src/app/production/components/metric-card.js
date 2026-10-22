export default function MetricCard({ label, value, note, tone = 'green', icon }) {
  return (
    <article className="min-h-[120px] rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm max-[480px]:min-h-[106px] max-[480px]:p-3">
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground"><span>{label}</span><i className={`grid size-8 place-items-center rounded-md bg-secondary text-secondary-foreground not-italic ${tone === 'red' ? 'bg-destructive/10 text-destructive' : ''}`}>{icon}</i></div>
      <strong className="mt-3 block text-2xl font-semibold tracking-tight">{value}</strong>
      <small className="mt-1 block text-xs text-muted-foreground">{note}</small>
    </article>
  );
}
