export default function Textarea({ label, name, required = false, placeholder }) {
  return (
    <label className="col-span-full grid min-w-0 content-start gap-1.5 text-sm font-medium text-[#52525b] [.group\/prod-report-controls_&]:min-w-[155px] [.group\/prod-report-controls_&]:flex-1 [.group\/prod-downtime-row_&]:min-w-0 [.group\/prod-reset-password_&]:min-w-0 dark:text-[#d4d4d8] max-[480px]:col-start-1">
      <span>{label}{required && <b className="text-[#b91c1c]" aria-hidden="true"> *</b>}</span>
      <textarea className="min-h-20 w-full min-w-0 resize-y rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm text-[#18181b] outline-none placeholder:text-[#a1a1aa] focus-visible:border-[#a1a1aa] dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#fafafa] dark:placeholder:text-[#71717a]" name={name} rows="2" required={required} placeholder={placeholder} />
    </label>
  );
}
