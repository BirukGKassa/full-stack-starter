import { AuditContext } from './ui.js';
import ProductionDialogs from './production-dialogs.js';
import ProductionHeader from './production-header.js';
import ProductionSidebar from './production-sidebar.js';
import { resourceErrors } from '../constants.js';

export default function ProductionShell({ session, access, isAdmin, activeView, setActiveView, activeDowntime, workstation, updateWorkstation, currentNav, refreshing, refresh, loading, code, apiErrors, viewContent, auditEntries, actions, toast, setToast }) {
  return (
    <AuditContext.Provider value={auditEntries}>
      <div className="prod-shell">
        <ProductionSidebar user={session.user} access={access} isAdmin={isAdmin} activeView={activeView} activeDowntime={activeDowntime} onNavigate={setActiveView} />
        <main className="prod-main">
          <ProductionHeader label={currentNav?.label} user={session.user} workstation={workstation} onWorkstationChange={updateWorkstation} refreshing={refreshing} onRefresh={() => refresh()} />
          {loading ? <div className="prod-loading"><span className="prod-loader" />Loading factory data…</div> : <div className="prod-view">
            <div className="prod-view-heading">
              <div><span className="prod-factory-chip">{code || 'ALL'} FACTORY</span><span className="prod-today-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
              <button className="prod-button prod-button-outline" onClick={() => refresh()} disabled={refreshing}>{refreshing ? 'Refreshing…' : '↻ Refresh data'}</button>
            </div>
            {apiErrors.length > 0 && <section className="prod-card prod-api-warning prod-global-warning"><strong>Some production services could not be reached.</strong><p>{apiErrors.map(([key, value]) => `${resourceErrors[key]}: ${value.error}`).join(' · ')}</p><button className="prod-text-button" onClick={() => refresh()}>Retry failed data ↻</button></section>}
            {viewContent}
            <footer className="prod-footer"><span>PRODUCTION OPERATIONS</span><span>{code || 'MULTI-FACTORY'} · {new Date().getFullYear()}</span></footer>
          </div>}
        </main>
        <ProductionDialogs detailLoading={actions.detailLoading} details={actions.details} onCloseDetails={() => actions.setDetails(null)} editingBom={actions.editingBom} onCloseEditor={() => actions.setEditingBom(null)} onSaveBom={actions.saveBomEdit} toast={toast} onDismissToast={() => setToast(null)} />
      </div>
    </AuditContext.Provider>
  );
}
