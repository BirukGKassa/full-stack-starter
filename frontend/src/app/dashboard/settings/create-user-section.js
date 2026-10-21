import { Input } from '../../production/components/ui.js';
import ModuleSelector from './module-selector.js';

export default function CreateUserSection({ modules, selected, onModuleChange, saving, onSubmit }) {
  return (
    <section className="prod-card">
      <div className="prod-card-heading"><div><h2>Create a user</h2><p>Assign one or more modules now, or find the user below to assign modules later.</p></div></div>
      <form className="prod-form-grid" onSubmit={onSubmit}>
        <Input label="Full name" name="name" />
        <Input label="Employee ID" name="employeeId" placeholder="Optional · link to employee record" required={false} maxLength="50" />
        <Input label="Username" name="username" placeholder="first.last" minLength="3" maxLength="30" help="Used to sign in; letters, numbers, dots, and underscores only." />
        <Input label="Email address" name="email" type="email" />
        <Input label="Temporary password" name="temporaryPassword" type="password" minLength="8" maxLength="128" help="8–128 characters. Share it securely with the user." />
        <div className="prod-field prod-field-wide"><span>Assign production modules</span><ModuleSelector modules={modules} selected={selected} onChange={onModuleChange} /></div>
        <button className="prod-button prod-button-primary prod-field-wide" disabled={saving || selected.length === 0}>{saving ? 'Saving…' : 'Create account'}</button>
      </form>
    </section>
  );
}
