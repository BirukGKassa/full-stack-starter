import { Input } from '../../production/components/ui.js';
import ModuleSelector from './module-selector.js';

export default function CreateUserSection({ modules, selected, onModuleChange, saving, onSubmit, isOwner }) {
  return (
    <section className="space-y-5 rounded-xl border border-[#e4e4e7] bg-white p-6 shadow-sm dark:border-[#27272a] dark:bg-[#18181b] max-[640px]:p-4">
      <header className="space-y-1.5">
        <h2 className="text-base font-semibold tracking-tight text-[#18181b] dark:text-[#fafafa]">Create a user</h2>
        <p className="text-sm leading-6 text-[#71717a] dark:text-[#a1a1aa]">Assign one or more production tasks now, or update access later.</p>
      </header>
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <Input label="Full name" name="name" />
        <Input label="Employee ID" name="employeeId" placeholder="Optional · link to employee record" required={false} maxLength="50" />
        <Input label="Username" name="username" placeholder="first.last" minLength="3" maxLength="30" help="Letters, numbers, dots, and underscores only." />
        <Input label="Email address" name="email" type="email" />
        <Input label="Temporary password" name="temporaryPassword" type="password" minLength="8" maxLength="128" help="8–128 characters. Share it securely with the user." />
        {isOwner && <label className="flex items-center gap-2 rounded-md border border-[#e4e4e7] px-3 py-2 text-sm font-medium text-[#3f3f46] dark:border-[#3f3f46] dark:text-[#d4d4d8]"><input className="size-4 accent-[#18181b] dark:accent-[#fafafa]" type="checkbox" name="isAdmin" /> Create as administrator</label>}
        <fieldset className="min-w-0 sm:col-span-2">
          <legend className="text-sm font-medium text-[#52525b] dark:text-[#d4d4d8]">Production access</legend>
          <ModuleSelector modules={modules} selected={selected} onChange={onModuleChange} />
        </fieldset>
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-[#18181b] px-4 text-sm font-medium text-white transition-colors hover:bg-[#27272a] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a1a1aa] dark:bg-[#fafafa] dark:text-[#18181b] dark:hover:bg-[#e4e4e7] sm:col-span-2" disabled={saving || selected.length === 0}>
          {saving ? 'Saving…' : 'Create account'}
        </button>
      </form>
    </section>
  );
}
