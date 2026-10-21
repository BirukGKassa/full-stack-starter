export default function ProductionHeader({ label, user, workstation, onWorkstationChange, refreshing, onRefresh }) {
  return (
    <header className="prod-topbar">
      <div><span className="prod-topbar-mobile">{label || 'System settings'}</span><span className="prod-breadcrumb">Lyu ERP <i>/</i> Production <i>/</i> <strong>{label || 'System settings'}</strong></span></div>
      <div className="prod-topbar-right">
        <label className="prod-workstation-control" title="A label saved in this browser; the browser cannot read your PC hostname.">
          <span>Workstation label</span><input aria-label="Workstation label" value={workstation} onChange={(event) => onWorkstationChange(event.target.value)} placeholder="Name this workstation" />
        </label>
        <span className="prod-live"><i /> Operations online</span>
        <button className="prod-icon-button" aria-label="Refresh production data" onClick={onRefresh} disabled={refreshing}>{refreshing ? '…' : '↻'}</button>
        <span className="prod-user-initial">{user.name?.[0]?.toUpperCase() || 'U'}</span>
      </div>
    </header>
  );
}
