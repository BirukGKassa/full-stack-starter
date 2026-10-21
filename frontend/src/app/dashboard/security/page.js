import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authClient } from '../../../lib/auth-client.js';
import { systemApi } from '../../../lib/system-api.js';
import { Input } from '../../production/components/ui.js';

function describeDevice(userAgent) {
  if (!userAgent) return 'Unknown browser or device';
  if (/Windows/i.test(userAgent)) return `Windows · ${userAgent.split(' ').slice(-2).join(' ')}`;
  if (/Mac OS|Macintosh/i.test(userAgent)) return 'Mac';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/iPhone|iPad/i.test(userAgent)) return 'iPhone / iPad';
  if (/Linux/i.test(userAgent)) return 'Linux';
  return userAgent.slice(0, 100);
}

export default function SecurityPage() {
  const { data: session, isPending } = authClient.useSession();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function reload() {
    setLoading(true);
    try {
      setSessions(await systemApi.listSessions());
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'Could not load active sessions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (session?.user) reload(); }, [session?.user?.id]);

  async function changePassword(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const currentPassword = String(form.get('currentPassword'));
    const newPassword = String(form.get('newPassword'));
    if (newPassword !== String(form.get('confirmPassword'))) {
      setError('New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, revokeOtherSessions: true }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Could not change the password.');
      formElement.reset();
      setMessage('Password changed. Other active sessions have been signed out.');
      await reload();
    } catch (saveError) {
      setError(saveError.message || 'Could not change the password.');
    } finally {
      setSaving(false);
    }
  }

  async function revokeSession(item) {
    setSaving(true);
    setError('');
    try {
      await systemApi.revokeSession(item.id);
      if (item.isCurrent) {
        await authClient.signOut();
        navigate('/go', { replace: true });
        return;
      }
      setMessage('Selected session was signed out.');
      await reload();
    } catch (revokeError) {
      setError(revokeError.message || 'Could not revoke this session.');
    } finally {
      setSaving(false);
    }
  }

  if (isPending) return <div className="page-loading">Checking your account…</div>;
  if (!session?.user) return <Navigate to="/go" replace />;

  return (
    <main className="erp-dashboard erp-system-page">
      <div className="erp-dashboard-top">
        <div><p className="prod-eyebrow">LYU ERP · ACCOUNT SECURITY</p><p>Protect your account and devices</p></div>
        <Link className="prod-button prod-button-outline" to="/dashboard">← Dashboard</Link>
      </div>
      <div className="prod-page-heading"><p className="prod-eyebrow">YOUR ACCOUNT</p><h1>Password and sessions</h1><p>Update your password and sign out sessions you do not recognize.</p></div>
      {error && <section className="prod-card prod-api-warning" role="alert"><strong>Action could not be completed</strong><p>{error}</p></section>}
      {message && <section className="prod-card prod-security-success" role="status">{message}</section>}
      <div className="flex w-full gap-4">
        
      <section className="prod-card flex-1">
        <div className="prod-card-heading"><div><h2>Change password</h2><p>Changing your password will revoke other signed-in sessions.</p></div></div>
        <form className="prod-form-grid" onSubmit={changePassword}>
          <Input label="Current password" name="currentPassword" type="password" autoComplete="current-password" />
          <Input label="New password" name="newPassword" type="password" minLength="12" maxLength="128" autoComplete="new-password" help="Use at least 12 characters." />
          <Input label="Confirm new password" name="confirmPassword" type="password" minLength="12" maxLength="128" autoComplete="new-password" />
          <button className="prod-button prod-button-primary prod-field-wide" disabled={saving}>{saving ? 'Updating…' : 'Change password'}</button>
        </form>
      </section>
      <section className="prod-card flex-1">
        <div className="prod-card-heading"><div><h2>Your active sessions</h2><p>Sign out a session on another browser or device. Your current device is marked.</p></div><button className="prod-text-button" onClick={reload}>Refresh ↻</button></div>
        {loading ? <div className="prod-loading">Loading sessions…</div> : !sessions.length ? <div className="prod-empty"><strong>No active sessions</strong></div> : sessions.map((item) => (
          <article className="prod-session-row" key={item.id}>
            <div><strong>{describeDevice(item.userAgent)} {item.isCurrent && <span className="prod-pill prod-pill-green">Current device</span>}</strong><small>Last active {new Date(item.updatedAt).toLocaleString()} · Expires {new Date(item.expiresAt).toLocaleString()}</small><small>{item.ipAddress || 'IP address unavailable'}</small></div>
            <button className="prod-button prod-button-outline" disabled={saving} onClick={() => revokeSession(item)}>{item.isCurrent ? 'Sign out this device' : 'Sign out session'}</button>
          </article>
        ))}
      </section>
      </div>
    </main>
  );
}
