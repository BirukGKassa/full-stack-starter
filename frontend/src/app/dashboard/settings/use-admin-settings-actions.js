import { productionApi } from '../../../lib/production-api.js';

export default function useAdminSettingsActions(state) {
  const { reload, setSaving, setToast, newModules, setNewModules, drafts, setResetPasswordUser } = state;
  async function createUser(event) {
    event.preventDefault(); const element = event.currentTarget; const form = new FormData(element); setSaving(true);
    try {
      await productionApi.createUser({ name: String(form.get('name')).trim(), username: String(form.get('username')).trim(), email: String(form.get('email')).trim(), employeeId: String(form.get('employeeId')).trim(), temporaryPassword: String(form.get('temporaryPassword')), modules: newModules });
      element.reset(); setNewModules(['production']); setToast({ kind: 'success', message: 'User created and assigned to the selected modules.' }); await reload();
    } catch (error) { setToast({ kind: 'error', message: error.message || 'Could not create account.' }); }
    finally { setSaving(false); }
  }
  async function saveAssignments(account) {
    setSaving(true);
    try { await productionApi.updateUserModules(account.id, drafts[account.id] || []); setToast({ kind: 'success', message: `Module assignments updated for ${account.name}.` }); await reload(); }
    catch (error) { setToast({ kind: 'error', message: error.message || 'Could not update user modules.' }); }
    finally { setSaving(false); }
  }
  async function toggleActive(account) {
    setSaving(true);
    try { await productionApi.setUserActive(account.id, !account.isActive); setToast({ kind: 'success', message: account.isActive ? `${account.name} has been deactivated.` : `${account.name} has been reactivated.` }); await reload(); }
    catch (error) { setToast({ kind: 'error', message: error.message || 'Could not update account status.' }); }
    finally { setSaving(false); }
  }
  async function resetPassword(event, account) {
    event.preventDefault(); setSaving(true);
    try {
      await productionApi.resetUserPassword(account.id, String(new FormData(event.currentTarget).get('temporaryPassword')));
      setResetPasswordUser(null); setToast({ kind: 'success', message: `Password reset for ${account.name}. All existing sessions were signed out.` }); await reload();
    } catch (error) { setToast({ kind: 'error', message: error.message || 'Could not reset password.' }); }
    finally { setSaving(false); }
  }
  return { createUser, saveAssignments, toggleActive, resetPassword };
}
