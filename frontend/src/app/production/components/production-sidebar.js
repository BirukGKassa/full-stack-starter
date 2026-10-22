import { Link } from 'react-router-dom';
import Brand from '../../components/brand.js';
import { navigation } from '../constants.js';

export default function ProductionSidebar({ access, isAdmin, activeView, activeDowntime, onNavigate }) {
  return (
    <aside className="group/prod-sidebar sticky top-0 flex h-screen min-h-screen flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 text-sidebar-foreground max-[760px]:static max-[760px]:h-auto max-[760px]:min-h-0 max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:py-3">
      <Brand className="mb-7 ml-1 text-lg max-[760px]:mb-3" />
      {['WORKSPACE', 'DATA ENTRY', 'OPERATIONS', 'INSIGHTS'].map((group) => (
        <div className="mb-4 ml-2.5 [&_>_p]:mb-2 [&_>_p]:text-xs [&_>_p]:font-medium [&_>_p]:text-muted-foreground max-[760px]:contents max-[760px]:[&_>_p]:hidden max-[760px]:[.group\\/prod-sidebar_>_&]:flex max-[760px]:[.group\\/prod-sidebar_>_&]:gap-1 max-[760px]:[.group\\/prod-sidebar_>_&]:overflow-x-auto max-[760px]:[.group\\/prod-sidebar_>_&]:pb-1" key={group}>
          <p>{group}</p>
          {navigation.filter((item) => item.group === group && (isAdmin || access?.modules?.includes(item.id))).map((item) => (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground max-[760px]:w-auto max-[760px]:min-w-max max-[760px]:px-3 [&_>_span]:w-5 [&_>_span]:text-center [&_>_i]:ml-auto [&_>_i]:rounded-full [&_>_i]:bg-destructive [&_>_i]:px-2 [&_>_i]:py-0.5 [&_>_i]:text-xs [&_>_i]:not-italic [&_>_i]:text-white${activeView === item.id ? ' bg-sidebar-accent font-medium text-sidebar-accent-foreground' : ''}`}>
              <span>{item.icon}</span>{item.label}{item.id === 'downtime' && activeDowntime.length > 0 && <i>{activeDowntime.length}</i>}
            </button>
          ))}
        </div>
      ))}
      <Link to="/dashboard" className="mt-auto block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground max-[760px]:hidden">← Dashboard</Link>
    </aside>
  );
}
