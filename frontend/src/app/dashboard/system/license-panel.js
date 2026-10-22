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
    <section id="license" className={`min-w-0 space-y-5 rounded-xl border border-[#e4e4e7] bg-white p-6 shadow-sm dark:border-[#27272a] dark:bg-[#18181b] dark:text-[#fafafa] max-[640px]:p-4${license?.isActive ? '' : ' border-[#fecaca] bg-[#fffafa] dark:border-[#7f1d1d] dark:bg-[#1c1111]'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-[#18181b] dark:text-[#fafafa]">License status</h2>
            <span className="rounded-full border border-[#e4e4e7] bg-[#f4f4f5] px-2 py-0.5 text-xs font-medium capitalize text-[#52525b] dark:border-[#3f3f46] dark:bg-[#27272a] dark:text-[#d4d4d8]">{license?.status || 'Checking'}</span>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-[#71717a] dark:text-[#a1a1aa]">{notice(license)}</p>
        </div>
        <button className="inline-flex h-9 items-center justify-center rounded-md border border-[#e4e4e7] bg-white px-3 text-sm font-medium text-[#18181b] transition-colors hover:bg-[#f4f4f5] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a1a1aa] dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#fafafa] dark:hover:bg-[#27272a]" onClick={onRefresh} disabled={loading}>Refresh status ↻</button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <span className="grid gap-1.5 rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-3 dark:border-[#3f3f46] dark:bg-[#202024]"><small className="text-xs text-[#71717a] dark:text-[#a1a1aa]">State</small><strong className="text-sm font-medium capitalize text-[#18181b] dark:text-[#fafafa]">{license?.status || 'Checking'}</strong></span>
        <span className="grid gap-1.5 rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-3 dark:border-[#3f3f46] dark:bg-[#202024]"><small className="text-xs text-[#71717a] dark:text-[#a1a1aa]">Days remaining</small><strong className="text-sm font-medium text-[#18181b] dark:text-[#fafafa]">{license?.isActive ? license.daysRemaining : 0}</strong></span>
        <span className="grid gap-1.5 rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-3 dark:border-[#3f3f46] dark:bg-[#202024]"><small className="text-xs text-[#71717a] dark:text-[#a1a1aa]">Expiration date</small><strong className="text-sm font-medium text-[#18181b] dark:text-[#fafafa]">{dateTime(license?.expiresAt)}</strong></span>
        <span className="grid gap-1.5 rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-3 dark:border-[#3f3f46] dark:bg-[#202024]"><small className="text-xs text-[#71717a] dark:text-[#a1a1aa]">Key configured</small><strong className="text-sm font-medium text-[#18181b] dark:text-[#fafafa]">{license?.configuredKeyPresent ? 'Yes' : 'No'}</strong></span>
      </div>
      <form className="grid items-end gap-3 md:grid-cols-[minmax(0,_1fr)_auto]" onSubmit={onSubmit}>
        <Input label="New license key" name="licenseKey" value={licenseKey} onChange={(event) => onKeyChange(event.target.value)} placeholder="Enter license activation key" minLength="8" maxLength="512" required={Boolean(license?.canAddLicense)} />
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-[#18181b] px-4 text-sm font-medium text-white transition-colors hover:bg-[#27272a] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a1a1aa] dark:bg-[#fafafa] dark:text-[#18181b] dark:hover:bg-[#e4e4e7]" disabled={loading || !license?.canAddLicense || licenseKey.trim().length < 8}>
          {loading ? 'Checking…' : license?.canAddLicense ? 'Register / renew license' : `Available with ${license?.renewalWindowDays || 10} days remaining`}
        </button>
      </form>
      <p className="text-sm leading-6 text-[#71717a] dark:text-[#a1a1aa]">License activation requires an exact match with the server-only <code className="rounded bg-[#f4f4f5] px-1 py-0.5 font-mono text-xs dark:bg-[#27272a]">LICENCE_KEY</code>. A pending key can be retried with Refresh and is automatically removed after 30 minutes if it remains unactivated. Renewal adds {license?.durationDays || 365} days to the previous active license expiration, carrying over any remaining days. The previous key is marked used when renewal activates.</p>
      <LicenseHistory items={licenseData?.licenses || []} loading={loading} onRetry={onRefresh} formatDate={dateTime} />
    </section>
  );
}
