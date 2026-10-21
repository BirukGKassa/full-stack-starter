import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { authClient } from '../../../lib/auth-client.js';
import { systemApi } from '../../../lib/system-api.js';
import { Input } from '../../production/components/ui.js';

const companyFields = [
  ['companyName', 'Company name', true],
  ['legalName', 'Registered legal name'],
  ['taxNumber', 'Tax number'],
  ['email', 'Company email', false, 'email'],
  ['phone', 'Phone number'],
  ['website', 'Website'],
  ['addressLine1', 'Address line 1'],
  ['addressLine2', 'Address line 2'],
  ['city', 'City'],
  ['region', 'State / region'],
  ['postalCode', 'Postal code'],
  ['country', 'Country'],
];

function licenseNotice(license) {
  if (!license) return 'Checking license status…';
  if (!license.isActive) return 'Your Lyu ERP license is expired or not activated. System access is restricted until a valid license is activated.';
  const days = license.daysRemaining;
  if (days <= 3) return `Urgent: your license expires in ${days} day${days === 1 ? '' : 's'}. Renew immediately to avoid service interruption.`;
  if (days <= 10) return `Your license has ${days} days remaining. Renew soon. License entry is available during the final 10 days.`;
  if (days <= 20) return `Your license has ${days} days remaining. Please plan your renewal.`;
  return `Your license is currently active with ${days} days remaining.`;
}

function dateTime(value) {
  return value ? new Date(value).toLocaleString() : '—';
}

