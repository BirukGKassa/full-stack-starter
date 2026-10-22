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
    <section className="space-y-5 rounded-xl border border-[#e4e4e7] bg-white p-6 shadow-sm dark:border-[#27272a] dark:bg-[#18181b] max-[640px]:p-4">
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold tracking-tight text-[#18181b] dark:text-[#fafafa]">Primary company information</h2>
        <p className="text-sm leading-6 text-[#71717a] dark:text-[#a1a1aa]">Displayed on the public home page and used as the ERP company identity.</p>
      </div>
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        {fields.map(([key, label, required = false, type = 'text']) => <Input key={key} name={key} label={label} type={type} value={company[key] || ''} onChange={(event) => onChange((current) => ({ ...current, [key]: event.target.value }))} required={required} />)}
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-[#18181b] px-4 text-sm font-medium text-white transition-colors hover:bg-[#27272a] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a1a1aa] dark:bg-[#fafafa] dark:text-[#18181b] dark:hover:bg-[#e4e4e7] sm:col-span-2" disabled={loading}>{loading ? 'Saving…' : 'Save company information'}</button>
      </form>
    </section>
  );
}
