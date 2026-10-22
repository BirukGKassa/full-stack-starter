export default function EntryCard({ title, description, onSubmit, busy, submitLabel = 'Save entry', children }) {
  return (
    <form className="min-w-0 p-[18px] border border-[#e6ebe4] rounded-lg bg-[#fffefa] max-[760px]:p-3.5 dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] mb-[14px]" onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start">
        <div><h2>{title}</h2><p>{description}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-[13px_14px] max-[760px]:gap-[11px] max-[480px]:grid-cols-[minmax(0,_1fr)]">{children}</div>
      <div className="group/prod-form-actions [&_>_span_b]:text-[#bc6651] flex items-center justify-between gap-3 pt-[15px] mt-[16px] border-t border-t-[#edf0eb] [&_>_span]:text-[#98a299] [&_>_span]:text-[8px] max-[480px]:items-start max-[480px]:flex-col dark:border-[#2d3c31] dark:[&_>_span]:text-[#a6b5a9]"><span>Fields marked <b>*</b> are required.</span><button className="group/prod-button min-h-[37px] inline-flex items-center justify-center gap-[7px] py-0 px-3.5 border border-transparent rounded-[7px] text-[10px] font-bold cursor-pointer transition-[background,color,border] duration-150 [&:disabled]:opacity-[.55] [&:disabled]:cursor-wait [.group\/prod-modal-form_&]:justify-self-end max-[480px]:[.group\/prod-form-actions_&]:w-[100%] [.group\/prod-managed-actions_&]:min-h-[34px] [.group\/prod-managed-actions_&]:py-0 px-[11px] [.group\/prod-managed-actions_&]:rounded-lg [.group\/prod-managed-actions_&]:text-[10px] bg-[#174835] text-[#f6f8f3] [&:hover:not(:disabled)]:bg-[#236244]" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button></div>
    </form>
  );
}
