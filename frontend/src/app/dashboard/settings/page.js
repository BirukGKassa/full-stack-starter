import { Navigate } from 'react-router-dom';
import { authClient } from '../../../lib/auth-client.js';
import useAdminSettings from './use-admin-settings.js';
import useAdminSettingsActions from './use-admin-settings-actions.js';
import SettingsContent from './settings-content.js';

export default function AdminSettings() {
  const { data: session, isPending } = authClient.useSession();
  const state = useAdminSettings();
  const actions = useAdminSettingsActions(state);
  if (isPending || state.checkingAccess) return <div className="min-h-[60vh] grid place-content-center text-center text-[#718078] text-[13px] font-['DM_Mono'] [&_span]:text-[#91aa55] [&_span]:text-[22px] [&_span]:mt-[10px]">Checking administrator access…</div>;
  if (!session?.user) return <Navigate to="/go?mode=signin" replace />;
  if (!state.isAdmin) return <Navigate to="/dashboard" replace />;
  return (
    <main className="group/erp-dashboard w-[100%] min-h-[100vh] m-0 p-[28px_clamp(18px,_3vw,_48px)_30px] max-[760px]:pt-[18px] px-[15px] pb-6 dark:text-[#dce7de] group/erp-settings-page">
      <SettingsContent state={state} actions={actions} />
      {state.toast && <div className={`fixed z-20 right-[22px] bottom-[22px] w-[min(390px,_calc(100vw_-_30px))] flex items-center gap-2.5 py-3 px-[13px] border border-[#cfe0ca] rounded-lg bg-[#fbfff8] shadow-[0_12px_40px_#19382421] [&_>_span]:w-[23px] [&_>_span]:h-[23px] [&_>_span]:grid [&_>_span]:flex-[0_0_auto] [&_>_span]:place-items-center [&_>_span]:rounded-full [&_>_span]:bg-[#e6f2df] [&_>_span]:text-[#4c7948] [&_>_span]:font-bold [&_p]:flex-1 [&_p]:m-0 [&_p]:text-[#3d5943] [&_p]:text-[10px] [&_p]:leading-[1.5] [&_button]:border-0 [&_button]:bg-[none] [&_button]:text-[#839185] [&_button]:text-lg [&_button]:cursor-pointer dark:border-[#3b563e] dark:bg-[#1b2b20] dark:[&_p]:text-[#c8dcc8] ${state.toast.kind === 'error' ? 'border-[#efcfc5] bg-[#fff9f6] [&_>_span]:bg-[#f8e6df] [&_>_span]:text-[#ac5844] [&_p]:text-[#854e41] dark:border-[#634239] dark:bg-[#30221e] dark:[&_p]:text-[#e6b9aa]' : ''}`} role={state.toast.kind === 'error' ? 'alert' : 'status'}>
        <span>{state.toast.kind === 'success' ? '✓' : '!'}</span><p>{state.toast.message}</p>
        <button onClick={() => state.setToast(null)} aria-label="Dismiss notification">×</button>
      </div>}
    </main>
  );
}
