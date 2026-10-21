export default function Select({ label, name, options, required = true, placeholder = 'Choose one', defaultValue }) {
  return (
    <label className="prod-field">
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <select name={name} required={required} defaultValue={defaultValue || ''}>
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
