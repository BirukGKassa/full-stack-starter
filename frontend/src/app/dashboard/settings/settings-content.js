import CreateUserSection from './create-user-section.js';
import SettingsHeader from './settings-header.js';
import UserManagement from './user-management.js';

export default function SettingsContent({ state, actions }) {
  const updateDraft = (userId, current, key) => state.setDrafts((drafts) => ({
    ...drafts, [userId]: state.updateModules(current, key),
  }));
  return (
    <div className="group/prod-admin-settings grid gap-3.5">
      <SettingsHeader />
      <CreateUserSection modules={state.data?.modules || []} selected={state.newModules} saving={state.saving} isOwner={state.isOwner}
        onModuleChange={(key) => state.setNewModules((current) => state.updateModules(current, key))} onSubmit={actions.createUser} />
      {state.error && <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] mt-[14px] border-[#f0d3c9] bg-[#fff8f5] [&_strong]:text-[#a04f3d] [&_strong]:text-[11px] [&_p]:text-[#906e65] [&_p]:text-[9px] [&_p]:leading-[1.7] dark:border-[#594139] dark:bg-[#2a211d] dark:[&_strong]:text-[#e8b5a6] dark:[&_p]:text-[#c0a398]"><strong>Unable to load users</strong><p>{state.error}</p><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={state.reload}>Try again</button></section>}
      <UserManagement data={state.data} users={state.visibleUsers} drafts={state.drafts} searchInput={state.searchInput} searchTerm={state.searchTerm}
        saving={state.saving} isOwner={state.isOwner} resetPasswordUser={state.resetPasswordUser} onReload={state.reload} onSearchInput={state.setSearchInput}
        onSearch={(event) => { event.preventDefault(); state.setSearchTerm(state.searchInput); }}
        onClear={() => { state.setSearchInput(''); state.setSearchTerm(''); }}
        onDraftChange={updateDraft} onSaveModules={actions.saveAssignments} onToggleActive={actions.toggleActive} onToggleAdmin={actions.toggleAdmin}
        onToggleReset={(id) => state.setResetPasswordUser((current) => current === id ? null : id)} onResetPassword={actions.resetPassword} />
      <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] text-[#748176] text-[9px] leading-[1.7] [&_strong]:text-[#47604c] [&_strong]:text-[10px] [&_p]:mt-[7px] mx-0 mb-0 [&_code]:py-0.5 px-1 [&_code]:rounded-[3px] [&_code]:bg-[#f0f3ed] dark:[&_strong]:text-[#d5e2d5] dark:text-[#b7c6b9] dark:[&_code]:bg-[#26352b]"><strong>Owner and administrator access</strong><p>The workspace owner is configured with <code>LYU_OWNER_EMAIL</code> or the first address in <code>LYU_ADMIN_EMAILS</code>. Only the owner can grant or remove administrator roles; administrators can create regular users and manage module assignments.</p><p>Inactive users are signed out and blocked from Production. Their module assignments remain saved if the account is reactivated.</p></section>
    </div>
  );
}
