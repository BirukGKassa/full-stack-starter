import { Input } from '../../production/components/ui.js';
import LicenseHistory from './license-history.js';

function notice(license) {
  if (!license) return 'Checking license status…';
  if (!license.isActive) return 'Your Lyu ERP license is expired or not activated. System access is restricted until a valid license is activated.';
  if (license.daysRemaining <= 3) return `Urgent: your license expires in ${license.daysRemaining} day${license.daysRemaining === 1 ? '' : 's'}. Renew immediately to avoid service interruption.`;
  if (license.daysRemaining <= 10) return `Your license has ${license.daysRemaining} days remaining. Renew soon. License entry is available during the final 10 days.`;
  if (license.daysRemaining <= 20) return `Your license has ${license.daysRemaining} days remaining. Please plan your renewal.`;
  return `Your license is currently active with ${license.daysRemaining} days remaining.`;
}

function dateTime(value) {
  return value ? new Date(value).toLocaleString() : '—';
}

export default function LicensePanel({ license, licenseData, loading, licenseKey, onKeyChange, onRefresh, onSubmit }) {
  return (
    <section id="license" className={`min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] group/lyu-license-admin grid gap-3.5${license?.isActive ? '' : 'border-[#eed3c9] bg-[#fff7f4] [&_>_span]:bg-[#fae7df] [&_>_span]:text-[#ad5946] [&_p]:text-[#8e4e3e] [.group\/lyu-dashboard-license&]:block [.group\/lyu-dashboard-license&_strong]:text-[#a45140] dark:border-[#634239] dark:bg-[#30221e] dark:[&_p]:text-[#e6b9aa] dark:[.group\/lyu-dashboard-license&_strong]:text-[#e6ad9e]'}`}>
      <div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start"><div><h2>License status</h2><p>{notice(license)}</p></div><button className="group/prod-button min-h-[37px] inline-flex items-center justify-center gap-[7px] py-0 px-3.5 border border-transparent rounded-[7px] text-[10px] font-bold cursor-pointer transition-[background,color,border] duration-150 [&:disabled]:opacity-[.55] [&:disabled]:cursor-wait [.group\/prod-modal-form_&]:justify-self-end max-[480px]:[.group\/prod-form-actions_&]:w-[100%] [.group\/prod-managed-actions_&]:min-h-[34px] [.group\/prod-managed-actions_&]:py-0 px-[11px] [.group\/prod-managed-actions_&]:rounded-lg [.group\/prod-managed-actions_&]:text-[10px] border-[#dfe6dd] bg-white text-[#52675a] [&:hover:not(:disabled)]:border-[#b8cdb0] [&:hover:not(:disabled)]:text-[#315b3a] dark:border-[#3a4a3e] dark:bg-[#1d2a22] dark:text-[#cad8cb] dark:[&:hover:not(:disabled)]:border-[#617c61] dark:[&:hover:not(:disabled)]:text-[#e0ecdb]" onClick={onRefresh} disabled={loading}>Refresh status ↻</button></div>
      <div className="grid grid-cols-[repeat(4,_minmax(0,_1fr))] gap-2.5 [&_>_span]:grid [&_>_span]:gap-[5px] [&_>_span]:p-3 [&_>_span]:border border-[#e5ebe3] [&_>_span]:rounded-lg [&_>_span]:bg-[#fbfcf9] [&_small]:text-[#849186] [&_small]:text-[9px] [&_small]:uppercase [&_small]:tracking-[.4px] [&_strong]:text-[#35563b] [&_strong]:text-xs [&_strong]:capitalize dark:[&_>_span]:border-[#35443a] dark:[&_>_span]:bg-[#151f19] dark:[&_small]:text-[#a8b6aa] dark:[&_strong]:text-[#d2e2d3] max-[760px]:grid-cols-2 max-[480px]:grid-cols-[1fr]">
        <span><small>State</small><strong>{license?.status || 'Checking'}</strong></span>
        <span><small>Days remaining</small><strong>{license?.isActive ? license.daysRemaining : 0}</strong></span>
        <span><small>Expiration date</small><strong>{dateTime(license?.expiresAt)}</strong></span>
        <span><small>Key configured</small><strong>{license?.configuredKeyPresent ? 'Yes' : 'No'}</strong></span>
      </div>
      <form className="grid grid-cols-[minmax(0,_1fr)_auto] items-end gap-2.5 [&_>_button]:min-h-[39px] max-[760px]:grid-cols-[1fr]" onSubmit={onSubmit}>
        <Input label="New license key" name="licenseKey" value={licenseKey} onChange={(event) => onKeyChange(event.target.value)} placeholder="Enter license activation key" minLength="8" maxLength="512" required={Boolean(license?.canAddLicense)} />
        <button className="group/prod-button min-h-[37px] inline-flex items-center justify-center gap-[7px] py-0 px-3.5 border border-transparent rounded-[7px] text-[10px] font-bold cursor-pointer transition-[background,color,border] duration-150 [&:disabled]:opacity-[.55] [&:disabled]:cursor-wait [.group\/prod-modal-form_&]:justify-self-end max-[480px]:[.group\/prod-form-actions_&]:w-[100%] [.group\/prod-managed-actions_&]:min-h-[34px] [.group\/prod-managed-actions_&]:py-0 px-[11px] [.group\/prod-managed-actions_&]:rounded-lg [.group\/prod-managed-actions_&]:text-[10px] bg-[#174835] text-[#f6f8f3] [&:hover:not(:disabled)]:bg-[#236244]" disabled={loading || !license?.canAddLicense || licenseKey.trim().length < 8}>
          {loading ? 'Checking…' : license?.canAddLicense ? 'Register / renew license' : `Available with ${license?.renewalWindowDays || 10} days remaining`}
        </button>
      </form>
      <p className="m-0 text-[#748176] text-[10px] leading-[1.7] dark:text-[#a8b6aa]">License activation requires an exact match with the server-only <code>LICENCE_KEY</code>. A pending key can be retried with Refresh and is automatically removed after 30 minutes if it remains unactivated. Renewal adds {license?.durationDays || 365} days to the previous active license expiration, carrying over any remaining days. The previous key is marked used when renewal activates.</p>
      <LicenseHistory items={licenseData?.licenses || []} loading={loading} onRetry={onRefresh} formatDate={dateTime} />
    </section>
  );
}