export default function SystemAdminPage() {
  const { data: session, isPending } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [overview, setOverview] = useState(null);
  const [licenseData, setLicenseData] = useState(null);
  const [company, setCompany] = useState({});
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  async function reload() {
    setLoading(true);
    try {
      const licenseResult = await systemApi.getLicenseStatus();
      setLicenseData(licenseResult);
      if (licenseResult.license.isActive) {
        const result = await systemApi.getAdminOverview();
        setOverview(result);
        setCompany(result.company || {});
      } else {
        setOverview(null);
      }
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'Could not load system information.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    systemApi.getLicenseStatus()
      .then((result) => {
        if (active) {
          setIsAdmin(true);
          setLicenseData(result);
        }
      })
      .catch((accessError) => { if (active) setError(accessError.message || 'Could not verify administrator access.'); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);

  async function saveCompany(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await systemApi.updateCompany(company);
      setCompany(result);
      setToast({ kind: 'success', message: 'Company information saved.' });
      await reload();
    } catch (saveError) {
      setToast({ kind: 'error', message: saveError.message || 'Could not save company information.' });
    } finally {
      setLoading(false);
    }
  }

  async function addLicense(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await systemApi.registerLicense(licenseKey);
      setLicenseData({ license: result, licenses: licenseData?.licenses || [] });
      setLicenseKey('');
      setToast({
        kind: 'success',
        message: result.submitted?.status === 'pending'
          ? 'License saved as pending. Use Refresh status to retry activation after LICENCE_KEY is updated.'
          : 'License activated successfully.',
      });
      await reload();
    } catch (saveError) {
      setToast({ kind: 'error', message: saveError.message || 'Could not register the license.' });
    } finally {
      setLoading(false);
    }
  }

  async function refreshLicense() {
    setLoading(true);
    try {
      const result = await systemApi.refreshLicense();
      setLicenseData((current) => ({ ...current, license: result }));
      setToast({
        kind: result.isActive ? 'success' : 'error',
        message: result.isActive ? 'License is active.' : result.status === 'pending'
          ? 'License is still pending: the key does not currently match LICENCE_KEY.'
          : 'No matching active license was found.',
      });
      await reload();
    } catch (refreshError) {
      setToast({ kind: 'error', message: refreshError.message || 'Could not refresh license status.' });
    } finally {
      setLoading(false);
    }
  }

  async function revokeUserSessions(userId, userName) {
    if (!window.confirm(`Sign out every active session for ${userName}?`)) return;
    setLoading(true);
    try {
      await systemApi.revokeUserSessions(userId);
      setToast({ kind: 'success', message: `All active sessions for ${userName} were revoked.` });
      await reload();
    } catch (revokeError) {
      setToast({ kind: 'error', message: revokeError.message || 'Could not revoke user sessions.' });
    } finally {
      setLoading(false);
    }
  }

  if (isPending || checking) return <div className="page-loading">Checking administrator access…</div>;
  if (!session?.user) return <Navigate to="/go" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const license = licenseData?.license;
  return (
    <main className="erp-dashboard erp-system-page">
      <div className="erp-dashboard-top">
        <div><p className="prod-eyebrow">LYU ERP · ADMIN CONSOLE</p><p>Company, license, and system operations</p></div>
        <div><Link className="prod-button prod-button-outline" to="/dashboard">← Dashboard</Link><Link className="prod-button prod-button-outline" to="/dashboard/settings">User access</Link></div>
      </div>
      <div className="prod-page-heading">
        <p className="prod-eyebrow">SYSTEM ADMINISTRATION</p>
        <h1>ERP operations</h1>
        <p>Company identity, licensing, system health, events, downtime, and session management.</p>
      </div>
      {error && <section className="prod-card prod-api-warning"><strong>Could not load all system data</strong><p>{error}</p><button className="prod-text-button" onClick={reload}>Retry</button></section>}
      <section id="license" className={`prod-card lyu-license-admin ${license?.isActive ? 'lyu-license-active' : 'lyu-license-inactive'}`}>
        <div className="prod-card-heading"><div><h2>License status</h2><p>{licenseNotice(license)}</p></div><button className="prod-button prod-button-outline" onClick={refreshLicense} disabled={loading}>Refresh status ↻</button></div>
        <div className="lyu-license-facts">
          <span><small>State</small><strong>{license?.status || 'Checking'}</strong></span>
          <span><small>Days remaining</small><strong>{license?.isActive ? license.daysRemaining : 0}</strong></span>
          <span><small>Expiration date</small><strong>{dateTime(license?.expiresAt)}</strong></span>
          <span><small>Key configured</small><strong>{license?.configuredKeyPresent ? 'Yes' : 'No'}</strong></span>
        </div>
        <form className="lyu-license-form" onSubmit={addLicense}>
          <Input label="New license key" name="licenseKey" value={licenseKey} onChange={(event) => setLicenseKey(event.target.value)} placeholder="Enter license activation key" minLength="8" maxLength="512" required={Boolean(license?.canAddLicense)} />
          <button className="prod-button prod-button-primary" disabled={loading || !license?.canAddLicense || licenseKey.trim().length < 8}>
            {loading ? 'Checking…' : license?.canAddLicense ? 'Register / renew license' : `Available with ${license?.renewalWindowDays || 10} days remaining`}
          </button>
        </form>
        <p className="lyu-license-help">License activation requires an exact match with the server-only <code>LICENCE_KEY</code>. A mismatch is stored as pending and can be retried with Refresh. Renewal during the 10-day window starts after the current term, adding 365 days to its expiration.</p>
        {licenseData?.licenses?.length > 0 && <div className="prod-table-wrap"><table className="prod-table"><thead><tr><th>Key suffix</th><th>Status</th><th>Activated</th><th>Expires</th><th>Added</th></tr></thead><tbody>{licenseData.licenses.map((item) => <tr key={item.id}><td>•••• {item.keyLastFour}</td><td><span className={`prod-user-status ${item.status === 'active' ? 'prod-user-status-active' : 'prod-user-status-inactive'}`}>{item.status}</span></td><td>{dateTime(item.activatedAt)}</td><td>{dateTime(item.expiresAt)}</td><td>{dateTime(item.createdAt)}</td></tr>)}</tbody></table></div>}
      </section>

      {license?.isActive && <>
        <section className="prod-card">
          <div className="prod-card-heading"><div><h2>Primary company information</h2><p>Displayed on the public home page and used as the ERP company identity.</p></div></div>
          <form className="prod-form-grid" onSubmit={saveCompany}>
            {companyFields.map(([key, label, required = false, type = 'text']) => <Input key={key} name={key} label={label} type={type} value={company[key] || ''} onChange={(event) => setCompany((current) => ({ ...current, [key]: event.target.value }))} required={required} />)}
            <button className="prod-button prod-button-primary prod-field-wide" disabled={loading}>{loading ? 'Saving…' : 'Save company information'}</button>
          </form>
        </section>

        {overview && <>
          <section className="lyu-system-metrics">
            <article><span>DATABASE</span><strong>{overview.database.status}</strong><small>{overview.database.type} · {overview.database.host}{overview.database.database ? ` / ${overview.database.database}` : ''}</small></article>
            <article><span>SYSTEM</span><strong>{overview.system.appName}</strong><small>{overview.system.environment} · Node {overview.system.nodeVersion} · uptime {Math.floor(overview.system.uptimeSeconds / 3600)}h</small></article>
            <article><span>SESSIONS</span><strong>{overview.system.activeSessions}</strong><small>{overview.system.activeUsers} active users</small></article>
            <article><span>ERRORS</span><strong>{overview.system.errorCount}</strong><small>Recent errors retained in the system log</small></article>
          </section>
          <section className="prod-card">
            <div className="prod-card-heading"><div><h2>System activity and sessions</h2><p>Signed-in users, session dates, and workstation information.</p></div><button className="prod-text-button" onClick={reload} disabled={loading}>Refresh ↻</button></div>
            <div className="prod-table-wrap"><table className="prod-table"><thead><tr><th>User</th><th>Started</th><th>Last updated</th><th>Expires</th><th>Client</th><th>Action</th></tr></thead><tbody>
              {overview.sessions.map((item) => <tr key={item.id}><td>{item.userName}</td><td>{dateTime(item.createdAt)}</td><td>{dateTime(item.updatedAt)}</td><td>{dateTime(item.expiresAt)}</td><td>{item.userAgent || item.ipAddress || 'Unknown device'}</td><td><button className="prod-text-button prod-revoke-session" disabled={loading} onClick={() => revokeUserSessions(item.userId, item.userName)}>Revoke all</button></td></tr>)}
              {!overview.sessions.length && <tr><td colSpan="6">No active sessions.</td></tr>}
            </tbody></table></div>
          </section>
          <section className="prod-card">
            <div className="prod-card-heading"><div><h2>System failures and errors</h2><p>Recent server-side failures and health events, grouped by endpoint.</p></div></div>
            <div className="prod-table-wrap"><table className="prod-table"><thead><tr><th>Time</th><th>Level</th><th>Area</th><th>Message</th><th>HTTP</th><th>Path</th></tr></thead><tbody>
              {overview.errors.map((item) => <tr key={item.id}><td>{dateTime(item.createdAt)}</td><td>{item.level}</td><td>{item.category}</td><td>{item.message}</td><td>{item.statusCode || '—'}</td><td>{item.path || '—'}</td></tr>)}
              {!overview.errors.length && <tr><td colSpan="6">No system errors have been recorded.</td></tr>}
            </tbody></table></div>
          </section>
          <section className="prod-card">
            <div className="prod-card-heading"><div><h2>ERP activity log</h2><p>Recent user actions recorded across production modules.</p></div></div>
            <div className="prod-table-wrap"><table className="prod-table"><thead><tr><th>Time</th><th>User</th><th>Module</th><th>Action</th><th>Record</th><th>Workstation</th></tr></thead><tbody>
              {overview.activity.map((item) => <tr key={item.id}><td>{dateTime(item.createdAt)}</td><td>{item.userName}</td><td>{item.moduleKey}</td><td>{item.action}</td><td>{item.recordId || '—'}</td><td>{item.workstationName || '—'}</td></tr>)}
              {!overview.activity.length && <tr><td colSpan="6">No activity recorded yet.</td></tr>}
            </tbody></table></div>
          </section>
          <section className="prod-card">
            <div className="prod-card-heading"><div><h2>Machine downtime</h2><p>Recent operational stoppages, grouped separately from system errors.</p></div></div>
            <div className="prod-table-wrap"><table className="prod-table"><thead><tr><th>Start</th><th>Machine</th><th>Company</th><th>Duration (min)</th><th>Verified</th><th>Notes</th></tr></thead><tbody>
              {overview.downtime.map((item) => <tr key={item.id}><td>{dateTime(item.startTime)}</td><td>{item.workCenterCode}</td><td>{item.companyId}</td><td>{item.durationMinutes ?? 'Ongoing'}</td><td>{item.isVerified ? 'Yes' : 'No'}</td><td>{item.notes || '—'}</td></tr>)}
              {!overview.downtime.length && <tr><td colSpan="6">No downtime records found.</td></tr>}
            </tbody></table></div>
          </section>
        </>}
      </>}
      {toast && <div className={`prod-toast prod-toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}><span>{toast.kind === 'success' ? '✓' : '!'}</span><p>{toast.message}</p><button onClick={() => setToast(null)} aria-label="Dismiss notification">×</button></div>}
    </main>
  );
}
