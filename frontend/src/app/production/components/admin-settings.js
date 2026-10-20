import { useEffect, useState } from 'react';
import { productionApi } from '../../../lib/production-api.js';
import { Input } from './ui.js';

export default function AdminSettings({ onNotify }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [newModules, setNewModules] = useState(['production']);
  const [drafts, setDrafts] = useState({});

  const reload = async () => {
    try {
      const result = await productionApi.listUsers();
      setData(result);
      setDrafts(Object.fromEntries(result.users.map((user) => [
        user.id,
        result.assignments.filter((assignment) => assignment.userId === user.id).map((assignment) => assignment.moduleKey),
      ])));
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'Could not load user settings.');
    }
  };

  useEffect(() => { reload(); }, []);

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
        email: String(form.get('email')).trim(),
        temporaryPassword: String(form.get('temporaryPassword')),
        modules: newModules,
      });
      formElement.reset();
      setNewModules(['production']);
      onNotify({ kind: 'success', message: 'User account created and module assignments saved.' });
      await reload();
    } catch (saveError) {
      onNotify({ kind: 'error', message: saveError.message || 'Could not create account.' });
    } finally {
      setSaving(false);
    }
  }

  async function saveAssignments(user) {
    setSaving(true);
    try {
      await productionApi.updateUserModules(user.id, drafts[user.id] || []);
      onNotify({ kind: 'success', message: `Assignments updated for ${user.name}.` });
      await reload();
    } catch (saveError) {
      onNotify({ kind: 'error', message: saveError.message || 'Could not update user modules.' });
    } finally {
      setSaving(false);
    }
  }

  const renderModules = (modules, setter) => (
    <div className="prod-module-checks">
      {(data?.modules || []).map((module) => <label key={module.key}><input type="checkbox" checked={modules.includes(module.key)} onChange={() => toggleModule(modules, setter, module.key)} /><span>{module.label}</span></label>)}
    </div>
  );

  return (
    <div className="prod-admin-settings">
      <div className="prod-page-heading"><p className="prod-eyebrow">ADMINISTRATION · ACCESS CONTROL</p><h1>System settings</h1><p>Create accounts and assign only the production modules each user needs.</p></div>
      <section className="prod-card">
        <div className="prod-card-heading"><div><h2>Create a user</h2><p>Set a temporary password and share it securely with the user. They can sign in immediately.</p></div></div>
        <form className="prod-form-grid" onSubmit={createUser}>
          <Input label="Full name" name="name" />
          <Input label="Email address" name="email" type="email" />
          <Input label="Temporary password" name="temporaryPassword" type="password" minLength="8" maxLength="128" help="8–128 characters. This value is never stored in the Lyu ERP interface." />
          <div className="prod-field prod-field-wide"><span>Assigned modules</span>{renderModules(newModules, setNewModules)}</div>
          <button className="prod-button prod-button-primary prod-field-wide" disabled={saving || newModules.length === 0}>{saving ? 'Saving…' : 'Create account and assign modules'}</button>
        </form>
      </section>
      {error && <section className="prod-card prod-api-warning"><strong>Unable to load users</strong><p>{error}</p><button className="prod-text-button" onClick={reload}>Try again</button></section>}
      <section className="prod-card prod-user-management">
        <div className="prod-card-heading"><div><h2>User access</h2><p>Changes take effect the next time a user opens a production page.</p></div><button className="prod-text-button" onClick={reload}>Refresh ↻</button></div>
        {!data ? <div className="prod-loading">Loading users…</div> : data.users.map((user) => (
          <article className="prod-managed-user" key={user.id}>
            <div className="prod-managed-user-heading"><div><strong>{user.name}</strong><small>{user.email} · Joined {new Date(user.createdAt).toLocaleDateString()}</small></div><span className="prod-pill prod-pill-blue">{(drafts[user.id] || []).length} modules</span></div>
            <div className="prod-field"><span>Module access</span>{renderModules(drafts[user.id] || [], (next) => setDrafts((current) => ({ ...current, [user.id]: next })))}</div>
            <div className="prod-managed-actions"><button className="prod-button prod-button-outline" disabled={saving} onClick={() => saveAssignments(user)}>Save assignments</button></div>
          </article>
        ))}
      </section>
      <section className="prod-card prod-security-note"><strong>Administrator bootstrap</strong><p>Administrator access is restricted to email addresses listed in the server-only <code>LYU_ADMIN_EMAILS</code> setting. Add your trusted admin email there and restart the backend; do not grant admin rights from a browser form.</p><p>Users with no module assignments can sign in, but cannot open production APIs or view factory data.</p></section>
    </div>
  );
}
