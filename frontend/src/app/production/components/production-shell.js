import { AuditContext } from './ui.js';
import ProductionDialogs from './production-dialogs.js';
import ProductionHeader from './production-header.js';
import ProductionSidebar from './production-sidebar.js';
import { resourceErrors } from '../constants.js';

export default function ProductionShell({ session, access, isAdmin, activeView, setActiveView, activeDowntime, workstation, updateWorkstation, currentNav, refreshing, refresh, loading, code, apiErrors, viewContent, auditEntries, actions, toast, setToast }) {
  return (
    <AuditContext.Provider value={auditEntries}>
      <div className="min-h-screen grid grid-cols-[250px_minmax(0,_1fr)] bg-background text-foreground max-[1080px]:grid-cols-[220px_minmax(0,_1fr)] max-[760px]:block">
        <ProductionSidebar access={access} isAdmin={isAdmin} activeView={activeView} activeDowntime={activeDowntime} onNavigate={setActiveView} />
        <main className="min-w-0">
          <ProductionHeader label={currentNav?.label} user={session.user} isOwner={access?.user?.isOwner} workstation={workstation} onWorkstationChange={updateWorkstation} refreshing={refreshing} onRefresh={() => refresh()} />
          {loading ? <div className="grid min-h-[60vh] place-content-center gap-3 text-center text-sm text-muted-foreground"><span className="mx-auto size-5 animate-spin rounded-full border-2 border-muted border-t-primary motion-reduce:animate-none" />Loading factory data…</div> : <div className="mx-auto w-full max-w-7xl space-y-6 p-6 max-[760px]:p-4">
            <div className="flex items-center justify-between gap-3 mb-[25px] [&_>_div]:flex [&_>_div]:items-center [&_>_div]:gap-[13px] max-[760px]:mb-[17px] max-[760px]:[&_>_div]:items-start max-[760px]:[&_>_div]:flex-col max-[760px]:[&_>_div]:gap-1.5">
              <div><span className="py-1.5 px-[9px] border border-[#dae6d5] rounded-[5px] bg-[#edf4e9] text-[#4f7350] font-bold text-[9px] font-['DM_Mono',_monospace] tracking-[.4px] dark:border-[#3b5540] dark:bg-[#243528] dark:text-[#bfd9b0]">{code || 'ALL'} FACTORY</span><span className="text-[#8b978e] text-[10px] max-[760px]:text-[9px] dark:text-[#a1afa4]">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
              <button className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50" onClick={() => refresh()} disabled={refreshing}>{refreshing ? 'Refreshing…' : '↻ Refresh data'}</button>
            </div>
            {apiErrors.length > 0 && <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] mt-[14px] border-[#f0d3c9] bg-[#fff8f5] [&_strong]:text-[#a04f3d] [&_strong]:text-[11px] [&_p]:text-[#906e65] [&_p]:text-[9px] [&_p]:leading-[1.7] dark:border-[#594139] dark:bg-[#2a211d] dark:[&_strong]:text-[#e8b5a6] dark:[&_p]:text-[#c0a398] mb-[14px]"><strong>Some production services could not be reached.</strong><p>{apiErrors.map(([key, value]) => `${resourceErrors[key]}: ${value.error}`).join(' · ')}</p><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={() => refresh()}>Retry failed data ↻</button></section>}
            {viewContent}
            <footer className="flex justify-between pt-[23px] px-0.5 pb-[5px] text-[#a1aaa2] text-[8px] font-['DM_Mono',_monospace] tracking-[.5px] max-[480px]:gap-3 max-[480px]:text-[7px] dark:text-[#849389]"><span>PRODUCTION OPERATIONS</span><span>{code || 'MULTI-FACTORY'} · {new Date().getFullYear()}</span></footer>
          </div>}
        </main>
        <ProductionDialogs detailLoading={actions.detailLoading} details={actions.details} onCloseDetails={() => actions.setDetails(null)} editingBom={actions.editingBom} onCloseEditor={() => actions.setEditingBom(null)} onSaveBom={actions.saveBomEdit} toast={toast} onDismissToast={() => setToast(null)} />
      </div>
    </AuditContext.Provider>
  );
}
