import { Input } from '../../production/components/ui.js';

export default function ChangePasswordForm({ saving, onSubmit }) {
  return (
    <section className="prod-card flex-1">
      <div className="prod-card-heading"><div><h2>Change password</h2><p>Changing your password will revoke other signed-in sessions.</p></div></div>
      <form className="prod-form-grid" onSubmit={onSubmit}>
        <Input label="Current password" name="currentPassword" type="password" autoComplete="current-password" />
        <Input label="New password" name="newPassword" type="password" minLength="12" maxLength="128" autoComplete="new-password" help="Use at least 12 characters." />
        <Input label="Confirm new password" name="confirmPassword" type="password" minLength="12" maxLength="128" autoComplete="new-password" />
        <button className="prod-button prod-button-primary prod-field-wide" disabled={saving}>{saving ? 'Updating…' : 'Change password'}</button>
      </form>
    </section>
  );
}
