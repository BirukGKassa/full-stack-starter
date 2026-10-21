import ManagedUserCard from './managed-user-card.js';

export default function UserManagement({ data, users, drafts, searchInput, searchTerm, saving, resetPasswordUser, onReload, onSearchInput, onSearch, onClear, onDraftChange, onSaveModules, onToggleActive, onToggleReset, onResetPassword }) {
  return (
    <section className="prod-card prod-user-management">
      <div className="prod-card-heading"><div><h2>Assign modules and manage users</h2><p>Search for a registered user, update their module access, or manage their account.</p></div><button className="prod-text-button" onClick={onReload}>Refresh ↻</button></div>
      <form className="prod-user-search" onSubmit={onSearch}>
        <input aria-label="Search users" value={searchInput} onChange={(event) => onSearchInput(event.target.value)} placeholder="Search name, username, email, or employee ID" />
        <button className="prod-button prod-button-primary prod-search-button" type="submit">Search users</button>
        {searchTerm && <button className="prod-button prod-button-outline prod-search-button" type="button" onClick={onClear}>Clear</button>}
      </form>
      {!data ? <div className="prod-loading">Loading users…</div> : !users.length ? <div className="prod-empty"><strong>No matching users</strong><p>Try another name, username, email, or employee ID.</p></div> : users.map((account) => (
        <ManagedUserCard key={account.id} account={{ ...account, availableModules: data.modules || [] }} draft={drafts[account.id] || []} resetOpen={resetPasswordUser === account.id} saving={saving}
          onModulesChange={(key) => onDraftChange(account.id, drafts[account.id] || [], key)} onSaveModules={() => onSaveModules(account)} onToggleActive={() => onToggleActive(account)}
          onToggleReset={() => onToggleReset(account.id)} onResetPassword={(event) => onResetPassword(event, account)} />
      ))}
    </section>
  );
}
