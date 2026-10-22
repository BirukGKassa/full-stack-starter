import CreateUserSection from './create-user-section.js';
import SettingsHeader from './settings-header.js';
import UserManagement from './user-management.js';

export default function SettingsContent({ state, actions }) {
  const updateDraft = (userId, current, key) => state.setDrafts((drafts) => ({
    ...drafts, [userId]: state.updateModules(current, key),
  }));
  return (
    <div className="group/prod-admin-settings mx-auto grid w-full max-w-6xl gap-6">
      <SettingsHeader />
      <CreateUserSection modules={state.data?.modules || []} selected={state.newModules} saving={state.saving} isOwner={state.isOwner}
        onModuleChange={(key) => state.setNewModules((current) => state.updateModules(current, key))} onSubmit={actions.createUser} />
      {state.error && <section className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#991b1b] dark:border-[#7f1d1d] dark:bg-[#450a0a] dark:text-[#fecaca]" role="alert"><strong className="font-medium">Unable to load users</strong><p className="mt-1">{state.error}</p><button className="mt-2 font-medium underline underline-offset-4" onClick={state.reload}>Try again</button></section>}
      <UserManagement data={state.data} users={state.visibleUsers} drafts={state.drafts} searchInput={state.searchInput} searchTerm={state.searchTerm}
        saving={state.saving} isOwner={state.isOwner} resetPasswordUser={state.resetPasswordUser} onReload={state.reload} onSearchInput={state.setSearchInput}
        onSearch={(event) => { event.preventDefault(); state.setSearchTerm(state.searchInput); }}
        onClear={() => { state.setSearchInput(''); state.setSearchTerm(''); }}
        onDraftChange={updateDraft} onSaveModules={actions.saveAssignments} onToggleActive={actions.toggleActive} onToggleAdmin={actions.toggleAdmin}
        onToggleReset={(id) => state.setResetPasswordUser((current) => current === id ? null : id)} onResetPassword={actions.resetPassword} />
      <section className="space-y-2 rounded-xl border border-[#e4e4e7] bg-white p-5 text-sm leading-6 text-[#52525b] shadow-sm dark:border-[#27272a] dark:bg-[#18181b] dark:text-[#d4d4d8]"><strong className="font-semibold text-[#18181b] dark:text-[#fafafa]">Owner and administrator access</strong><p>The workspace owner is configured with <code className="rounded bg-[#f4f4f5] px-1 py-0.5 font-mono text-xs dark:bg-[#27272a]">LYU_OWNER_EMAIL</code> or the first address in <code className="rounded bg-[#f4f4f5] px-1 py-0.5 font-mono text-xs dark:bg-[#27272a]">LYU_ADMIN_EMAILS</code>. Only the owner can grant or remove administrator roles; administrators can create regular users and manage module assignments.</p><p>Inactive users are signed out and blocked from Production. Their module assignments remain saved if the account is reactivated.</p></section>
    </div>
  );
}
