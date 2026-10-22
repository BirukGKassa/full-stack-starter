import ProductionAccountMenu from './production-account-menu.js';

export default function ProductionHeader({ label, user, isOwner, workstation, onWorkstationChange, refreshing, onRefresh }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-6 backdrop-blur max-[760px]:h-14 max-[760px]:px-4">
      <div><span className="hidden max-[760px]:inline max-[760px]:text-[#465b4b] max-[760px]:text-[10px] max-[760px]:font-bold dark:text-[#d2dfd4]">{label || 'System settings'}</span><span className="text-[#8a978d] text-[10px] [&_i]:my-0 mx-2 [&_i]:text-[#c1c9c0] [&_i]:not-italic [&_strong]:text-[#3b5143] [&_strong]:font-bold max-[760px]:hidden dark:text-[#a1afa4] dark:[&_strong]:text-[#d2dfd4]">Lyu ERP <i>/</i> Production <i>/</i> <strong>{label || 'System settings'}</strong></span></div>
      <div className="flex items-center gap-[15px] max-[480px]:gap-2">
        <label className="grid min-w-[150px] gap-1 text-xs font-medium text-muted-foreground max-[760px]:min-w-[115px] max-[760px]:[&_span]:hidden" title="A label saved in this browser; the browser cannot read your PC hostname.">
          <span>Workstation label</span><input aria-label="Workstation label" value={workstation} onChange={(event) => onWorkstationChange(event.target.value)} placeholder="Name this workstation" />
        </label>
        <span className="text-xs text-muted-foreground max-[760px]:hidden"><i className="mr-1.5 inline-block size-2 rounded-full bg-primary" /> Operations online</span>
        <button className="grid size-9 place-items-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50" aria-label="Refresh production data" onClick={onRefresh} disabled={refreshing}>{refreshing ? '…' : '↻'}</button>
        <ProductionAccountMenu user={user} isOwner={isOwner} />
      </div>
    </header>
  );
}
