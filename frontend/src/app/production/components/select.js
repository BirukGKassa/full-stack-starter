export default function Select({ label, name, options, required = true, placeholder = 'Choose one', defaultValue, value, onChange }) {
  return (
    <label className="grid min-w-0 content-start gap-1.5 text-sm font-medium text-[#52525b] [.group\/prod-report-controls_&]:min-w-[155px] [.group\/prod-report-controls_&]:flex-1 [.group\/prod-downtime-row_&]:min-w-0 [.group\/prod-reset-password_&]:min-w-0 dark:text-[#d4d4d8]">
      <span>{label}{required && <b className="text-[#b91c1c]" aria-hidden="true"> *</b>}</span>
      <select className="h-9 w-full min-w-0 rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm text-[#18181b] outline-none focus-visible:border-[#a1a1aa] dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#fafafa]" name={name} required={required} {...(value === undefined ? { defaultValue: defaultValue || '' } : { value })} onChange={onChange}>
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
