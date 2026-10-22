export default function Input({ label, name, type = 'text', required = true, defaultValue, value, onChange, readOnly = false, min, minLength, maxLength, step, placeholder, help, autoComplete }) {
  return (
    <label className="grid min-w-0 content-start gap-1.5 text-sm font-medium text-[#52525b] [.group\/prod-report-controls_&]:min-w-[155px] [.group\/prod-report-controls_&]:flex-1 [.group\/prod-downtime-row_&]:min-w-0 [.group\/prod-reset-password_&]:min-w-0 dark:text-[#d4d4d8]">
      <span>{label}{required && <b className="text-[#b91c1c]" aria-hidden="true"> *</b>}</span>
      <input className="h-9 w-full min-w-0 rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm text-[#18181b] outline-none placeholder:text-[#a1a1aa] focus-visible:border-[#a1a1aa] dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#fafafa] dark:placeholder:text-[#71717a]" name={name} type={type} required={required} {...(value === undefined ? { defaultValue } : { value })} onChange={onChange} readOnly={readOnly} min={min} minLength={minLength} maxLength={maxLength} step={step} placeholder={placeholder} autoComplete={autoComplete} />
      {help && <small className="text-xs font-normal leading-5 text-[#71717a] dark:text-[#a1a1aa]">{help}</small>}
    </label>
  );
}
