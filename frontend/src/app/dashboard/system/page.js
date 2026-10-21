import { Navigate } from 'react-router-dom';
import { authClient } from '../../../lib/auth-client.js';
import SystemAdminContent from './system-admin-content.js';
import useSystemAdmin from './use-system-admin.js';
import useSystemAdminActions from './use-system-admin-actions.js';

export default function SystemAdminPage() {
  const { data: session, isPending } = authClient.useSession();
  const state = useSystemAdmin();
  const actions = useSystemAdminActions(state);
  if (isPending || state.checking) return <div className="page-loading">Checking administrator access…</div>;
  if (!session?.user) return <Navigate to="/go" replace />;
  if (!state.isAdmin) return <Navigate to="/dashboard" replace />;
  return (
    <main className="erp-dashboard erp-system-page">
      <SystemAdminContent state={state} actions={actions} />
      {state.toast && <div className={`prod-toast prod-toast-${state.toast.kind}`} role={state.toast.kind === 'error' ? 'alert' : 'status'}>
        <span>{state.toast.kind === 'success' ? '✓' : '!'}</span><p>{state.toast.message}</p>
        <button onClick={() => state.setToast(null)} aria-label="Dismiss notification">×</button>
      </div>}
    </main>
  );
}
