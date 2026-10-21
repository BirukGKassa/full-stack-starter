import { Input } from '../../production/components/ui.js';
import ModuleSelector from './module-selector.js';

export default function ManagedUserCard({ account, draft, resetOpen, saving, onModulesChange, onSaveModules, onToggleActive, onToggleReset, onResetPassword }) {
  const sessionText = account.session.activeCount
    ? `${account.session.activeCount} active session${account.session.activeCount === 1 ? '' : 's'}`
    : `No active sessions${account.session.lastSessionAt ? ` · Last session ${new Date(account.session.lastSessionAt).toLocaleString()}` : ''}`;
  return (
    <article className="prod-managed-user">
      <div className="prod-managed-user-heading">
        <div className="prod-managed-identity"><strong>{account.name}</strong>
          <small>@{account.username || 'No username'} · {account.email} · Employee ID: {account.employeeId || 'Not linked'}</small>
          <span className="prod-user-session">{sessionText}</span>
        </div>
        <span className={`prod-user-status ${account.isActive ? 'prod-user-status-active' : 'prod-user-status-inactive'}`}>{account.isActive ? 'Active' : 'Inactive'}</span>
      </div>
      <div className="prod-field prod-assignment-field"><span>Assigned modules</span>
        <ModuleSelector modules={account.availableModules} selected={draft} onChange={onModulesChange} />
      </div>
      <div className="prod-managed-actions">
        <button className="prod-button prod-button-outline" disabled={saving || !account.isActive} onClick={onSaveModules}>Save modules</button>
        <button className="prod-button prod-button-outline" disabled={saving} onClick={onToggleReset}>{resetOpen ? 'Cancel password reset' : 'Reset password'}</button>
        <button className={`prod-button ${account.isActive ? 'prod-button-danger' : 'prod-button-primary'}`} disabled={saving} onClick={onToggleActive}>{account.isActive ? 'Deactivate user' : 'Reactivate user'}</button>
      </div>
      {resetOpen && <form className="prod-reset-password" onSubmit={onResetPassword}>
        <Input label={`New temporary password for ${account.name}`} name="temporaryPassword" type="password" minLength="8" maxLength="128" placeholder="Enter a new password" help="Resetting signs the user out of every active session." />
        <button className="prod-button prod-button-primary" disabled={saving}>{saving ? 'Resetting…' : 'Save new password'}</button>
      </form>}
    </article>
  );
}
