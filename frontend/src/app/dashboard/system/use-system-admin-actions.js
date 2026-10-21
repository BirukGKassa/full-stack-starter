import { systemApi } from '../../../lib/system-api.js';

export default function useSystemAdminActions(state) {
  async function saveCompany(event) {
    event.preventDefault(); state.setLoading(true);
    try {
      state.setCompany(await systemApi.updateCompany(state.company));
      state.setToast({ kind: 'success', message: 'Company information saved.' }); await state.reload();
    } catch (error) { state.setToast({ kind: 'error', message: error.message || 'Could not save company information.' }); }
    finally { state.setLoading(false); }
  }
  async function addLicense(event) {
    event.preventDefault(); state.setLoading(true);
    try {
      const result = await systemApi.registerLicense(state.licenseKey);
      state.setLicenseData({ license: result, licenses: state.licenseData?.licenses || [] }); state.setLicenseKey('');
      state.setToast({ kind: 'success', message: result.submitted?.status === 'pending' ? 'License saved as pending. Use Refresh status to retry activation after LICENCE_KEY is updated.' : 'License activated successfully.' });
      await state.reload();
    } catch (error) { state.setToast({ kind: 'error', message: error.message || 'Could not register the license.' }); }
    finally { state.setLoading(false); }
  }
  async function refreshLicense() {
    state.setLoading(true);
    try {
      const result = await systemApi.refreshLicense(); state.setLicenseData((current) => ({ ...current, license: result }));
      state.setToast({ kind: result.isActive ? 'success' : 'error', message: result.isActive ? 'License is active.' : result.status === 'pending' ? 'License is still pending: the key does not currently match LICENCE_KEY.' : 'No matching active license was found.' });
      await state.reload();
    } catch (error) { state.setToast({ kind: 'error', message: error.message || 'Could not refresh license status.' }); }
    finally { state.setLoading(false); }
  }
  async function revokeUserSessions(userId, userName) {
    if (!window.confirm(`Sign out every active session for ${userName}?`)) return;
    state.setLoading(true);
    try { await systemApi.revokeUserSessions(userId); state.setToast({ kind: 'success', message: `All active sessions for ${userName} were revoked.` }); await state.reload(); }
    catch (error) { state.setToast({ kind: 'error', message: error.message || 'Could not revoke user sessions.' }); }
    finally { state.setLoading(false); }
  }
  return { saveCompany, addLicense, refreshLicense, revokeUserSessions };
}
