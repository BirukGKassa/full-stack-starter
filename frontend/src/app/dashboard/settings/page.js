import { Navigate } from 'react-router-dom';
import { authClient } from '../../../lib/auth-client.js';
import useAdminSettings from './use-admin-settings.js';
import useAdminSettingsActions from './use-admin-settings-actions.js';
import SettingsContent from './settings-content.js';

export default function AdminSettings() {
  const { data: session, isPending } = authClient.useSession();
  const state = useAdminSettings();
  const actions = useAdminSettingsActions(state);
  if (isPending || state.checkingAccess) return <div className="page-loading">Checking administrator access…</div>;
  if (!session?.user) return <Navigate to="/go?mode=signin" replace />;
  if (!state.isAdmin) return <Navigate to="/dashboard" replace />;
  return (
    <main className="erp-dashboard erp-settings-page">
      <SettingsContent state={state} actions={actions} />
      {state.toast && <div className={`prod-toast prod-toast-${state.toast.kind}`} role={state.toast.kind === 'error' ? 'alert' : 'status'}>
        <span>{state.toast.kind === 'success' ? '✓' : '!'}</span><p>{state.toast.message}</p>
        <button onClick={() => state.setToast(null)} aria-label="Dismiss notification">×</button>
      </div>}
    </main>
  );
}
