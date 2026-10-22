import { Link } from 'react-router-dom';
import Brand from '../../components/brand.js';
import { navigation } from '../constants.js';

export default function ProductionSidebar({ access, isAdmin, activeView, activeDowntime, onNavigate }) {
  return (
    <aside className="group/prod-sidebar sticky top-0 h-screen min-h-screen flex flex-col pt-[26px] px-[17px] pb-[17px] border-r border-r-[#e5eae3] bg-[#fbfcf9] max-[760px]:static max-[760px]:w-[100%] max-[760px]:h-[auto] max-[760px]:min-h-0 max-[760px]:pt-[13px] px-4 pb-[9px] max-[760px]:border-r-[0] max-[760px]:border-b border-b-[#e5eae3] max-[760px]:flex max-[760px]:flex-col dark:border-[#2c3b31] dark:bg-[#151f19]">
      <Brand className="mt-0 mr-0 mb-[25px] ml-[7px] text-lg max-[760px]:mt-0 mr-0 mb-3 ml-[3px]" />
      {['WORKSPACE', 'DATA ENTRY', 'OPERATIONS', 'INSIGHTS'].map((group) => (
        <div className="[&_>_p]:text-[#9aa59c] [&_>_p]:font-bold [&_>_p]:text-[9px] [&_>_p]:font-['DM_Mono',_monospace] [&_>_p]:tracking-[.9px] mt-0 mx-0 mb-3.5 [&_>_p]:mt-0 mr-0 mb-2 ml-2.5 max-[760px]:contents max-[760px]:[&_>_p]:hidden max-[760px]:[.group\/prod-sidebar_>_&]:flex max-[760px]:[.group\/prod-sidebar_>_&]:overflow-x-auto max-[760px]:[.group\/prod-sidebar_>_&]:gap-[5px] max-[760px]:[.group\/prod-sidebar_>_&]:pb-[1px]" key={group}>
          <p>{group}</p>
          {navigation.filter((item) => item.group === group && (isAdmin || access?.modules?.includes(item.id))).map((item) => (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`w-[100%] flex items-center gap-2.5 p-2.5 border-0 rounded-[7px] bg-transparent text-[#718077] text-left text-[11px] cursor-pointer transition-[color,background] duration-150 [&:hover]:bg-[#f1f5ee] [&:hover]:text-[#254b37] [&_>_span]:w-[18px] [&_>_span]:text-[#79917d] [&_>_span]:text-[15px] [&_>_span]:text-center [&_>_i]:ml-[auto] [&_>_i]:min-w-[19px] [&_>_i]:p-[3px] [&_>_i]:rounded-[50px] [&_>_i]:bg-[#fae7df] [&_>_i]:text-[#a44735] [&_>_i]:text-[9px] [&_>_i]:not-italic [&_>_i]:text-center max-[760px]:w-[auto] max-[760px]:min-w-[max-content] max-[760px]:gap-1.5 max-[760px]:py-2 px-[9px] max-[760px]:text-[9px] max-[760px]:[&_>_span]:w-[auto] max-[760px]:[&_>_span]:text-xs dark:text-[#a2b0a5] dark:[&:hover]:bg-[#26372b] dark:[&:hover]:text-[#d7e8d4]${activeView === item.id ? 'bg-[#eaf2e6] text-[#285638] font-bold dark:bg-[#26372b] dark:text-[#d7e8d4] dark:[&_>_span]:text-[#b5d49f]' : ''}`}>
              <span>{item.icon}</span>{item.label}{item.id === 'downtime' && activeDowntime.length > 0 && <i>{activeDowntime.length}</i>}
            </button>
          ))}
        </div>
      ))}
      <Link to="/dashboard" className="mt-auto block py-[9px] px-1 text-[#869287] text-[10px] max-[760px]:hidden [&:hover]:text-[#315b3a] dark:text-[#849389]">← Dashboard</Link>
    </aside>
  );
}
