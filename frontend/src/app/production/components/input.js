export default function Input({ label, name, type = 'text', required = true, defaultValue, value, onChange, readOnly = false, min, minLength, maxLength, step, placeholder, help, autoComplete }) {
  return (
    <label className="prod-field">
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <input name={name} type={type} required={required} {...(value === undefined ? { defaultValue } : { value })} onChange={onChange} readOnly={readOnly} min={min} minLength={minLength} maxLength={maxLength} step={step} placeholder={placeholder} autoComplete={autoComplete} />
      {help && <small>{help}</small>}
    </label>
  );
}
