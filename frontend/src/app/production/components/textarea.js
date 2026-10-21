export default function Textarea({ label, name, required = false, placeholder }) {
  return (
    <label className="prod-field prod-field-wide">
      <span>{label}</span>
      <textarea name={name} rows="2" required={required} placeholder={placeholder} />
    </label>
  );
}
