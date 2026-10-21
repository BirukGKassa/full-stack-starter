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
    <section id="license" className={`prod-card lyu-license-admin ${license?.isActive ? 'lyu-license-active' : 'lyu-license-inactive'}`}>
      <div className="prod-card-heading"><div><h2>License status</h2><p>{notice(license)}</p></div><button className="prod-button prod-button-outline" onClick={onRefresh} disabled={loading}>Refresh status ↻</button></div>
      <div className="lyu-license-facts">
        <span><small>State</small><strong>{license?.status || 'Checking'}</strong></span>
        <span><small>Days remaining</small><strong>{license?.isActive ? license.daysRemaining : 0}</strong></span>
        <span><small>Expiration date</small><strong>{dateTime(license?.expiresAt)}</strong></span>
        <span><small>Key configured</small><strong>{license?.configuredKeyPresent ? 'Yes' : 'No'}</strong></span>
      </div>
      <form className="lyu-license-form" onSubmit={onSubmit}>
        <Input label="New license key" name="licenseKey" value={licenseKey} onChange={(event) => onKeyChange(event.target.value)} placeholder="Enter license activation key" minLength="8" maxLength="512" required={Boolean(license?.canAddLicense)} />
        <button className="prod-button prod-button-primary" disabled={loading || !license?.canAddLicense || licenseKey.trim().length < 8}>
          {loading ? 'Checking…' : license?.canAddLicense ? 'Register / renew license' : `Available with ${license?.renewalWindowDays || 10} days remaining`}
        </button>
      </form>
      <p className="lyu-license-help">License activation requires an exact match with the server-only <code>LICENCE_KEY</code>. A pending key can be retried with Refresh and is automatically removed after 30 minutes if it remains unactivated. Renewal adds {license?.durationDays || 365} days to the previous active license expiration, carrying over any remaining days. The previous key is marked used when renewal activates.</p>
      <LicenseHistory items={licenseData?.licenses || []} loading={loading} onRetry={onRefresh} formatDate={dateTime} />
    </section>
  );
}
