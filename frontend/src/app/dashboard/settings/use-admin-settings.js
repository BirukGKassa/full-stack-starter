import { useEffect, useMemo, useState } from 'react';
import { productionApi } from '../../../lib/production-api.js';

export default function useAdminSettings() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [newModules, setNewModules] = useState(['production']);
  const [drafts, setDrafts] = useState({});
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const reload = async () => {
    try {
      const result = await productionApi.listUsers();
      setData(result);
      setDrafts(Object.fromEntries(result.users.map((account) => [account.id, result.assignments.filter((item) => item.userId === account.id).map((item) => item.moduleKey)])));
      setError('');
    } catch (loadError) { setError(loadError.message || 'Could not load user settings.'); }
  };
  useEffect(() => {
    let active = true;
    productionApi.getAccess().then((access) => { if (active) setIsAdmin(Boolean(access.user?.isAdmin)); })
      .catch((accessError) => { if (active) setError(accessError.message || 'Could not verify administrator access.'); })
      .finally(() => { if (active) setCheckingAccess(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);
  const visibleUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data?.users || [];
    return (data?.users || []).filter((account) => [account.name, account.username, account.email, account.employeeId].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [data, searchTerm]);
  const updateModules = (current, key) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
  return { isAdmin, checkingAccess, data, error, setError, saving, setSaving, toast, setToast, newModules, setNewModules, drafts, setDrafts,
    searchInput, setSearchInput, searchTerm, setSearchTerm, resetPasswordUser, setResetPasswordUser, reload, visibleUsers, updateModules };
}
