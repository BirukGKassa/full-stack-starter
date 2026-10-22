import { Input } from '../../production/components/ui.js';

export default function ChangePasswordForm({ saving, onSubmit }) {
  return (
    <section className="shadcn-card min-w-0 space-y-5 p-6 max-[760px]:p-4 flex-1">
      <div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start"><div><h2>Change password</h2><p>Changing your password will revoke other signed-in sessions.</p></div></div>
      <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <Input label="Current password" name="currentPassword" type="password" autoComplete="current-password" />
        <Input label="New password" name="newPassword" type="password" minLength="12" maxLength="128" autoComplete="new-password" help="Use at least 12 characters." />
        <Input label="Confirm new password" name="confirmPassword" type="password" minLength="12" maxLength="128" autoComplete="new-password" />
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 md:col-span-2" disabled={saving}>{saving ? 'Updating…' : 'Change password'}</button>
      </form>
    </section>
  );
}
