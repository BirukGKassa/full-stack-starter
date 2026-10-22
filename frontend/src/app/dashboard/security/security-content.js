import { Link } from 'react-router-dom';
import Brand from '../../components/brand.js';
import ChangePasswordForm from './change-password-form.js';
import SessionList from './session-list.js';

export default function SecurityContent({ error, message, saving, sessions, loading, onPasswordChange, onRefresh, onRevoke }) {
  return (
    <main className="group/erp-dashboard group/erp-system-page mx-auto grid min-h-screen w-full max-w-7xl content-start gap-6 bg-background px-4 py-7 text-foreground sm:px-8">
      <div className="group/erp-dashboard-top flex items-center justify-between gap-[18px] pb-[16px] border-b border-b-[#e7ebe4] max-[760px]:items-start max-[760px]:flex-col dark:border-[#334237] [&_>_div:first-child_>_p:last-child]:text-[11px] [.group\/erp-system-page_&_>_div:last-child]:flex [.group\/erp-system-page_&_>_div:last-child]:gap-2 max-[760px]:[.group\/erp-system-page_&]:items-start max-[760px]:[.group\/erp-system-page_&]:flex-col max-[760px]:[.group\/erp-system-page_&_>_div:last-child]:flex-wrap">
        <div><Brand /><p className="mt-0 mx-0 mb-2.5 text-[#829183] font-bold text-[9px] font-['DM_Mono',_monospace] tracking-[1px] [.group\/erp-dashboard-top_&]:m-0 text-[10px]">LYU ERP · ACCOUNT SECURITY</p><p>Protect your account and devices</p></div>
        <Link className="group/prod-button min-h-[37px] inline-flex items-center justify-center gap-[7px] py-0 px-3.5 border border-transparent rounded-[7px] text-[10px] font-bold cursor-pointer transition-[background,color,border] duration-150 [&:disabled]:opacity-[.55] [&:disabled]:cursor-wait [.group\/prod-modal-form_&]:justify-self-end max-[480px]:[.group\/prod-form-actions_&]:w-[100%] [.group\/prod-managed-actions_&]:min-h-[34px] [.group\/prod-managed-actions_&]:py-0 px-[11px] [.group\/prod-managed-actions_&]:rounded-lg [.group\/prod-managed-actions_&]:text-[10px] border-[#dfe6dd] bg-white text-[#52675a] [&:hover:not(:disabled)]:border-[#b8cdb0] [&:hover:not(:disabled)]:text-[#315b3a] dark:border-[#3a4a3e] dark:bg-[#1d2a22] dark:text-[#cad8cb] dark:[&:hover:not(:disabled)]:border-[#617c61] dark:[&:hover:not(:disabled)]:text-[#e0ecdb]" to="/dashboard">← Dashboard</Link>
      </div>
      <div className="[&_>_p:last-child]:text-[#839087] [&_>_p:last-child]:text-[11px] mt-[15px] mx-0 mb-[23px] [&_h1]:m-0 [&_h1]:text-[#1d3d2b] [&_h1]:font-semibold [&_h1]:text-[clamp(27px,_3vw,_36px)] [&_h1]:leading-[1.12] [&_h1]:font-['Manrope',_sans-serif] [&_h1]:tracking-[-1.5px] [&_>_p:last-child]:mt-2 mx-0 mb-0 dark:[&_h1]:text-[#d9e8d9] dark:[&_>_p:last-child]:text-[#a0aea3] [.group\/erp-system-page_&]:mt-2.5 mx-0 mb-0"><p className="mt-0 mx-0 mb-2.5 text-[#829183] font-bold text-[9px] font-['DM_Mono',_monospace] tracking-[1px] [.group\/erp-dashboard-top_&]:m-0 text-[10px]">YOUR ACCOUNT</p><h1>Password and sessions</h1><p>Update your password and sign out sessions you do not recognize.</p></div>
      {error && <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] mt-[14px] border-[#f0d3c9] bg-[#fff8f5] [&_strong]:text-[#a04f3d] [&_strong]:text-[11px] [&_p]:text-[#906e65] [&_p]:text-[9px] [&_p]:leading-[1.7] dark:border-[#594139] dark:bg-[#2a211d] dark:[&_strong]:text-[#e8b5a6] dark:[&_p]:text-[#c0a398]" role="alert"><strong>Action could not be completed</strong><p>{error}</p></section>}
      {message && <section className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] border-[#d5e6ce] bg-[#f5faf2] text-[#3c6b43] text-xs dark:border-[#3b563e] dark:bg-[#1b2b20] dark:text-[#c3d8c1]" role="status">{message}</section>}
      <div className="flex w-full flex-col gap-4 xl:flex-row">
        <ChangePasswordForm saving={saving} onSubmit={onPasswordChange} />
        <SessionList sessions={sessions} loading={loading} saving={saving} onRefresh={onRefresh} onRevoke={onRevoke} />
      </div>
    </main>
  );
}
