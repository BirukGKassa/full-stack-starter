import { useEffect, useState } from 'react';
import { systemApi } from '../../../lib/system-api.js';

export default function useSystemAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [overview, setOverview] = useState(null);
  const [licenseData, setLicenseData] = useState(null);
  const [company, setCompany] = useState({});
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  async function reload() {
    setLoading(true);
    try {
      const result = await systemApi.getLicenseStatus();
      setLicenseData(result);
      if (result.license.isActive) {
        const details = await systemApi.getAdminOverview();
        setOverview(details); setCompany(details.company || {});
      } else setOverview(null);
      setError('');
    } catch (loadError) { setError(loadError.message || 'Could not load system information.'); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    let active = true;
    systemApi.getLicenseStatus().then((result) => {
      if (active) { setIsAdmin(true); setLicenseData(result); }
    }).catch((accessError) => { if (active) setError(accessError.message || 'Could not verify administrator access.'); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);
  return { isAdmin, checking, overview, setOverview, licenseData, setLicenseData, company, setCompany,
    licenseKey, setLicenseKey, loading, setLoading, error, setError, toast, setToast, reload };
}
