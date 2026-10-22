import { Input } from '../../production/components/ui.js';
import ModuleSelector from './module-selector.js';

export default function ManagedUserCard({ account, draft, resetOpen, saving, isOwner, onModulesChange, onSaveModules, onToggleActive, onToggleAdmin, onToggleReset, onResetPassword }) {
  const sessionText = account.session.activeCount
    ? `${account.session.activeCount} active session${account.session.activeCount === 1 ? '' : 's'}`
    : `No active sessions${account.session.lastSessionAt ? ` · Last session ${new Date(account.session.lastSessionAt).toLocaleString()}` : ''}`;
  const canManageAccount = !account.isOwner && (!account.isAdmin || isOwner);
  return (
    <article className="space-y-4 rounded-lg border border-[#e4e4e7] p-4 dark:border-[#3f3f46]">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="font-medium text-[#18181b] dark:text-[#fafafa]">{account.name}</h3>
          <p className="break-words text-sm text-[#71717a] dark:text-[#a1a1aa]">@{account.username || 'No username'} · {account.email} · Employee ID: {account.employeeId || 'Not linked'}</p>
          <p className="text-xs text-[#71717a] dark:text-[#a1a1aa]">{sessionText}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${account.isActive ? 'bg-[#f4f4f5] text-[#3f3f46] dark:bg-[#27272a] dark:text-[#d4d4d8]' : 'bg-[#fef2f2] text-[#991b1b] dark:bg-[#450a0a] dark:text-[#fecaca]'}`}>{account.isActive ? 'Active' : 'Inactive'}</span>
          {account.isOwner && <span className="rounded-full bg-[#f4f4f5] px-2.5 py-1 text-xs font-medium text-[#52525b] dark:bg-[#27272a] dark:text-[#d4d4d8]">Owner</span>}
          {account.isAdmin && !account.isOwner && <span className="rounded-full bg-[#f4f4f5] px-2.5 py-1 text-xs font-medium text-[#52525b] dark:bg-[#27272a] dark:text-[#d4d4d8]">Administrator</span>}
        </div>
      </header>
      {!account.isAdmin && <fieldset className="min-w-0 border-t border-[#e4e4e7] pt-3 dark:border-[#3f3f46]">
        <legend className="text-sm font-medium text-[#52525b] dark:text-[#d4d4d8]">Assigned production access</legend>
        <ModuleSelector modules={account.availableModules} selected={draft} onChange={onModulesChange} />
      </fieldset>}
      <div className="flex flex-wrap justify-end gap-2">
        {isOwner && !account.isOwner && <button className="inline-flex h-9 items-center justify-center rounded-md border border-[#e4e4e7] bg-white px-3 text-sm font-medium text-[#18181b] hover:bg-[#f4f4f5] disabled:pointer-events-none disabled:opacity-50 dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#fafafa] dark:hover:bg-[#27272a]" disabled={saving} onClick={onToggleAdmin}>{account.isAdmin ? 'Remove admin role' : 'Make administrator'}</button>}
        {!account.isAdmin && <button className="inline-flex h-9 items-center justify-center rounded-md border border-[#e4e4e7] bg-white px-3 text-sm font-medium text-[#18181b] hover:bg-[#f4f4f5] disabled:pointer-events-none disabled:opacity-50 dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#fafafa] dark:hover:bg-[#27272a]" disabled={saving || !account.isActive} onClick={onSaveModules}>Save modules</button>}
        {canManageAccount && <button className="inline-flex h-9 items-center justify-center rounded-md border border-[#e4e4e7] bg-white px-3 text-sm font-medium text-[#18181b] hover:bg-[#f4f4f5] disabled:pointer-events-none disabled:opacity-50 dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#fafafa] dark:hover:bg-[#27272a]" disabled={saving} onClick={onToggleReset}>{resetOpen ? 'Cancel password reset' : 'Reset password'}</button>}
        {canManageAccount && <button className={`inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium disabled:pointer-events-none disabled:opacity-50 ${account.isActive ? 'border border-[#fecaca] bg-white text-[#b91c1c] hover:bg-[#fef2f2] dark:border-[#7f1d1d] dark:bg-[#18181b] dark:text-[#fecaca] dark:hover:bg-[#450a0a]' : 'bg-[#18181b] text-white hover:bg-[#27272a] dark:bg-[#fafafa] dark:text-[#18181b] dark:hover:bg-[#e4e4e7]'}`} disabled={saving} onClick={onToggleActive}>{account.isActive ? 'Deactivate user' : 'Reactivate user'}</button>}
      </div>
      {resetOpen && <form className="grid gap-3 rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-4 dark:border-[#3f3f46] dark:bg-[#202024] sm:grid-cols-[minmax(0,_1fr)_auto]" onSubmit={onResetPassword}>
        <Input label={`New temporary password for ${account.name}`} name="temporaryPassword" type="password" minLength="8" maxLength="128" placeholder="Enter a new password" help="Resetting signs the user out of every active session." />
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-[#18181b] px-4 text-sm font-medium text-white hover:bg-[#27272a] disabled:pointer-events-none disabled:opacity-50 dark:bg-[#fafafa] dark:text-[#18181b] dark:hover:bg-[#e4e4e7]" disabled={saving}>{saving ? 'Resetting…' : 'Save new password'}</button>
      </form>}
    </article>
  );
}
