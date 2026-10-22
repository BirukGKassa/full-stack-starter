import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authClient } from '../../lib/auth-client.js';
import { productionApi } from '../../lib/production-api.js';
import Brand from '../components/brand.js';

const modules = [
  { key: 'production', title: 'Production', detail: 'Production overview, plans, quality, and operations', icon: '◫', fallback: ['downtime', 'products', 'orders', 'machines', 'overview', 'quality', 'reports'] },
];

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [access, setAccess] = useState(null);
  const [system, setSystem] = useState(null);
  const [systemState, setSystemState] = useState('loading');
  const [systemError, setSystemError] = useState('');
  const [accessError, setAccessError] = useState('');
  const [signOutError, setSignOutError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!session?.user) return;
    productionApi.getAccess().then(setAccess).catch((error) => setAccessError(error.message));
    const refreshSystem = () => fetch('/api/public/system', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`System information unavailable (${response.status})`)))
      .then((result) => { setSystem(result); setSystemState('ready'); setSystemError(''); })
      .catch((error) => { console.error('Could not refresh system status:', error); setSystemState('error'); setSystemError(error.message); });
    refreshSystem();
    const timer = window.setInterval(refreshSystem, 10 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [session?.user]);

  const visibleModules = useMemo(() => modules.filter((module) => access?.user?.isAdmin
    || access?.modules?.includes(module.key)
    || module.fallback?.some((key) => access?.modules?.includes(key))), [access]);
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || 'there';
  const signOut = async () => {
    setSigningOut(true);
    setSignOutError('');
    try {
      await authClient.signOut();
      navigate('/', { replace: true });
    } catch (error) {
      setSignOutError(error.message || 'Could not sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  if (isPending) return <div className="min-h-[60vh] grid place-content-center text-center text-[#718078] text-[13px] font-['DM_Mono'] [&_span]:text-[#91aa55] [&_span]:text-[22px] [&_span]:mt-[10px]">Opening Lyu ERP<span>✳</span></div>;
  if (!session?.user) return <Navigate to="/go?mode=signin" replace />;
  if (systemState === 'loading') return <div className="min-h-[60vh] grid place-content-center text-center text-[#718078] text-[13px]">Checking workspace access…</div>;
  if (systemState === 'error') return <main className="min-h-screen grid content-center justify-items-center gap-3 p-6 text-center text-[#718078]"><h1 className="m-0 text-xl text-[#254b37]">Workspace access could not be verified</h1><p>{systemError}</p><button className="rounded-lg bg-[#174835] px-4 py-2 text-white" onClick={() => window.location.reload()}>Try again</button></main>;
  if (!system?.hasAdmin) return <main className="min-h-screen grid content-center justify-items-center gap-3 p-6 text-center text-[#718078]"><h1 className="m-0 text-xl text-[#254b37]">Workspace owner setup required</h1><p>No users can access the dashboard until the workspace owner is set up.</p>{system?.adminSetupLink ? <Link className="rounded-lg bg-[#174835] px-4 py-2 text-white no-underline" to={system.adminSetupLink}>Set up the owner account</Link> : <p>Ask your system administrator to configure the owner account.</p>}</main>;

  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  return (
    <main className="group/erp-dashboard mx-auto min-h-screen w-full max-w-7xl space-y-7 bg-background px-4 py-7 text-foreground sm:px-8">
      <div className="group/erp-dashboard-top flex items-center justify-between gap-[18px] pb-[16px] border-b border-b-[#e7ebe4] max-[760px]:items-start max-[760px]:flex-col dark:border-[#334237] [&_>_div:first-child_>_p:last-child]:text-[11px] [.group\/erp-system-page_&_>_div:last-child]:flex [.group\/erp-system-page_&_>_div:last-child]:gap-2 max-[760px]:[.group\/erp-system-page_&]:items-start max-[760px]:[.group\/erp-system-page_&]:flex-col max-[760px]:[.group\/erp-system-page_&_>_div:last-child]:flex-wrap">
        <div className="grid gap-[5px] [&_>_p:last-child]:text-[#89968d] [&_>_p:last-child]:text-[9px] dark:[&_>_p:last-child]:text-[#b0beb2]">
          <Brand />
          <p className="mt-0 mx-0 mb-2.5 text-[#829183] font-bold text-[9px] font-['DM_Mono',_monospace] tracking-[1px] [.group\/erp-dashboard-top_&]:m-0 text-[10px]">LYU ERP · BUSINESS OPERATIONS</p>
          <p>{system?.company?.companyName || 'Company workspace'} · {today}</p>
        </div>
        <div className="flex items-center justify-end flex-wrap gap-2.5 max-[760px]:w-[100%] max-[760px]:justify-start">
          {(access?.user?.isAdmin || system?.isAdmin) && <><Link to="/dashboard/settings" className="group/prod-button min-h-[37px] inline-flex items-center justify-center gap-[7px] py-0 px-3.5 border border-transparent rounded-[7px] text-[10px] font-bold cursor-pointer transition-[background,color,border] duration-150 [&:disabled]:opacity-[.55] [&:disabled]:cursor-wait [.group\/prod-modal-form_&]:justify-self-end max-[480px]:[.group\/prod-form-actions_&]:w-[100%] [.group\/prod-managed-actions_&]:min-h-[34px] [.group\/prod-managed-actions_&]:py-0 px-[11px] [.group\/prod-managed-actions_&]:rounded-lg [.group\/prod-managed-actions_&]:text-[10px] border-[#dfe6dd] bg-white text-[#52675a] [&:hover:not(:disabled)]:border-[#b8cdb0] [&:hover:not(:disabled)]:text-[#315b3a] dark:border-[#3a4a3e] dark:bg-[#1d2a22] dark:text-[#cad8cb] dark:[&:hover:not(:disabled)]:border-[#617c61] dark:[&:hover:not(:disabled)]:text-[#e0ecdb]">User access</Link><Link to="/dashboard/system" className="group/prod-button min-h-[37px] inline-flex items-center justify-center gap-[7px] py-0 px-3.5 border border-transparent rounded-[7px] text-[10px] font-bold cursor-pointer transition-[background,color,border] duration-150 [&:disabled]:opacity-[.55] [&:disabled]:cursor-wait [.group\/prod-modal-form_&]:justify-self-end max-[480px]:[.group\/prod-form-actions_&]:w-[100%] [.group\/prod-managed-actions_&]:min-h-[34px] [.group\/prod-managed-actions_&]:py-0 px-[11px] [.group\/prod-managed-actions_&]:rounded-lg [.group\/prod-managed-actions_&]:text-[10px] border-[#dfe6dd] bg-white text-[#52675a] [&:hover:not(:disabled)]:border-[#b8cdb0] [&:hover:not(:disabled)]:text-[#315b3a] dark:border-[#3a4a3e] dark:bg-[#1d2a22] dark:text-[#cad8cb] dark:[&:hover:not(:disabled)]:border-[#617c61] dark:[&:hover:not(:disabled)]:text-[#e0ecdb]">System console</Link></>}
          <details className="relative [&_>_summary]:min-h-[38px] [&_>_summary]:flex [&_>_summary]:items-center [&_>_summary]:gap-2 [&_>_summary]:pt-1 pr-2.5 pb-1 pl-[5px] [&_>_summary]:border border-[#e2e8df] [&_>_summary]:rounded-full [&_>_summary]:bg-[#fffefa] [&_>_summary]:text-[#536658] [&_>_summary]:text-[11px] [&_>_summary]:font-bold [&_>_summary]:list-none [&_>_summary]:cursor-pointer [&_>_summary::-webkit-details-marker]:hidden [&_>_summary_>_b]:text-[#89968d] [&_>_summary_>_b]:text-[13px] dark:[&_>_summary]:border-[#35463b] dark:[&_>_summary]:bg-[#19251e] dark:[&_>_summary]:text-[#d5e1d6]">
            <summary aria-label="Open account menu"><span className="w-[27px] h-[27px] grid place-items-center rounded-full bg-[#eaf1e5] text-[#3f6747] text-[11px] dark:bg-[#304535] dark:text-[#d0e5c4]">{session.user.name?.trim().charAt(0).toUpperCase() || 'U'}</span><span>{session.user.name}</span><b aria-hidden="true">⌄</b></summary>
            <div className="absolute z-30 top-[calc(100%_+_9px)] right-0 w-[min(290px,_calc(100vw_-_36px))] p-2 border border-[#e2e8df] rounded-xl bg-[#fffefa] shadow-[0_14px_36px_#172c201c] [&_a_small]:text-[#849187] [&_a_small]:text-[10px] [&_a]:w-[100%] [&_a]:grid [&_a]:grid-cols-[1fr_auto] [&_a]:items-center [&_a]:gap-[4px_8px] [&_a]:p-[11px] [&_a]:border-0 [&_a]:rounded-lg [&_a]:bg-transparent [&_a]:text-[#425b48] [&_a]:text-left [&_a]:no-underline [&_a]:font-semibold [&_a]:text-[11px] [&_a]:font-['DM_Sans',_sans-serif] [&_a]:cursor-pointer [&_button]:w-[100%] [&_button]:grid [&_button]:grid-cols-[1fr_auto] [&_button]:items-center [&_button]:gap-[4px_8px] [&_button]:p-[11px] [&_button]:border-0 [&_button]:rounded-lg [&_button]:bg-transparent [&_button]:text-[#425b48] [&_button]:text-left [&_button]:no-underline [&_button]:font-semibold [&_button]:text-[11px] [&_button]:font-['DM_Sans',_sans-serif] [&_button]:cursor-pointer [&_a:hover]:bg-[#f3f7f0] [&_button:hover:not(:disabled)]:bg-[#f3f7f0] [&_a_small]:col-span-full [&_a_small]:font-normal [&_a_span]:text-[#76906f] [&_button_span]:text-[#76906f] dark:border-[#35463b] dark:bg-[#19251e] dark:text-[#d5e1d6] dark:[&_a]:text-[#d5e1d6] dark:[&_button]:text-[#d5e1d6] dark:[&_a_small]:text-[#a1afa4] dark:[&_a:hover]:bg-[#26372b] dark:[&_button:hover:not(:disabled)]:bg-[#26372b]">
              <div className="grid gap-1 pt-2.5 px-[11px] pb-3 border-b border-b-[#edf0ea] [&_strong]:text-[#334b39] [&_strong]:text-xs [&_small]:text-[#849187] [&_small]:text-[10px] dark:border-[#35463b] dark:[&_strong]:text-[#d5e1d6] dark:[&_small]:text-[#a1afa4]"><strong>{session.user.name}</strong><small>{session.user.email}</small></div>
              <Link to="/dashboard/security">Account reset & security <span>↗</span><small>Change password and manage sessions</small></Link>
              <button type="button" onClick={signOut} disabled={signingOut}>{signingOut ? 'Signing out…' : 'Sign out'} <span>↗</span></button>
            </div>
          </details>
        </div>
      </div>
      {signOutError && <p className="m-0 text-[#a44b3f] bg-[#fbefeb] rounded-[5px] p-2.5 text-[11px]" role="alert">{signOutError}</p>}
      <section className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-6 max-[760px]:items-start"><div><span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{system?.company?.companyName || 'Lyu ERP workspace'}</span><h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">Welcome back, {firstName}.</h1><p className="mt-2 text-sm text-muted-foreground">Your company operations, teams, and assigned work in one secure system.</p></div>{visibleModules.some((item) => item.key === 'production') && <Link to="/production" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Open production <span>↗</span></Link>}</section>
      {system?.license && <section className={`min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] group/lyu-dashboard-license flex items-center justify-between gap-3.5 mt-0 mx-0 mb-5 [&_strong]:text-[#3f7046] [&_strong]:text-xs [&_p]:mt-1 mx-0 mb-0 [&_p]:text-[#718075] [&_p]:text-[10px] dark:[&_strong]:text-[#acd3a4] dark:[&_p]:text-[#b0beb3]${system.license.isActive ? '' : 'border-[#eed3c9] bg-[#fff7f4] [&_>_span]:bg-[#fae7df] [&_>_span]:text-[#ad5946] [&_p]:text-[#8e4e3e] [.group\/lyu-dashboard-license&]:block [.group\/lyu-dashboard-license&_strong]:text-[#a45140] dark:border-[#634239] dark:bg-[#30221e] dark:[&_p]:text-[#e6b9aa] dark:[.group\/lyu-dashboard-license&_strong]:text-[#e6ad9e]'}`}><strong>{system.license.isActive ? `License active · ${system.license.daysRemaining} days remaining` : 'System license inactive'}</strong><p>{system.license.isActive ? 'Renewal is available during the final 10 days.' : 'System access is restricted. Contact your administrator to activate or renew the license.'}</p>{access?.user?.isAdmin && <Link className="group/prod-button min-h-[37px] inline-flex items-center justify-center gap-[7px] py-0 px-3.5 border border-transparent rounded-[7px] text-[10px] font-bold cursor-pointer transition-[background,color,border] duration-150 [&:disabled]:opacity-[.55] [&:disabled]:cursor-wait [.group\/prod-modal-form_&]:justify-self-end max-[480px]:[.group\/prod-form-actions_&]:w-[100%] [.group\/prod-managed-actions_&]:min-h-[34px] [.group\/prod-managed-actions_&]:py-0 px-[11px] [.group\/prod-managed-actions_&]:rounded-lg [.group\/prod-managed-actions_&]:text-[10px] border-[#dfe6dd] bg-white text-[#52675a] [&:hover:not(:disabled)]:border-[#b8cdb0] [&:hover:not(:disabled)]:text-[#315b3a] dark:border-[#3a4a3e] dark:bg-[#1d2a22] dark:text-[#cad8cb] dark:[&:hover:not(:disabled)]:border-[#617c61] dark:[&:hover:not(:disabled)]:text-[#e0ecdb]" to="/dashboard/system#license">Manage license</Link>}</section>}
      {system?.license && !system.license.isActive ? <section className="mt-[29px] p-[19px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-[15px] dark:border-[#2e3d32] dark:bg-[#18241c]"><div className="min-h-[130px] grid content-center justify-items-center text-[#9aa59c] text-center [&_>_span]:text-[#8ca37f] [&_>_span]:text-[22px] [&_strong]:mt-[6px] [&_strong]:text-[#68786d] [&_strong]:text-[10px] [&_p]:mt-1 mx-0 mb-0 [&_p]:text-[9px] dark:[&_strong]:text-[#c4d3c5]"><strong>Workspace access is temporarily restricted</strong><p>{system.isAdmin ? 'Renew the system license from the admin console to restore module access.' : 'All modules remain available again after your administrator activates a valid license.'}</p></div></section> : <section className="mt-[29px] p-[19px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-[15px] dark:border-[#2e3d32] dark:bg-[#18241c]"><div className="flex items-start justify-between [&_h2]:m-0 [&_h2]:text-[#2b4934] [&_h2]:font-bold [&_h2]:text-[16px] [&_h2]:font-['Manrope',_sans-serif] [&_>_div_>_p:last-child]:text-[#919d92] [&_>_div_>_p:last-child]:text-[9px] dark:[&_>_div_>_p:last-child]:text-[#a7b5a9] dark:[&_h2]:text-[#d9e6da]"><div><p className="mt-0 mx-0 mb-2.5 text-[#829183] font-bold text-[9px] font-['DM_Mono',_monospace] tracking-[1px] [.group\/erp-dashboard-top_&]:m-0 text-[10px]">YOUR ASSIGNED WORK</p><h2>ERP modules</h2><p>Only modules assigned to your account are shown here. Ask an administrator if your responsibilities change.</p></div>{access?.user?.isAdmin && <span className="inline-flex items-center py-1 px-[7px] rounded-[30px] text-[8px] font-bold text-[9px] bg-[#f8f1df] text-[#9a8047] dark:bg-[#3a3525] dark:text-[#ddca8d]">Administrator</span>}</div>
        {accessError && <p className="m-0 text-[#a44b3f] bg-[#fbefeb] rounded-[5px] p-2.5 text-[11px]">{accessError}</p>}
        {!access && !accessError && <div className="min-h-[60vh] grid place-content-center text-center text-[#718078] text-[13px] font-['DM_Mono'] [&_span]:text-[#91aa55] [&_span]:text-[22px] [&_span]:mt-[10px]">Loading assignments…</div>}
        {access && visibleModules.length === 0 && <div className="grid min-h-32 content-center justify-items-center rounded-lg border border-dashed border-border text-center"><strong className="text-sm font-medium text-foreground">No modules assigned yet</strong><p className="mt-1 text-sm text-muted-foreground">Ask your administrator to assign your work modules.</p></div>}
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(min(100%,_280px),_1fr))] gap-2.5 mt-[15px]">{visibleModules.map((module) => <Link to={module.key === 'production' ? '/production' : '#'} className={`flex items-center gap-2.5 p-3 border border-[#edf0ea] rounded-[7px] text-[#57705a] [&:hover]:border-[#cbdac4] [&:hover]:bg-[#f8fbf5] [&_>_span]:w-7 [&_>_span]:h-7 [&_>_span]:grid [&_>_span]:place-items-center [&_>_span]:rounded-[7px] [&_>_span]:bg-[#edf4e8] [&_>_span]:text-sm [&_>_div]:grid [&_>_div]:flex-1 [&_>_div]:gap-[3px] [&_strong]:text-[#455b49] [&_strong]:text-[10px] [&_small]:text-[#9aa49b] [&_small]:text-[8px] [&_>_b]:text-[#86a279] dark:[&_small]:text-[#a7b5a9] dark:[&_strong]:text-[#d9e6da] dark:[&_>_b]:text-[#b9d79f] dark:border-[#35443a] dark:text-[#ccd9ce] dark:[&:hover]:border-[#52694f] dark:[&:hover]:bg-[#202e25] dark:[&_>_span]:bg-[#2a3c2e] [&_small]:text-[10px] [&_strong]:text-[11px]${module.key !== 'production' ? 'cursor-default [&_>_b]:text-[#7b887e] [&_>_b]:text-[9px]' : ''}`} key={module.key} onClick={(event) => { if (module.key !== 'production') event.preventDefault(); }}><span>{module.icon}</span><div><strong>{module.title}</strong><small>{module.detail}</small></div><b>{module.key === 'production' ? '↗' : 'Assigned'}</b></Link>)}</div>
      </section>}
      <footer className="flex justify-between pt-[23px] px-0.5 pb-[5px] text-[#a1aaa2] text-[8px] font-['DM_Mono',_monospace] tracking-[.5px] max-[480px]:gap-3 max-[480px]:text-[7px] dark:text-[#849389]"><span>LYU ERP · WORKSPACE</span><span>{session.user.name} · {session.user.email}</span></footer>
    </main>
  );
}
