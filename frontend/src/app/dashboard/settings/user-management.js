import ManagedUserCard from './managed-user-card.js';

export default function UserManagement({ data, users, drafts, searchInput, searchTerm, saving, isOwner, resetPasswordUser, onReload, onSearchInput, onSearch, onClear, onDraftChange, onSaveModules, onToggleActive, onToggleAdmin, onToggleReset, onResetPassword }) {
  return (
    <section className="space-y-4 rounded-xl border border-[#e4e4e7] bg-white p-6 shadow-sm dark:border-[#27272a] dark:bg-[#18181b] max-[640px]:p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight text-[#18181b] dark:text-[#fafafa]">Manage users</h2>
          <p className="text-sm leading-6 text-[#71717a] dark:text-[#a1a1aa]">Search accounts, update production access, or manage account status.</p>
        </div>
        <button className="inline-flex h-9 items-center justify-center rounded-md border border-[#e4e4e7] bg-white px-3 text-sm font-medium text-[#18181b] hover:bg-[#f4f4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a1a1aa] dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#fafafa] dark:hover:bg-[#27272a]" onClick={onReload}>Refresh ↻</button>
      </header>
      <form className="flex flex-wrap items-center gap-2" onSubmit={onSearch}>
        <input className="h-9 min-w-[180px] flex-1 rounded-md border border-[#e4e4e7] bg-white px-3 text-sm text-[#18181b] outline-none placeholder:text-[#a1a1aa] focus-visible:border-[#a1a1aa] dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#fafafa] dark:placeholder:text-[#71717a]" aria-label="Search users" value={searchInput} onChange={(event) => onSearchInput(event.target.value)} placeholder="Search name, username, email, or employee ID" />
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-[#18181b] px-4 text-sm font-medium text-white hover:bg-[#27272a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a1a1aa] dark:bg-[#fafafa] dark:text-[#18181b] dark:hover:bg-[#e4e4e7]" type="submit">Search</button>
        {searchTerm && <button className="inline-flex h-9 items-center justify-center rounded-md border border-[#e4e4e7] bg-white px-3 text-sm font-medium text-[#18181b] hover:bg-[#f4f4f5] dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#fafafa] dark:hover:bg-[#27272a]" type="button" onClick={onClear}>Clear</button>}
      </form>
      {!data ? <p className="py-8 text-center text-sm text-[#71717a] dark:text-[#a1a1aa]">Loading users…</p> : !users.length ? <div className="rounded-lg border border-dashed border-[#e4e4e7] py-8 text-center dark:border-[#3f3f46]"><strong className="text-sm font-medium text-[#18181b] dark:text-[#fafafa]">No matching users</strong><p className="mt-1 text-sm text-[#71717a] dark:text-[#a1a1aa]">Try another name, username, email, or employee ID.</p></div> : users.map((account) => (
        <ManagedUserCard key={account.id} account={{ ...account, availableModules: data.modules || [] }} draft={drafts[account.id] || []} resetOpen={resetPasswordUser === account.id} saving={saving} isOwner={isOwner}
          onModulesChange={(key) => onDraftChange(account.id, drafts[account.id] || [], key)} onSaveModules={() => onSaveModules(account)} onToggleActive={() => onToggleActive(account)}
          onToggleAdmin={() => onToggleAdmin(account)} onToggleReset={() => onToggleReset(account.id)} onResetPassword={(event) => onResetPassword(event, account)} />
      ))}
    </section>
  );
}
