import { AuditContext } from './ui.js';
import ProductionDialogs from './production-dialogs.js';
import ProductionHeader from './production-header.js';
import ProductionSidebar from './production-sidebar.js';
import { resourceErrors } from '../constants.js';

export default function ProductionShell({ session, access, isAdmin, activeView, setActiveView, activeDowntime, workstation, updateWorkstation, currentNav, refreshing, refresh, loading, code, apiErrors, viewContent, auditEntries, actions, toast, setToast }) {
  return (
    <AuditContext.Provider value={auditEntries}>
      <div className="min-h-screen grid grid-cols-[245px_minmax(0,_1fr)] bg-[#f5f7f4] text-[#1d2d25] max-[1080px]:grid-cols-[215px_minmax(0,_1fr)] max-[760px]:block dark:bg-[#111a16] dark:text-[#dfe8e0]">
        <ProductionSidebar access={access} isAdmin={isAdmin} activeView={activeView} activeDowntime={activeDowntime} onNavigate={setActiveView} />
        <main className="min-w-0">
          <ProductionHeader label={currentNav?.label} user={session.user} isOwner={access?.user?.isOwner} workstation={workstation} onWorkstationChange={updateWorkstation} refreshing={refreshing} onRefresh={() => refresh()} />
          {loading ? <div className="min-h-[60vh] flex items-center justify-center gap-2.5 text-[#809083] text-[11px]"><span className="w-[17px] h-[17px] inline-block border-[2px] border-[#dfe9db] border-t-[#4d7950] rounded-full animate-[spin_.8s_linear_infinite] motion-reduce:duration-200" />Loading factory data…</div> : <div className="w-[min(1440px,_100%)] m-[auto] p-[23px_clamp(20px,_4vw,_54px)_25px] max-[760px]:pt-4 px-[15px] pb-5">
            <div className="flex items-center justify-between gap-3 mb-[25px] [&_>_div]:flex [&_>_div]:items-center [&_>_div]:gap-[13px] max-[760px]:mb-[17px] max-[760px]:[&_>_div]:items-start max-[760px]:[&_>_div]:flex-col max-[760px]:[&_>_div]:gap-1.5">
              <div><span className="py-1.5 px-[9px] border border-[#dae6d5] rounded-[5px] bg-[#edf4e9] text-[#4f7350] font-bold text-[9px] font-['DM_Mono',_monospace] tracking-[.4px] dark:border-[#3b5540] dark:bg-[#243528] dark:text-[#bfd9b0]">{code || 'ALL'} FACTORY</span><span className="text-[#8b978e] text-[10px] max-[760px]:text-[9px] dark:text-[#a1afa4]">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
              <button className="group/prod-button min-h-[37px] inline-flex items-center justify-center gap-[7px] py-0 px-3.5 border border-transparent rounded-[7px] text-[10px] font-bold cursor-pointer transition-[background,color,border] duration-150 [&:disabled]:opacity-[.55] [&:disabled]:cursor-wait [.group\/prod-modal-form_&]:justify-self-end max-[480px]:[.group\/prod-form-actions_&]:w-[100%] [.group\/prod-managed-actions_&]:min-h-[34px] [.group\/prod-managed-actions_&]:py-0 px-[11px] [.group\/prod-managed-actions_&]:rounded-lg [.group\/prod-managed-actions_&]:text-[10px] border-[#dfe6dd] bg-white text-[#52675a] [&:hover:not(:disabled)]:border-[#b8cdb0] [&:hover:not(:disabled)]:text-[#315b3a] dark:border-[#3a4a3e] dark:bg-[#1d2a22] dark:text-[#cad8cb] dark:[&:hover:not(:disabled)]:border-[#617c61] dark:[&:hover:not(:disabled)]:text-[#e0ecdb]" onClick={() => refresh()} disabled={refreshing}>{refreshing ? 'Refreshing…' : '↻ Refresh data'}</button>
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
