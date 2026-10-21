import CreateUserSection from './create-user-section.js';
import SettingsHeader from './settings-header.js';
import UserManagement from './user-management.js';

export default function SettingsContent({ state, actions }) {
  const updateDraft = (userId, current, key) => state.setDrafts((drafts) => ({
    ...drafts, [userId]: state.updateModules(current, key),
  }));
  return (
    <div className="prod-admin-settings">
      <SettingsHeader />
      <CreateUserSection modules={state.data?.modules || []} selected={state.newModules} saving={state.saving}
        onModuleChange={(key) => state.setNewModules((current) => state.updateModules(current, key))} onSubmit={actions.createUser} />
      {state.error && <section className="prod-card prod-api-warning"><strong>Unable to load users</strong><p>{state.error}</p><button className="prod-text-button" onClick={state.reload}>Try again</button></section>}
      <UserManagement data={state.data} users={state.visibleUsers} drafts={state.drafts} searchInput={state.searchInput} searchTerm={state.searchTerm}
        saving={state.saving} resetPasswordUser={state.resetPasswordUser} onReload={state.reload} onSearchInput={state.setSearchInput}
        onSearch={(event) => { event.preventDefault(); state.setSearchTerm(state.searchInput); }}
        onClear={() => { state.setSearchInput(''); state.setSearchTerm(''); }}
        onDraftChange={updateDraft} onSaveModules={actions.saveAssignments} onToggleActive={actions.toggleActive}
        onToggleReset={(id) => state.setResetPasswordUser((current) => current === id ? null : id)} onResetPassword={actions.resetPassword} />
      <section className="prod-card prod-security-note"><strong>Administrator bootstrap</strong><p>Administrator access is restricted to email addresses listed in the server-only <code>LYU_ADMIN_EMAILS</code> setting. Add your trusted admin email there and restart the backend; do not grant admin rights from a browser form.</p><p>Inactive users are signed out and blocked from Production. Their module assignments remain saved if the account is reactivated.</p></section>
    </div>
  );
}
