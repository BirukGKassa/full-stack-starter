import ProductionAccountMenu from './production-account-menu.js';

export default function ProductionHeader({ label, user, isOwner, workstation, onWorkstationChange, refreshing, onRefresh }) {
  return (
    <header className="h-16 flex items-center justify-between gap-[15px] p-[0_clamp(20px,_4vw,_54px)] border-b border-b-[#e7ebe5] bg-[#fbfcf9] max-[760px]:h-[50px] max-[760px]:py-0 px-4 dark:border-[#2c3b31] dark:bg-[#151f19]">
      <div><span className="hidden max-[760px]:inline max-[760px]:text-[#465b4b] max-[760px]:text-[10px] max-[760px]:font-bold dark:text-[#d2dfd4]">{label || 'System settings'}</span><span className="text-[#8a978d] text-[10px] [&_i]:my-0 mx-2 [&_i]:text-[#c1c9c0] [&_i]:not-italic [&_strong]:text-[#3b5143] [&_strong]:font-bold max-[760px]:hidden dark:text-[#a1afa4] dark:[&_strong]:text-[#d2dfd4]">Lyu ERP <i>/</i> Production <i>/</i> <strong>{label || 'System settings'}</strong></span></div>
      <div className="flex items-center gap-[15px] max-[480px]:gap-2">
        <label className="grid gap-[3px] min-w-[150px] [&_span]:text-[#9aa59c] [&_span]:font-bold [&_span]:text-[8px] [&_span]:font-['DM_Mono',_monospace] [&_span]:tracking-[.4px] [&_input]:w-[100%] [&_input]:py-1 px-[7px] [&_input]:border border-[#e3e9e1] [&_input]:rounded-[5px] [&_input]:bg-[#fffefa] [&_input]:text-[#42564a] [&_input]:text-[9px] [&_input]:font-['DM_Sans',_sans-serif] max-[760px]:min-w-[115px] max-[760px]:[&_span]:hidden dark:[&_span]:text-[#a1afa4] dark:[&_input]:border-[#35473a] dark:[&_input]:bg-[#121c16] dark:[&_input]:text-[#d9e5da]" title="A label saved in this browser; the browser cannot read your PC hostname.">
          <span>Workstation label</span><input aria-label="Workstation label" value={workstation} onChange={(event) => onWorkstationChange(event.target.value)} placeholder="Name this workstation" />
        </label>
        <span className="text-[#718276] text-[9px] font-['DM_Mono',_monospace] [&_i]:w-[7px] [&_i]:h-[7px] [&_i]:inline-block [&_i]:mr-[6px] [&_i]:rounded-full [&_i]:bg-[#80ad69] [&_i]:shadow-[0_0_0_3px_#80ad6922] max-[760px]:hidden dark:text-[#b0c0b3]"><i /> Operations online</span>
        <button className="w-[31px] h-[31px] grid place-items-center border border-[#e4e9e1] rounded-lg bg-white text-[#66786b] text-[17px] cursor-pointer [&:hover]:bg-[#f1f5ed] [&:hover]:text-[#285638] dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd]" aria-label="Refresh production data" onClick={onRefresh} disabled={refreshing}>{refreshing ? '…' : '↻'}</button>
        <ProductionAccountMenu user={user} isOwner={isOwner} />
      </div>
    </header>
  );
}
