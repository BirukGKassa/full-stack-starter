import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadProductionData, productionApi } from '../../lib/production-api.js';
import { companies } from './constants.js';
import { companyMatches } from './utils.js';

export default function useProductionData() {
  const [selectedCompany, setSelectedCompany] = useState('AMH');
  const [resources, setResources] = useState({});
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const [workstation, setWorkstation] = useState(() => {
    try { return localStorage.getItem('lyu-erp-workstation') || ''; }
    catch { return ''; }
  });
  const refresh = useCallback(async (showSpinner = true) => {
    if (showSpinner) setRefreshing(true);
    try {
      const currentAccess = await productionApi.getAccess();
      setAccess(currentAccess);
      setResources(await loadProductionData(currentAccess.modules, currentAccess.user?.isAdmin));
    } catch (error) { setToast({ kind: 'error', message: error.message || 'Could not load production permissions.' }); }
    finally { setLoading(false); if (showSpinner) setRefreshing(false); }
  }, []);
  useEffect(() => { refresh(false); }, [refresh]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4800);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const data = useMemo(() => Object.fromEntries(Object.entries(resources).map(([key, resource]) => [key, resource?.data || []])), [resources]);
  const code = selectedCompany;
  const scoped = useMemo(() => ({
    boms: (data.boms || []).filter((row) => companyMatches(row, code, ['productSku'])),
    workCenters: (data.workCenters || []).filter((row) => companyMatches(row, code, ['code', 'plantId'])),
    orders: (data.orders || []).filter((row) => companyMatches(row, code, ['orderNumber', 'productSku'])),
    productionLogs: (data.productionLogs || []).filter((row) => companyMatches(row, code, ['workCenterCode'])),
    downtime: (data.downtime || []).filter((row) => companyMatches(row, code, ['workCenterCode'])),
    downtimeReasons: (data.downtimeReasons || []).filter((row) => companyMatches(row, code, ['reasonCode'])),
    qualityInspections: (data.qualityInspections || []).filter((row) => {
      const order = (data.orders || []).find((item) => item.id === row.manufacturingOrderId);
      return order && companyMatches(order, code, ['orderNumber', 'productSku']);
    }),
    tools: (data.tools || []).filter((row) => companyMatches(row, code, ['code', 'assignedWorkCenterCode'])),
    materialLots: (data.materialLots || []).filter((row) => {
      const order = (data.orders || []).find((item) => item.id === row.manufacturingOrderId);
      return order && companyMatches(order, code, ['orderNumber', 'productSku']);
    }),
    machineOee: (data.machineOee || []).filter((row) => companyMatches(row, code, ['workCenterCode'])),
  }), [data, code]);
  function updateWorkstation(value) {
    const label = value.slice(0, 100); setWorkstation(label);
    try { localStorage.setItem('lyu-erp-workstation', label); }
    catch (error) { setToast({ kind: 'error', message: `Could not save workstation label: ${error.message}` }); }
  }
  const companyName = companies.find((company) => company.code === code)?.name || 'All factories';
  return { selectedCompany, setSelectedCompany, resources, access, loading, refreshing, toast, setToast, workstation,
    refresh, updateWorkstation, data, code, scoped, companyName, isAdmin: Boolean(access?.user?.isAdmin), auditEntries: data.audit || [] };
}
