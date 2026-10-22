export default function MetricCard({ label, value, note, tone = 'green', icon }) {
  return (
    <article className={`group/prod-metric min-h-[120px] pt-[15px] px-4 pb-3.5 border border-[#e6ebe4] rounded-lg bg-[#fffefa] [&_>_strong]:block [&_>_strong]:mt-[10px] [&_>_strong]:text-[#213e2e] [&_>_strong]:font-bold [&_>_strong]:text-[25px] [&_>_strong]:font-['Manrope',_sans-serif] [&_>_strong]:tracking-[-.8px] [&_>_small]:block [&_>_small]:mt-[4px] [&_>_small]:text-[#98a299] [&_>_small]:text-[9px] max-[480px]:min-h-[106px] max-[480px]:p-[11px] max-[480px]:[&_>_strong]:text-[21px] dark:border-[#2d3d32] dark:bg-[#19251e] dark:text-[#cbd8cd] dark:[&_>_small]:text-[#a1afa4] dark:[&_>_strong]:text-[#d9e8d9] ${tone === 'blue' ? 'group/prod-metric-blue' : tone === 'gold' ? 'group/prod-metric-gold' : tone === 'red' ? 'group/prod-metric-red' : ''}`}>
      <div className="flex items-center justify-between gap-2 text-[#849187] text-[10px] [&_i]:w-[25px] [&_i]:h-[25px] [&_i]:grid [&_i]:place-items-center [&_i]:rounded-[7px] [&_i]:bg-[#edf5e9] [&_i]:text-[#5d8655] [&_i]:text-[13px] [&_i]:not-italic [.group\\/prod-metric-blue_&_i]:bg-[#eaf1f4] [.group\\/prod-metric-blue_&_i]:text-[#5d8191] [.group\\/prod-metric-gold_&_i]:bg-[#f8f1df] [.group\\/prod-metric-gold_&_i]:text-[#a1874c] [.group\\/prod-metric-red_&_i]:bg-[#fae9e4] [.group\\/prod-metric-red_&_i]:text-[#ad5949] max-[480px]:text-[9px] dark:text-[#a1afa4]"><span>{label}</span><i>{icon}</i></div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
