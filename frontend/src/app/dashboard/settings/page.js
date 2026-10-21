import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { authClient } from '../../../lib/auth-client.js';
import { productionApi } from '../../../lib/production-api.js';
import Brand from '../../components/brand.js';
import { Input } from '../../production/components/ui.js';

export default function AdminSettings() {
  const { data: session, isPending } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [newModules, setNewModules] = useState(['production']);
  const [drafts, setDrafts] = useState({});
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [resetPasswordUser, setResetPasswordUser] = useState(null);

  const reload = async () => {
    try {
      const result = await productionApi.listUsers();
      setData(result);
      setDrafts(Object.fromEntries(result.users.map((account) => [
        account.id,
        result.assignments.filter((assignment) => assignment.userId === account.id).map((assignment) => assignment.moduleKey),
      ])));
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'Could not load user settings.');
    }
  };

  useEffect(() => {
    let active = true;
    productionApi.getAccess()
      .then((access) => {
        if (active) setIsAdmin(Boolean(access.user?.isAdmin));
      })
      .catch((accessError) => {
        if (active) setError(accessError.message || 'Could not verify administrator access.');
      })
      .finally(() => {
        if (active) setCheckingAccess(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (isAdmin) reload();
  }, [isAdmin]);

  const visibleUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data?.users || [];
    return (data?.users || []).filter((account) => [
      account.name, account.username, account.email, account.employeeId,
    ].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [data, searchTerm]);

  function toggleModule(modules, setter, key) {
    setter(modules.includes(key) ? modules.filter((module) => module !== key) : [...modules, key]);
  }

  async function createUser(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSaving(true);
    const form = new FormData(formElement);
    try {
      await productionApi.createUser({
        name: String(form.get('name')).trim(),
        username: String(form.get('username')).trim(),
        email: String(form.get('email')).trim(),
        employeeId: String(form.get('employeeId')).trim(),
        temporaryPassword: String(form.get('temporaryPassword')),
        modules: newModules,
      });
      formElement.reset();
      setNewModules(['production']);
      setToast({ kind: 'success', message: 'User created and assigned to the selected modules.' });
      await reload();
    } catch (saveError) {
      setToast({ kind: 'error', message: saveError.message || 'Could not create account.' });
    } finally {
      setSaving(false);
    }
  }

  async function saveAssignments(account) {
    setSaving(true);
    try {
      await productionApi.updateUserModules(account.id, drafts[account.id] || []);
      setToast({ kind: 'success', message: `Module assignments updated for ${account.name}.` });
      await reload();
    } catch (saveError) {
      setToast({ kind: 'error', message: saveError.message || 'Could not update user modules.' });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(account) {
    setSaving(true);
    try {
      await productionApi.setUserActive(account.id, !account.isActive);
      setToast({ kind: 'success', message: account.isActive ? `${account.name} has been deactivated.` : `${account.name} has been reactivated.` });
      await reload();
    } catch (saveError) {
      setToast({ kind: 'error', message: saveError.message || 'Could not update account status.' });
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword(event, account) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await productionApi.resetUserPassword(account.id, String(form.get('temporaryPassword')));
      setResetPasswordUser(null);
      setToast({ kind: 'success', message: `Password reset for ${account.name}. All existing sessions were signed out.` });
      await reload();
    } catch (saveError) {
      setToast({ kind: 'error', message: saveError.message || 'Could not reset password.' });
    } finally {
      setSaving(false);
    }
  }

  const renderModules = (modules, setter) => {
    const groups = (data?.modules || []).reduce((result, module) => {
      const group = module.group || 'ERP modules';
      result[group] ||= [];
      result[group].push(module);
      return result;
    }, {});
    return <div className="prod-assignment-groups">{Object.entries(groups).map(([group, items]) => (
      <fieldset className="prod-assignment-group" key={group}>
        <legend>{group}</legend>
        <div className="prod-module-checks">{items.map((module) => (
          <label key={module.key}>
            <input type="checkbox" checked={modules.includes(module.key)} onChange={() => toggleModule(modules, setter, module.key)} />
            <span>{module.label}</span>
          </label>
        ))}</div>
      </fieldset>
    ))}</div>;
  };

  if (isPending || checkingAccess) return <div className="page-loading">Checking administrator access…</div>;
  if (!session?.user) return <Navigate to="/go?mode=signin" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <main className="erp-dashboard erp-settings-page">
      <div className="erp-dashboard-top">
        <div><Brand /><p className="prod-eyebrow">LYU ERP · ADMINISTRATION</p><p>System access and accounts</p></div>
        <Link className="prod-button prod-button-outline" to="/dashboard">← Dashboard</Link>
      </div>
      <div className="prod-admin-settings">
        <div className="prod-page-heading">
          <p className="prod-eyebrow">ADMINISTRATION · ACCESS CONTROL</p>
          <h1>System settings</h1>
          <p>Create accounts, assign production modules, and manage account access.</p>
        </div>

        <section className="prod-card">
          <div className="prod-card-heading"><div><h2>Create a user</h2><p>Assign one or more modules now, or find the user below to assign modules later.</p></div></div>
          <form className="prod-form-grid" onSubmit={createUser}>
            <Input label="Full name" name="name" />
            <Input label="Employee ID" name="employeeId" placeholder="Optional · link to employee record" required={false} maxLength="50" />
            <Input label="Username" name="username" placeholder="first.last" minLength="3" maxLength="30" help="Used to sign in; letters, numbers, dots, and underscores only." />
            <Input label="Email address" name="email" type="email" />
            <Input label="Temporary password" name="temporaryPassword" type="password" minLength="8" maxLength="128" help="8–128 characters. Share it securely with the user." />
            <div className="prod-field prod-field-wide"><span>Assign production modules</span>{renderModules(newModules, setNewModules)}</div>
            <button className="prod-button prod-button-primary prod-field-wide" disabled={saving || newModules.length === 0}>{saving ? 'Saving…' : 'Create account'}</button>
          </form>
        </section>

        {error && <section className="prod-card prod-api-warning"><strong>Unable to load users</strong><p>{error}</p><button className="prod-text-button" onClick={reload}>Try again</button></section>}

        <section className="prod-card prod-user-management">
          <div className="prod-card-heading">
            <div><h2>Assign modules and manage users</h2><p>Search for a registered user, update their module access, or manage their account.</p></div>
            <button className="prod-text-button" onClick={reload}>Refresh ↻</button>
          </div>
          <form className="prod-user-search" onSubmit={(event) => { event.preventDefault(); setSearchTerm(searchInput); }}>
            <input aria-label="Search users" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search name, username, email, or employee ID" />
            <button className="prod-button prod-button-primary prod-search-button" type="submit">Search users</button>
            {searchTerm && <button className="prod-button prod-button-outline prod-search-button" type="button" onClick={() => { setSearchInput(''); setSearchTerm(''); }}>Clear</button>}
          </form>
          {!data ? <div className="prod-loading">Loading users…</div> : visibleUsers.length === 0 ? (
            <div className="prod-empty"><strong>No matching users</strong><p>Try another name, username, email, or employee ID.</p></div>
          ) : visibleUsers.map((account) => (
            <article className="prod-managed-user" key={account.id}>
              <div className="prod-managed-user-heading">
                <div className="prod-managed-identity">
                  <strong>{account.name}</strong>
                  <small>@{account.username || 'No username'} · {account.email} · Employee ID: {account.employeeId || 'Not linked'}</small>
                  <span className="prod-user-session">
                    {account.session.activeCount > 0
                      ? `${account.session.activeCount} active session${account.session.activeCount === 1 ? '' : 's'}`
                      : `No active sessions${account.session.lastSessionAt ? ` · Last session ${new Date(account.session.lastSessionAt).toLocaleString()}` : ''}`}
                  </span>
                </div>
                <span className={`prod-user-status ${account.isActive ? 'prod-user-status-active' : 'prod-user-status-inactive'}`}>
                  {account.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="prod-field prod-assignment-field">
                <span>Assigned modules</span>
                {renderModules(drafts[account.id] || [], (next) => setDrafts((current) => ({ ...current, [account.id]: next })))}
              </div>
              <div className="prod-managed-actions">
                <button className="prod-button prod-button-outline" disabled={saving || !account.isActive} onClick={() => saveAssignments(account)}>Save modules</button>
                <button className="prod-button prod-button-outline" disabled={saving} onClick={() => setResetPasswordUser(resetPasswordUser === account.id ? null : account.id)}>
                  {resetPasswordUser === account.id ? 'Cancel password reset' : 'Reset password'}
                </button>
                <button className={`prod-button ${account.isActive ? 'prod-button-danger' : 'prod-button-primary'}`} disabled={saving} onClick={() => toggleActive(account)}>
                  {account.isActive ? 'Deactivate user' : 'Reactivate user'}
                </button>
              </div>
              {resetPasswordUser === account.id && (
                <form className="prod-reset-password" onSubmit={(event) => resetPassword(event, account)}>
                  <Input label={`New temporary password for ${account.name}`} name="temporaryPassword" type="password" minLength="8" maxLength="128" placeholder="Enter a new password" help="Resetting signs the user out of every active session." />
                  <button className="prod-button prod-button-primary" disabled={saving}>{saving ? 'Resetting…' : 'Save new password'}</button>
                </form>
              )}
            </article>
          ))}
        </section>
        <section className="prod-card prod-security-note"><strong>Administrator bootstrap</strong><p>Administrator access is restricted to email addresses listed in the server-only <code>LYU_ADMIN_EMAILS</code> setting. Add your trusted admin email there and restart the backend; do not grant admin rights from a browser form.</p><p>Inactive users are signed out and blocked from Production. Their module assignments remain saved if the account is reactivated.</p></section>
      </div>
      {toast && <div className={`prod-toast prod-toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}><span>{toast.kind === 'success' ? '✓' : '!'}</span><p>{toast.message}</p><button onClick={() => setToast(null)} aria-label="Dismiss notification">×</button></div>}
    </main>
  );
}
