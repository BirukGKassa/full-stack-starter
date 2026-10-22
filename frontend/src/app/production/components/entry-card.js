export default function EntryCard({ title, description, onSubmit, busy, submitLabel = 'Save entry', children }) {
  return (
    <form className="mb-4 min-w-0 space-y-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm max-[760px]:p-4" onSubmit={onSubmit}>
      <header className="space-y-1.5"><h2 className="text-base font-semibold tracking-tight">{title}</h2><p className="text-sm text-muted-foreground">{description}</p></header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">Fields marked * are required.</span>
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
      </footer>
    </form>
  );
}
