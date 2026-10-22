import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Brand, { BrandIcon } from './components/brand.js';

const modules = [
  ['Production overview', 'Live output, work orders, and production activity', '◫'],
  ['Production entry', 'Record shift output and shop-floor reports', '＋'],
  ['Machine downtime', 'Track and review operational stoppages', '◷'],
  ['Products & BOMs', 'Manage production products and bills of materials', '◇'],
  ['Work orders', 'Plan and track manufacturing orders', '▤'],
  ['Machines & tools', 'Manage production work centers and equipment', '⚙'],
  ['Quality & traceability', 'Review quality checks and production traceability', '◉'],
  ['Production reports', 'Summarize output, scrap, and downtime', '▥'],
];
function licenseMessage(license) {
  if (!license) return null;
  if (!license.isActive) return 'Lyu ERP license is not active. Contact your system administrator.';
  const days = license.daysRemaining;
  if (days <= 3) return `Urgent: your Lyu ERP license expires in ${days} day${days === 1 ? '' : 's'}. Renew now to avoid interruption.`;
  if (days <= 10) return `Your Lyu ERP license has ${days} days remaining. Please renew soon.`;
  if (days <= 20) return `Your Lyu ERP license has ${days} days remaining. Plan your renewal.`;
  return `Your Lyu ERP license is currently active with ${days} days remaining.`;
}
export default function HomePage() {
  const [system, setSystem] = useState(null);

  useEffect(() => {
    let active = true;
    const load = () => fetch('/api/public/system', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`System information unavailable (${response.status})`)))
      .then((data) => { if (active) setSystem(data); })
      .catch((error) => console.error('Could not load public system information:', error));
    load();
    const timer = window.setInterval(load, 10 * 60 * 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  const companyName = system?.company?.companyName || 'Lyu ERP';
  return (
    <div className="overflow-hidden group/lyu-erp-home [&_h2_em]:text-[#779268] [&_h2_em]:font-['Georgia',_serif] [&_h2_em]:font-normal">
      <section className="group/lyu-home-hero grid grid-cols-[minmax(0,_1.05fr)_minmax(300px,_.75fr)] items-center gap-[7%] px-[9%] py-16 [&_h1]:mt-5 mx-0 mb-[15px] [&_h1]:text-[#1d3d2b] [&_h1]:font-bold [&_h1]:text-[clamp(44px,_6vw,_72px)] [&_h1]:leading-[1.03] [&_h1]:font-['Manrope',_sans-serif] [&_h1]:tracking-[-3.5px] [&_h1_em]:text-[#779268] [&_h1_em]:font-['Georgia',_serif] [&_h1_em]:font-normal max-[760px]:grid-cols-[1fr] max-[760px]:py-[50px] px-[7%]">
        <div>
          <Brand className="mb-[24px]" />
          <p className="text-[#76877d] font-medium text-[10px] font-['DM_Mono',_monospace] tracking-[1.45px] flex items-center gap-[9px]    [.group\/lyu-cta_&]:text-[#aec0ad]"><span className="w-[19px] h-px bg-[#91aa55]" /> ONE CONNECTED BUSINESS SYSTEM</p>
          <h1>Run your whole<br />business with <em>clarity.</em></h1>
          <p className="max-w-[440px] text-[#78877c] text-sm leading-[1.8] dark:text-[#b1beb4] [.group\/lyu-home-hero_&]:max-w-[570px] [.group\/lyu-home-hero_&]:text-[#78867b] [.group\/lyu-home-hero_&]:text-sm [.group\/lyu-home-hero_&]:leading-[1.8] dark:[.group\/lyu-home-hero_&]:text-[#a8b6aa]">Lyu ERP connects the people, processes, and information behind your business—from finance and people operations to inventory, customer orders, and manufacturing.</p>
          <div className="flex items-center flex-wrap gap-[19px] mt-[28px]">
            <Link to="/go" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Sign in to Lyu ERP <span aria-hidden="true">↗</span></Link>
            <a href="#modules" className="text-sm font-medium text-foreground underline-offset-4 hover:underline">Explore production features <span aria-hidden="true">↓</span></a>
          </div>
          <div className="flex items-center gap-2.5 mt-[25px] text-[#617267] text-[11px] font-bold dark:text-[#b5c5b7]"><span className="w-2 h-2 flex-[0_0_auto] rounded-full bg-[#81aa69] shadow-[0_0_0_5px_#81aa6920] w-1.5 h-1.5" /> {companyName}</div>
        </div>
        <div className="group/lyu-erp-home-panel relative min-h-80 flex flex-col justify-center rounded-xl border border-border bg-card p-8 text-card-foreground shadow-sm [&_>_p]:text-muted-foreground [&_>_p]:font-medium [&_>_p]:text-xs [&_h2]:mt-2 mx-0 mb-[26px] [&_h2]:font-semibold [&_h2]:text-[clamp(25px,_3vw,_34px)] [&_h2]:leading-[1.2] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-1px] [&_>_small]:mt-[24px] [&_>_small]:text-muted-foreground [&_>_small]:text-sm max-[760px]:min-h-[260px]">
          <BrandIcon className="group/lyu-preview-mark dark:text-[#dce9dc] [.group\/lyu-erp-home-panel_>_&]:absolute [.group\/lyu-erp-home-panel_>_&]:top-[25px] [.group\/lyu-erp-home-panel_>_&]:right-[26px]" />
          <p>LYU ERP WORKSPACE</p>
          <h2>One source of truth.<br /><em>Every team in sync.</em></h2>
          <div className="grid gap-2.5 [&_span]:w-[100%] [&_span]:h-[9px] [&_span]:rounded-[99px] [&_span]:bg-[#d1dfca] [&_span:nth-child(2)]:w-[76%] [&_span:nth-child(3)]:w-[89%] [&_span:nth-child(4)]:w-[57%] dark:[&_span]:bg-[#344c37]"><span /><span /><span /><span /></div>
          <small>{companyName}</small>
        </div>
      </section>
      {system?.license && <div className={`flex items-center gap-3 mt-[22px] mx-[9%] mb-0 py-[13px] px-4 border border-[#d7e6d1] rounded-[11px] bg-[#f5fbf1] [&_>_span]:w-6 [&_>_span]:h-6 [&_>_span]:grid [&_>_span]:flex-[0_0_auto] [&_>_span]:place-items-center [&_>_span]:rounded-full [&_>_span]:bg-[#e2efdb] [&_>_span]:text-[#47764a] [&_>_span]:font-bold [&_p]:m-0 [&_p]:text-[#44634a] [&_p]:text-xs [&_p]:leading-[1.5] dark:border-[#38533c] dark:bg-[#1b2b20] dark:[&_p]:text-[#c3d8c1]${system.license.isActive ? '' : 'border-[#eed3c9] bg-[#fff7f4] [&_>_span]:bg-[#fae7df] [&_>_span]:text-[#ad5946] [&_p]:text-[#8e4e3e] [.group\/lyu-dashboard-license&]:block [.group\/lyu-dashboard-license&_strong]:text-[#a45140] dark:border-[#634239] dark:bg-[#30221e] dark:[&_p]:text-[#e6b9aa] dark:[.group\/lyu-dashboard-license&_strong]:text-[#e6ad9e]'}`} role="status">
        <span>{system.license.isActive ? '✓' : '!'}</span><p>{licenseMessage(system.license)}</p>
      </div>}

      <section className="px-[8%] py-16 group/lyu-erp-modules" id="modules">
        <div className="[&_h2_em]:text-[#72915a] [&_h2_em]:italic [&_h2_em]:font-normal [&_h2_em]:text-[1em] [&_h2_em]:font-['Georgia',_serif] [&_h2_em]:tracking-[-4px] max-w-[560px] [&_h2]:mt-[17px] mx-0 mb-3 [&_h2]:text-[#1d3e2a] [&_h2]:font-bold [&_h2]:text-[clamp(38px,_5vw,_55px)] [&_h2]:leading-[1.08] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-2.4px] [&_>_p:last-child]:max-w-[465px] [&_>_p:last-child]:text-[#819086] [&_>_p:last-child]:text-xs [&_>_p:last-child]:leading-[1.8] dark:[&_h2]:text-[#e4ede5] dark:[&_>_p:last-child]:text-[#b1beb4]">
          <p className="text-[#76877d] font-medium text-[10px] font-['DM_Mono',_monospace] tracking-[1.45px] flex items-center gap-[9px]    [.group\/lyu-cta_&]:text-[#aec0ad]"><span className="w-[19px] h-px bg-[#91aa55]" /> THE LYU ERP PLATFORM</p>
          <h2>Every function.<br /><em>Working together.</em></h2>
          <p>A unified workspace for business operations, with access tailored to each team.</p>
        </div>
        <div className="grid grid-cols-[repeat(3,_1fr)] gap-[13px] mt-[38px] [.group\/lyu-erp-modules_&]:grid-cols-3 max-[760px]:[.group\/lyu-erp-modules_&]:grid-cols-2 max-[480px]:[.group\/lyu-erp-modules_&]:grid-cols-[1fr]">{modules.map(([name, detail, icon], index) => (
          <article className="min-h-[205px] p-[22px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] [&_h3]:mt-0 mx-0 mb-2 [&_h3]:text-[#2f4b37] [&_h3]:font-bold [&_h3]:text-[15px] [&_h3]:font-['Manrope',_sans-serif] [&_p]:m-0 [&_p]:text-[#8b978d] [&_p]:text-[10px] [&_p]:leading-[1.8] dark:border-[#2e3d32] dark:bg-[#18241c] dark:[&_h3]:text-[#dce8dc] dark:[&_p]:text-[#b0beb2] [&_p]:text-[11px] [.group\/lyu-erp-modules_&]:min-h-[185px]" key={name}>
            <span className="text-[#a4afa4] text-[9px] font-['DM_Mono',_monospace] dark:text-[#a3b2a6] text-[9px]">{String(index + 1).padStart(2, '0')}</span>
            <span className="w-[34px] h-[34px] grid place-items-center mt-5 mx-0 mb-[13px] rounded-lg bg-[#edf4e8] text-[#578051] text-[17px]">{icon}</span>
            <h3>{name}</h3>
            <p>{detail}</p>
          </article>
        ))}</div>
      </section>

      <section className="flex items-center justify-between gap-[30px] py-[55px] px-[9%] bg-[#edf2e9] [&_h2]:mt-3 mx-0 mb-2 [&_h2]:text-[#254430] [&_h2]:font-bold [&_h2]:text-[clamp(27px,_4vw,_40px)] [&_h2]:font-['Manrope',_sans-serif] [&_p:last-child]:max-w-[500px] [&_p:last-child]:text-[#738276] [&_p:last-child]:text-xs [&_p:last-child]:leading-[1.7] [&_address]:grid [&_address]:gap-[5px] [&_address]:text-[#68796e] [&_address]:text-[11px] [&_address]:not-italic [&_address]:leading-[1.6] [&_address_a]:text-[#446e49] dark:[&_h2]:text-[#dce9dd] dark:[&_p:last-child]:text-[#a8b6aa] dark:bg-[#19251e] dark:[&_address]:text-[#afbeb1] dark:[&_address_a]:text-[#b9d79f] max-[760px]:items-start max-[760px]:flex-col max-[760px]:py-[42px] px-[7%]">
        <div><p className="text-[#76877d] font-medium text-[10px] font-['DM_Mono',_monospace] tracking-[1.45px] flex items-center gap-[9px]    [.group\/lyu-cta_&]:text-[#aec0ad]"><span className="w-[19px] h-px bg-[#91aa55]" /> YOUR BUSINESS, CONNECTED</p>
          <h2>{companyName}</h2>
          <p>Company information, teams, and day-to-day operations in one secure system.</p>
        </div>
        {system?.company?.addressLine1 && <address>
          {[system.company.addressLine1, system.company.addressLine2, [system.company.city, system.company.region, system.company.postalCode].filter(Boolean).join(', '), system.company.country].filter(Boolean).map((line) => <span key={line}>{line}</span>)}
          {system.company.email && <a href={`mailto:${system.company.email}`}>{system.company.email}</a>}
        </address>}
      </section>

      <section className="group/lyu-cta relative mt-0 flex min-h-[220px] items-center justify-between gap-6 rounded-xl bg-primary px-[10%] py-12 text-primary-foreground max-[760px]:flex-col max-[760px]:items-start">
        <div><p className="text-sm font-medium text-primary-foreground/70">LYU ERP · BUSINESS OPERATIONS</p><h2 className="mt-4 text-3xl font-semibold tracking-tight">Bring your teams together.</h2></div>
        <Link to="/go" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary-foreground px-4 text-sm font-medium text-primary transition-colors hover:bg-primary-foreground/90">Sign in to your workspace <span aria-hidden="true">↗</span></Link>
        <BrandIcon className="group/lyu-cta-mark group/lyu-logo-contrast" />
      </section>
    </div>
  );
}
