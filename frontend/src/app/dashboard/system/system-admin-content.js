import { Link } from 'react-router-dom';
import Brand from '../../components/brand.js';
import CompanyProfile from './company-profile.js';
import LicensePanel from './license-panel.js';
import SystemOverview from './system-overview.js';

export default function SystemAdminContent({ state, actions }) {
  const license = state.licenseData?.license;
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e4e4e7] pb-5 dark:border-[#27272a]">
        <div className="space-y-2">
          <Brand />
          <p className="text-sm text-[#71717a] dark:text-[#a1a1aa]">Workspace administration</p>
        </div>
        <nav className="flex flex-wrap gap-1" aria-label="System navigation">
          <Link className="rounded-md px-3 py-2 text-sm font-medium text-[#52525b] transition-colors hover:bg-[#f4f4f5] hover:text-[#18181b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a1a1aa] dark:text-[#a1a1aa] dark:hover:bg-[#27272a] dark:hover:text-[#fafafa]" to="/dashboard">Dashboard</Link>
          <Link className="rounded-md px-3 py-2 text-sm font-medium text-[#52525b] transition-colors hover:bg-[#f4f4f5] hover:text-[#18181b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a1a1aa] dark:text-[#a1a1aa] dark:hover:bg-[#27272a] dark:hover:text-[#fafafa]" to="/dashboard/settings">User access</Link>
        </nav>
      </header>
      <section className="space-y-2">
        <p className="text-sm font-medium text-[#71717a] dark:text-[#a1a1aa]">System settings</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#18181b] dark:text-[#fafafa]">Workspace administration</h1>
        <p className="max-w-2xl text-sm leading-6 text-[#71717a] dark:text-[#a1a1aa]">
          Manage licensing, company details, system health, and recent activity from one place.
        </p>
      </section>
      <nav className="flex flex-wrap gap-1 border-b border-[#e4e4e7] pb-3 dark:border-[#27272a]" aria-label="Settings sections">
        <a className="rounded-md px-3 py-2 text-sm font-medium text-[#52525b] transition-colors hover:bg-[#f4f4f5] hover:text-[#18181b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a1a1aa] dark:text-[#a1a1aa] dark:hover:bg-[#27272a] dark:hover:text-[#fafafa]" href="#license">License</a>
        {license?.isActive && <>
          <a className="rounded-md px-3 py-2 text-sm font-medium text-[#52525b] transition-colors hover:bg-[#f4f4f5] hover:text-[#18181b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a1a1aa] dark:text-[#a1a1aa] dark:hover:bg-[#27272a] dark:hover:text-[#fafafa]" href="#company">Company</a>
          <a className="rounded-md px-3 py-2 text-sm font-medium text-[#52525b] transition-colors hover:bg-[#f4f4f5] hover:text-[#18181b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a1a1aa] dark:text-[#a1a1aa] dark:hover:bg-[#27272a] dark:hover:text-[#fafafa]" href="#system-health">System health</a>
        </>}
      </nav>
      {state.error && <section className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#991b1b] dark:border-[#7f1d1d] dark:bg-[#450a0a] dark:text-[#fecaca]" role="alert">
        <strong className="font-medium">Could not load all system data</strong>
        <p className="mt-1">{state.error}</p>
        <button className="mt-2 font-medium underline underline-offset-4" onClick={state.reload}>Retry</button>
      </section>}
      <LicensePanel license={license} licenseData={state.licenseData} loading={state.loading} licenseKey={state.licenseKey} onKeyChange={state.setLicenseKey} onRefresh={actions.refreshLicense} onSubmit={actions.addLicense} />
      {license?.isActive && <>
        <section id="company" className="scroll-mt-6">
          <CompanyProfile company={state.company} loading={state.loading} onChange={state.setCompany} onSubmit={actions.saveCompany} />
        </section>
        <section id="system-health" className="scroll-mt-6">
          <SystemOverview overview={state.overview} loading={state.loading} onRefresh={state.reload} onRevoke={actions.revokeUserSessions} />
        </section>
      </>}
    </div>
  );
}
