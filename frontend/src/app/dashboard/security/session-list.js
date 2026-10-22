function describeDevice(userAgent) {
  if (!userAgent) return 'Unknown browser or device';
  if (/Windows/i.test(userAgent)) return `Windows · ${userAgent.split(' ').slice(-2).join(' ')}`;
  if (/Mac OS|Macintosh/i.test(userAgent)) return 'Mac';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/iPhone|iPad/i.test(userAgent)) return 'iPhone / iPad';
  if (/Linux/i.test(userAgent)) return 'Linux';
  return userAgent.slice(0, 100);
}

export default function SessionList({ sessions, loading, saving, onRefresh, onRevoke }) {
  return (
    <section className="shadcn-card min-w-0 space-y-4 p-6 max-[760px]:p-4 flex-1">
      <div className="flex items-center justify-between gap-3 mb-[14px] [&_h2]:m-0 [&_h2]:text-[#2a4433] [&_h2]:font-bold [&_h2]:text-[13px] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-.2px] [&_p]:mt-[5px] mx-0 mb-0 [&_p]:text-[#929d93] [&_p]:text-[9px] dark:[&_h2]:text-[#d9e5da] dark:[&_p]:text-[#a1afa4] [&_h2]:text-[15px] [&_p]:text-[#68776c] [&_p]:text-[11px] [.group\/prod-user-management_&]:items-start [.group\/lyu-license-admin_>_&]:items-start"><div><h2>Your active sessions</h2><p>Sign out a session on another browser or device. Your current device is marked.</p></div><button className="border-0 bg-transparent text-[#557d55] text-[9px] font-bold cursor-pointer whitespace-nowrap [&:hover]:text-[#234f34] [&:hover]:underline" onClick={onRefresh}>Refresh ↻</button></div>
      {loading ? <div className="min-h-[60vh] flex items-center justify-center gap-2.5 text-[#809083] text-[11px]">Loading sessions…</div> : !sessions.length ? <div className="min-h-[130px] grid content-center justify-items-center text-[#9aa59c] text-center [&_>_span]:text-[#8ca37f] [&_>_span]:text-[22px] [&_strong]:mt-[6px] [&_strong]:text-[#68786d] [&_strong]:text-[10px] [&_p]:mt-1 mx-0 mb-0 [&_p]:text-[9px] dark:[&_strong]:text-[#c4d3c5]"><strong>No active sessions</strong></div> : sessions.map((item) => (
        <article className="flex items-center justify-between gap-3.5 py-3.5 px-0 border-t border-t-[#edf0eb] [&_>_div]:grid [&_>_div]:gap-[5px] [&_strong]:text-[#405748] [&_strong]:text-xs [&_small]:text-[#7d8c80] [&_small]:text-[10px] dark:[&_strong]:text-[#d2e2d3] dark:border-[#2d3c31] dark:[&_small]:text-[#a8b6aa] max-[480px]:items-start max-[480px]:flex-col" key={item.id}>
          <div><strong>{describeDevice(item.userAgent)} {item.isCurrent && <span className="inline-flex items-center py-1 px-[7px] rounded-[30px] text-[8px] font-bold text-[9px] bg-[#edf5e9] text-[#54744c] dark:bg-[#273b2c] dark:text-[#b9d8aa]">Current device</span>}</strong><small>Last active {new Date(item.updatedAt).toLocaleString()} · Expires {new Date(item.expiresAt).toLocaleString()}</small><small>{item.ipAddress || 'IP address unavailable'}</small></div>
          <button className="group/prod-button min-h-[37px] inline-flex items-center justify-center gap-[7px] py-0 px-3.5 border border-transparent rounded-[7px] text-[10px] font-bold cursor-pointer transition-[background,color,border] duration-150 [&:disabled]:opacity-[.55] [&:disabled]:cursor-wait [.group\/prod-modal-form_&]:justify-self-end max-[480px]:[.group\/prod-form-actions_&]:w-[100%] [.group\/prod-managed-actions_&]:min-h-[34px] [.group\/prod-managed-actions_&]:py-0 px-[11px] [.group\/prod-managed-actions_&]:rounded-lg [.group\/prod-managed-actions_&]:text-[10px] border-[#dfe6dd] bg-white text-[#52675a] [&:hover:not(:disabled)]:border-[#b8cdb0] [&:hover:not(:disabled)]:text-[#315b3a] dark:border-[#3a4a3e] dark:bg-[#1d2a22] dark:text-[#cad8cb] dark:[&:hover:not(:disabled)]:border-[#617c61] dark:[&:hover:not(:disabled)]:text-[#e0ecdb]" disabled={saving} onClick={() => onRevoke(item)}>{item.isCurrent ? 'Sign out this device' : 'Sign out session'}</button>
        </article>
      ))}
    </section>
  );
}
