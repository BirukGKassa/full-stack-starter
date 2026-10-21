import { Link } from 'react-router-dom';
import Brand from '../../components/brand.js';
import CompanyProfile from './company-profile.js';
import LicensePanel from './license-panel.js';
import SystemOverview from './system-overview.js';

export default function SystemAdminContent({ state, actions }) {
  const license = state.licenseData?.license;
  return <>
    <div className="erp-dashboard-top">
      <div><Brand /><p className="prod-eyebrow">LYU ERP · ADMIN CONSOLE</p><p>Company, license, and system operations</p></div>
      <div><Link className="prod-button prod-button-outline" to="/dashboard">← Dashboard</Link><Link className="prod-button prod-button-outline" to="/dashboard/settings">User access</Link></div>
    </div>
    <div className="prod-page-heading"><p className="prod-eyebrow">SYSTEM ADMINISTRATION</p><h1>ERP operations</h1><p>Company identity, licensing, system health, events, downtime, and session management.</p></div>
    {state.error && <section className="prod-card prod-api-warning"><strong>Could not load all system data</strong><p>{state.error}</p><button className="prod-text-button" onClick={state.reload}>Retry</button></section>}
    <LicensePanel license={license} licenseData={state.licenseData} loading={state.loading} licenseKey={state.licenseKey} onKeyChange={state.setLicenseKey} onRefresh={actions.refreshLicense} onSubmit={actions.addLicense} />
    {license?.isActive && <>
      <CompanyProfile company={state.company} loading={state.loading} onChange={state.setCompany} onSubmit={actions.saveCompany} />
      <SystemOverview overview={state.overview} loading={state.loading} onRefresh={state.reload} onRevoke={actions.revokeUserSessions} />
    </>}
  </>;
}
