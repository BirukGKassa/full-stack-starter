import { Input } from '../../production/components/ui.js';

const fields = [
  ['companyName', 'Company name', true],
  ['legalName', 'Registered legal name'],
  ['taxNumber', 'Tax number'],
  ['email', 'Company email', false, 'email'],
  ['phone', 'Phone number'],
  ['website', 'Website'],
  ['addressLine1', 'Address line 1'],
  ['addressLine2', 'Address line 2'],
  ['city', 'City'],
  ['region', 'State / region'],
  ['postalCode', 'Postal code'],
  ['country', 'Country'],
];

export default function CompanyProfile({ company, loading, onChange, onSubmit }) {
  return (
    <section className="prod-card">
      <div className="prod-card-heading"><div><h2>Primary company information</h2><p>Displayed on the public home page and used as the ERP company identity.</p></div></div>
      <form className="prod-form-grid" onSubmit={onSubmit}>
        {fields.map(([key, label, required = false, type = 'text']) => <Input key={key} name={key} label={label} type={type} value={company[key] || ''} onChange={(event) => onChange((current) => ({ ...current, [key]: event.target.value }))} required={required} />)}
        <button className="prod-button prod-button-primary prod-field-wide" disabled={loading}>{loading ? 'Saving…' : 'Save company information'}</button>
      </form>
    </section>
  );
}
