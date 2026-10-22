import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authClient } from '../../../lib/auth-client.js';
import { systemApi } from '../../../lib/system-api.js';
import SecurityContent from './security-content.js';

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
    try { setSessions(await systemApi.listSessions()); setError(''); }
    catch (loadError) { setError(loadError.message || 'Could not load active sessions.'); }
    finally { setLoading(false); }
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
    setSaving(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, revokeOtherSessions: true }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Could not change the password.');
      formElement.reset();
      setMessage('Password changed. Other active sessions have been signed out.');
      await reload();
    } catch (saveError) { setError(saveError.message || 'Could not change the password.'); }
    finally { setSaving(false); }
  }

  async function revokeSession(item) {
    setSaving(true); setError('');
    try {
      await systemApi.revokeSession(item.id);
      if (item.isCurrent) { await authClient.signOut(); navigate('/go', { replace: true }); return; }
      setMessage('Selected session was signed out.');
      await reload();
    } catch (revokeError) { setError(revokeError.message || 'Could not revoke this session.'); }
    finally { setSaving(false); }
  }

  if (isPending) return <div className="min-h-[60vh] grid place-content-center text-center text-[#718078] text-[13px] font-['DM_Mono'] [&_span]:text-[#91aa55] [&_span]:text-[22px] [&_span]:mt-[10px]">Checking your account…</div>;
  if (!session?.user) return <Navigate to="/go" replace />;
  return <SecurityContent error={error} message={message} saving={saving} sessions={sessions} loading={loading} onPasswordChange={changePassword} onRefresh={reload} onRevoke={revokeSession} />;
}
