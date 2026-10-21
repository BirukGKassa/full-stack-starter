import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { authClient } from '../../lib/auth-client.js';
import { loadProductionData, productionApi } from '../../lib/production-api.js';
import Brand from '../components/brand.js';
import { AuditContext, DataTable, EntryCard, Input, MetricCard, Select, Textarea } from './components/ui.js';
import DowntimeView from './views/downtime.js';
import ProductionEntryView from './views/production-entry.js';

const companies = [
  { code: 'AMH', name: 'Aluminum extrusion' },
  { code: 'AMR', name: 'PP woven bags' },
  { code: 'KORKI', name: 'Bottle closures' },
  { code: 'RASA', name: 'Flour milling' },
];

const navigation = [
  { id: 'overview', label: 'Overview', icon: '◫', group: 'WORKSPACE' },
  { id: 'production', label: 'Production entry', icon: '＋', group: 'DATA ENTRY' },
  { id: 'downtime', label: 'Machine downtime', icon: '◷', group: 'DATA ENTRY' },
  { id: 'products', label: 'Products & BOMs', icon: '◇', group: 'OPERATIONS' },
  { id: 'orders', label: 'Work orders', icon: '▤', group: 'OPERATIONS' },
  { id: 'machines', label: 'Machines & tools', icon: '⚙', group: 'OPERATIONS' },
  { id: 'quality', label: 'Quality & traceability', icon: '◉', group: 'OPERATIONS' },
  { id: 'reports', label: 'Reports', icon: '▥', group: 'INSIGHTS' },
];

const resourceErrors = {
  boms: 'Bill of materials',
  workCenters: 'Work centers',
  orders: 'Work orders',
  productionLogs: 'Production logs',
  downtime: 'Downtime logs',
  downtimeReasons: 'Downtime reasons',
  qualityInspections: 'Quality inspections',
  tools: 'Factory tools',
  materialLots: 'Material traceability',
  machineOee: 'Machine OEE',
};

function toIso(value) {
  return value ? new Date(value).toISOString() : null;
}

function formatNumber(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function companyMatches(record, company, keys) {
  if (!company) return true;
  if (record.companyId) return record.companyId === company;
  return keys.some((key) => String(record[key] || '').toUpperCase().startsWith(`${company}-`) || String(record[key] || '').toUpperCase() === company);
}

function dateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function weekKey(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const weekOne = new Date(date.getFullYear(), 0, 4);
  const week = 1 + Math.round(((date - weekOne) / 86400000 - 3 + ((weekOne.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function reportCsv(rows, periodType) {
  const header = ['period', 'good_output', 'scrap', 'downtime_minutes', 'production_shifts'];
  const content = [header, ...rows.map((row) => [row.period, row.output, row.scrap, row.downtime, row.shifts])]
    .map((line) => line.map((item) => `"${String(item).replaceAll('"', '""')}"`).join(','))
    .join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `production-${periodType}-report.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ProductionPage() {
  const { data: session, isPending } = authClient.useSession();
  const [activeView, setActiveView] = useState('overview');
  const [selectedCompany, setSelectedCompany] = useState('AMH');
  const [resources, setResources] = useState({});
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [reportType, setReportType] = useState('week');
  const [reportDays, setReportDays] = useState(30);
  const [operatorId, setOperatorId] = useState('');
  const [operatorReport, setOperatorReport] = useState(null);
  const [details, setDetails] = useState(null);
  const [editingBom, setEditingBom] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [downtimeCount, setDowntimeCount] = useState(1);
  const [workstation, setWorkstation] = useState(() => {
    try {
      return localStorage.getItem('lyu-erp-workstation') || '';
    } catch {
      return '';
    }
  });

  const refresh = useCallback(async (showSpinner = true) => {
    if (showSpinner) setRefreshing(true);
    try {
      const currentAccess = await productionApi.getAccess();
      setAccess(currentAccess);
      setResources(await loadProductionData(currentAccess.modules, currentAccess.user?.isAdmin));
    } catch (error) {
      setToast({ kind: 'error', message: error.message || 'Could not load production permissions.' });
    } finally {
      setLoading(false);
      if (showSpinner) setRefreshing(false);
    }
  }, []);

  useEffect(() => { refresh(false); }, [refresh]);
  useEffect(() => {
    if (!access?.modules?.length) return;
    if (!access.modules.includes(activeView)) setActiveView(access.modules[0]);
  }, [access, activeView]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const data = useMemo(() => Object.fromEntries(
    Object.entries(resources).map(([key, resource]) => [key, resource?.data || []]),
  ), [resources]);
  const code = selectedCompany;
  const isAdmin = Boolean(access?.user?.isAdmin);
  const companyName = companies.find((company) => company.code === code)?.name || 'All factories';
  const auditEntries = data.audit || [];

  function updateWorkstation(value) {
    const label = value.slice(0, 100);
    setWorkstation(label);
    try {
      localStorage.setItem('lyu-erp-workstation', label);
    } catch (error) {
      setToast({ kind: 'error', message: `Could not save workstation label: ${error.message}` });
    }
  }

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

  const today = dateKey(new Date());
  const todayLogs = scoped.productionLogs.filter((log) => dateKey(log.startTime) === today);
  const outputToday = todayLogs.reduce((total, log) => total + Number(log.outputQuantity || 0), 0);
  const openOrders = scoped.orders.filter((order) => order.status !== 'Completed').length;
  const activeDowntime = scoped.downtime.filter((log) => !log.endTime);
  const averageOee = scoped.machineOee.length
    ? scoped.machineOee.reduce((total, row) => total + Number(row.oeeScore || 0), 0) / scoped.machineOee.length
    : null;
  const recentProduction = scoped.productionLogs.filter((log) => {
    const stamp = new Date(log.startTime);
    return !Number.isNaN(stamp.getTime()) && stamp >= new Date(Date.now() - 30 * 86400000);
  });
  const recentDowntimeMinutes = scoped.downtime.reduce((sum, log) => {
    const stamp = new Date(log.startTime);
    return stamp >= new Date(Date.now() - 30 * 86400000) ? sum + Number(log.durationMinutes || 0) : sum;
  }, 0);
  const plannedMinutes = recentProduction.reduce((sum, log) => sum + Number(log.durationMinutes || 0), 0);
  const estimatedOee = plannedMinutes > 0
    ? Math.max(0, ((plannedMinutes - recentDowntimeMinutes) / plannedMinutes)
      * (recentProduction.reduce((sum, log) => sum + Number(log.outputQuantity || 0), 0)
        / Math.max(1, recentProduction.reduce((sum, log) => sum + Number(log.outputQuantity || 0) + Number(log.scrapQuantity || 0), 0))) * 100)
    : null;
  const recentLogs = [...scoped.productionLogs].sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).slice(0, 8);
  const apiErrors = Object.entries(resources).filter(([, value]) => value?.error);

  async function submit(event, action, successMessage) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSaving(true);
    try {
      await action(new FormData(formElement));
      formElement.reset();
      setToast({ kind: 'success', message: successMessage });
      await refresh(false);
      return true;
    } catch (error) {
      setToast({ kind: 'error', message: error.message || 'Unable to save this entry.' });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function runAction(action, successMessage) {
    try {
      await action();
      setToast({ kind: 'success', message: successMessage });
      await refresh(false);
    } catch (error) {
      setToast({ kind: 'error', message: error.message || 'The action could not be completed.' });
    }
  }

  async function loadDetails(label, load) {
    setDetailLoading(true);
    try {
      setDetails({ label, data: await load() });
    } catch (error) {
      setToast({ kind: 'error', message: error.message || 'Unable to load record details.' });
    } finally {
      setDetailLoading(false);
    }
  }

  async function openBomEditor(bom) {
    setDetailLoading(true);
    try {
      setEditingBom(await productionApi.getBom(bom.id));
    } catch (error) {
      setToast({ kind: 'error', message: error.message || 'Unable to load this product recipe.' });
    } finally {
      setDetailLoading(false);
    }
  }

  async function saveBomEdit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await productionApi.updateBom(editingBom.id, {
        productName: String(form.get('productName')).trim(),
        standardRunMinutes: Number(form.get('standardRunMinutes')),
      });
      setEditingBom(null);
      setToast({ kind: 'success', message: 'Product recipe updated.' });
      await refresh(false);
    } catch (error) {
      setToast({ kind: 'error', message: error.message || 'Unable to update the product recipe.' });
    }
  }

  async function generateOperatorReport(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const startDate = form.get('startDate');
    const endDate = form.get('endDate');
    const id = String(form.get('operatorId') || '').trim();
    if (!id) {
      setToast({ kind: 'error', message: 'Enter an operator ID to generate this report.' });
      return;
    }
    try {
      setOperatorReport(await productionApi.getOperatorPerformance(id, startDate, endDate));
    } catch (error) {
      setToast({ kind: 'error', message: error.message || 'Could not generate the operator report.' });
    }
  }

  const reportRows = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(reportDays));
    const groups = new Map();
    for (const log of scoped.productionLogs) {
      const stamp = new Date(log.startTime);
      if (Number.isNaN(stamp.getTime()) || stamp < cutoff) continue;
      const key = reportType === 'month'
        ? `${stamp.getFullYear()}-${String(stamp.getMonth() + 1).padStart(2, '0')}`
        : weekKey(stamp);
      const current = groups.get(key) || { period: key, output: 0, scrap: 0, downtime: 0, shifts: 0 };
      current.output += Number(log.outputQuantity || 0);
      current.scrap += Number(log.scrapQuantity || 0);
      current.shifts += 1;
      groups.set(key, current);
    }
    for (const downtime of scoped.downtime) {
      const stamp = new Date(downtime.startTime);
      if (Number.isNaN(stamp.getTime()) || stamp < cutoff) continue;
      const key = reportType === 'month'
        ? `${stamp.getFullYear()}-${String(stamp.getMonth() + 1).padStart(2, '0')}`
        : weekKey(stamp);
      const current = groups.get(key) || { period: key, output: 0, scrap: 0, downtime: 0, shifts: 0 };
      current.downtime += Number(downtime.durationMinutes || 0);
      groups.set(key, current);
    }
    return [...groups.values()].sort((a, b) => b.period.localeCompare(a.period));
  }, [reportDays, reportType, scoped.downtime, scoped.productionLogs]);

  if (isPending) return <div className="page-loading">Loading production workspace<span>✳</span></div>;
  if (!session?.user) return <Navigate to="/go?mode=signin" replace />;
  if (!loading && access?.modules?.length === 0) {
    return <main className="prod-no-access"><Brand /><h1>No production modules assigned</h1><p>Ask your administrator to assign the modules you need.</p><Link to="/dashboard">Return to dashboard</Link></main>;
  }

  const currentNav = navigation.find((item) => item.id === activeView);
  const orderOptions = scoped.orders.map((order) => ({ value: order.id, label: `${order.orderNumber} · ${order.productSku}` }));
  const bomOptions = scoped.boms.map((bom) => ({ value: bom.id, label: `${bom.productSku} · ${bom.productName}` }));
  const machineOptions = scoped.workCenters.map((center) => ({ value: center.code, label: `${center.code} · ${center.name}` }));
  const reasonOptions = scoped.downtimeReasons.map((reason) => ({ value: reason.id, label: `${reason.reasonCode} · ${reason.description}` }));

  const renderOverview = () => (
    <>
      <section className="prod-welcome">
        <div>
          <p className="prod-eyebrow">PRODUCTION CONTROL ROOM</p>
          <h1>Good work starts<br /><em>on the floor.</em></h1>
          <p>Live production, quality, and machine activity for {companyName}.</p>
        </div>
        <button className="prod-button prod-button-primary" onClick={() => setActiveView('production')}>＋ Record a shift</button>
      </section>
      <section className="prod-metrics-grid" aria-label="Production summary">
        <MetricCard label="Good output today" value={`${formatNumber(outputToday)} ${todayLogs[0]?.outputUnit || ''}`} note={`${todayLogs.length} shift logs recorded today`} icon="↗" />
        <MetricCard label="Open work orders" value={formatNumber(openOrders, 0)} note="In progress or awaiting production" tone="blue" icon="▤" />
        <MetricCard label="Machine OEE" value={averageOee === null && estimatedOee === null ? '—' : `${formatNumber(averageOee ?? estimatedOee)}%`} note={averageOee === null ? (estimatedOee === null ? 'Record shifts to calculate an estimate' : 'Estimated from logged output and downtime') : `${scoped.machineOee.length} shift summaries`} tone="gold" icon="◉" />
        <MetricCard label="Machines down" value={formatNumber(activeDowntime.length, 0)} note={activeDowntime.length ? 'Open stoppages need attention' : 'No open downtime incidents'} tone={activeDowntime.length ? 'red' : 'green'} icon="◷" />
      </section>
      <div className="prod-content-grid">
        <section className="prod-card">
          <div className="prod-card-heading"><div><h2>Recent shift entries</h2><p>Latest shop-floor production reports</p></div><button className="prod-text-button" onClick={() => setActiveView('production')}>View all ↗</button></div>
          <DataTable columns={[
            { key: 'startTime', label: 'Date', render: (row) => formatDate(row.startTime) },
            { key: 'workCenterCode', label: 'Machine' },
            { key: 'operatorId', label: 'Operator' },
            { key: 'shiftName', label: 'Shift' },
            { key: 'outputQuantity', label: 'Good output', render: (row) => `${formatNumber(row.outputQuantity)} ${row.outputUnit || ''}` },
            { key: 'scrapQuantity', label: 'Scrap', render: (row) => formatNumber(row.scrapQuantity) },
          ]} rows={recentLogs} empty="Record a production shift to see it here." />
        </section>
        <section className="prod-card prod-downtime-card">
          <div className="prod-card-heading"><div><h2>Downtime watch</h2><p>Machines needing an operator update</p></div><span className={`prod-pill ${activeDowntime.length ? 'prod-pill-red' : 'prod-pill-green'}`}>{activeDowntime.length} active</span></div>
          {activeDowntime.length ? activeDowntime.slice(0, 5).map((incident) => (
            <div className="prod-incident" key={incident.id}><span className="prod-incident-dot" /><div><strong>{incident.workCenterCode}</strong><small>Since {new Date(incident.startTime).toLocaleString()}</small></div><button className="prod-text-button" onClick={() => runAction(() => productionApi.resolveDowntime(incident.id, { endTime: new Date().toISOString() }), 'Downtime incident resolved.')}>Resolve</button></div>
          )) : <div className="prod-calm-state"><span>✓</span><strong>All lines are clear</strong><p>New stoppages will appear here.</p></div>}
          <button className="prod-button prod-button-outline prod-full-button" onClick={() => setActiveView('downtime')}>＋ Log machine downtime</button>
        </section>
      </div>
    </>
  );

  const renderProducts = () => (
    <>
      <div className="prod-page-heading"><p className="prod-eyebrow">OPERATIONS · PRODUCT SETUP</p><h1>Products & bills of materials</h1><p>Set up recipes and component usage before releasing manufacturing orders.</p></div>
      <EntryCard title="Create a product recipe" description="Define a finished product and its standard raw material component." onSubmit={(event) => submit(event, (form) => {
        const componentSku = String(form.get('componentSku') || '').trim();
        return productionApi.createBom({
          productSku: String(form.get('productSku')).trim().toUpperCase(),
          productName: String(form.get('productName')).trim(),
          outputQty: Number(form.get('outputQty')),
          outputUnit: String(form.get('outputUnit')).trim(),
          standardRunMinutes: Number(form.get('standardRunMinutes') || 0),
          metadata: { factory: code, productFamily: String(form.get('productFamily') || '').trim() },
          lines: componentSku ? [{
            componentSku: componentSku.toUpperCase(),
            componentName: String(form.get('componentName')).trim(),
            quantityReq: Number(form.get('quantityReq')),
            unitOfMeasure: String(form.get('unitOfMeasure')).trim(),
            unitCost: Number(form.get('unitCost') || 0),
            scrapFactor: Number(form.get('scrapFactor') || 0),
          }] : [],
        });
      }, 'Product recipe and component saved.')} busy={saving}>
        <Input label="Product SKU" name="productSku" placeholder={`${code}-PRODUCT-01`} />
        <Input label="Product name" name="productName" />
        <Input label="Standard output quantity" name="outputQty" type="number" min="0.01" step="0.01" defaultValue="1" />
        <Input label="Output unit" name="outputUnit" placeholder="piece, kg, meter…" />
        <Input label="Standard run time (minutes)" name="standardRunMinutes" type="number" min="0" step="0.1" required={false} defaultValue="0" />
        <Input label="Product family" name="productFamily" required={false} placeholder="Optional category" />
        <div className="prod-form-divider"><span>OPTIONAL · FIRST RAW MATERIAL COMPONENT</span></div>
        <Input label="Component SKU" name="componentSku" required={false} />
        <Input label="Component name" name="componentName" required={false} />
        <Input label="Quantity required" name="quantityReq" type="number" min="0" step="0.001" required={false} />
        <Input label="Component unit" name="unitOfMeasure" required={false} placeholder="kg, piece, liter…" />
        <Input label="Unit cost" name="unitCost" type="number" min="0" step="0.001" required={false} defaultValue="0" />
        <Input label="Scrap factor" name="scrapFactor" type="number" min="0" step="0.001" required={false} defaultValue="0" />
      </EntryCard>
      <section className="prod-card prod-table-card"><div className="prod-card-heading"><div><h2>Active recipes · {code}</h2><p>Recipes are available when creating new manufacturing orders.</p></div></div>
        <DataTable columns={[
          { key: 'productSku', label: 'SKU' }, { key: 'productName', label: 'Product' }, { key: 'outputQty', label: 'Batch output', render: (row) => `${formatNumber(row.outputQty)} ${row.outputUnit}` },
          { key: 'standardRunMinutes', label: 'Run minutes' }, { key: 'actions', label: 'Actions', render: (row) => <div className="prod-row-actions"><button className="prod-text-button" onClick={() => loadDetails('BOM recipe', () => productionApi.getBom(row.id))}>View recipe</button><button className="prod-text-button" onClick={() => openBomEditor(row)}>Edit</button><button className="prod-text-button prod-danger-text" onClick={() => { if (window.confirm(`Deactivate ${row.productSku}? Existing orders will not be changed.`)) runAction(() => productionApi.deactivateBom(row.id), 'BOM deactivated.'); }}>Deactivate</button></div> },
        ]} rows={scoped.boms} empty="Create a recipe to add your factory's first product." />
      </section>
    </>
  );

  const renderOrders = () => (
    <>
      <div className="prod-page-heading"><p className="prod-eyebrow">OPERATIONS · PLANNING</p><h1>Work orders</h1><p>Create production orders, monitor progress, and keep planned quantities in view.</p></div>
      <EntryCard title="Create manufacturing order" description="Choose an active BOM and set the target quantity." onSubmit={(event) => submit(event, (form) => productionApi.createOrder({
        companyId: code,
        orderNumber: String(form.get('orderNumber')).trim(),
        bomId: form.get('bomId'),
        productSku: form.get('productSku'),
        targetQuantity: Number(form.get('targetQuantity')),
        priority: form.get('priority'),
        batchNumber: String(form.get('batchNumber') || '').trim() || null,
        dueDate: form.get('dueDate') ? toIso(`${form.get('dueDate')}T23:59`) : null,
        notes: String(form.get('notes') || '').trim() || null,
      }), 'Work order created.')} busy={saving}>
        <Input label="Order number" name="orderNumber" placeholder={`${code}-MO-2026-001`} />
        <Select label="Bill of materials" name="bomId" options={bomOptions} placeholder={bomOptions.length ? 'Select a product recipe' : 'Create a BOM first'} />
        <Input label="Product SKU" name="productSku" placeholder="Finished product code" />
        <Input label="Target quantity" name="targetQuantity" type="number" min="0.01" step="0.01" />
        <Select label="Priority" name="priority" options={[{ value: 'Normal', label: 'Normal' }, { value: 'High', label: 'High' }, { value: 'Urgent', label: 'Urgent' }]} />
        <Input label="Batch number" name="batchNumber" required={false} placeholder="Optional lot or batch" />
        <Input label="Due date" name="dueDate" type="date" required={false} />
        <Textarea label="Instructions" name="notes" placeholder="Production notes or special requirements" />
      </EntryCard>
      <section className="prod-card prod-table-card">
        <div className="prod-card-heading"><div><h2>Orders · {code}</h2><p>{scoped.orders.length} orders in this factory</p></div></div>
        <DataTable columns={[
          { key: 'orderNumber', label: 'Order' },
          { key: 'productSku', label: 'Product' },
          { key: 'targetQuantity', label: 'Target', render: (row) => formatNumber(row.targetQuantity) },
          { key: 'producedQty', label: 'Produced', render: (row) => formatNumber(row.producedQty) },
          { key: 'status', label: 'Status', render: (row) => <span className={`prod-pill ${row.status === 'Completed' ? 'prod-pill-green' : 'prod-pill-blue'}`}>{row.status}</span> },
          { key: 'dueDate', label: 'Due', render: (row) => formatDate(row.dueDate) },
          { key: 'actions', label: 'Actions', render: (row) => <div className="prod-row-actions"><button className="prod-text-button" onClick={() => loadDetails('Manufacturing order', () => productionApi.getOrder(row.id))}>Details</button><button className="prod-text-button" onClick={() => loadDetails('Order progress', () => productionApi.getOrderProgress(row.id))}>Progress</button>{row.status !== 'Completed' && <button className="prod-text-button" onClick={() => { const nextStatus = row.status === 'Draft' ? 'In Progress' : 'Completed'; if (nextStatus !== 'Completed' || window.confirm(`Mark ${row.orderNumber} as completed?`)) runAction(() => productionApi.updateOrderStatus(row.id, nextStatus), nextStatus === 'In Progress' ? 'Order moved to in progress.' : 'Order marked complete.'); }}>{row.status === 'Draft' ? 'Start' : 'Complete'}</button>}</div> },
        ]} rows={scoped.orders} empty="Create a work order to begin tracking production." />
      </section>
      <section className="prod-card prod-table-card"><div className="prod-card-heading"><div><h2>Product recipes</h2><p>Bills of materials available to this factory</p></div><button className="prod-text-button" onClick={() => setActiveView('machines')}>Add a machine ↗</button></div>
        <DataTable columns={[
          { key: 'productSku', label: 'SKU' }, { key: 'productName', label: 'Product' }, { key: 'outputQty', label: 'Batch output', render: (row) => `${formatNumber(row.outputQty)} ${row.outputUnit}` }, { key: 'standardRunMinutes', label: 'Run minutes' },
          { key: 'actions', label: '', render: (row) => <div className="prod-row-actions"><button className="prod-text-button" onClick={() => loadDetails('BOM recipe', () => productionApi.getBom(row.id))}>View recipe</button><button className="prod-text-button prod-danger-text" onClick={() => runAction(() => productionApi.deactivateBom(row.id), 'BOM deactivated.')}>Deactivate</button></div> },
        ]} rows={scoped.boms} empty="Add a bill of materials to make it available for orders." />
      </section>
    </>
  );

  const renderMachines = () => (
    <>
      <div className="prod-page-heading"><p className="prod-eyebrow">OPERATIONS · ASSETS</p><h1>Machines & tools</h1><p>Register production lines, manage tooling, and keep maintenance status current.</p></div>
      <div className="prod-content-grid prod-content-grid-even">
        <EntryCard title="Register a machine or line" description="Work center codes identify each line in production reports." onSubmit={(event) => submit(event, (form) => productionApi.createWorkCenter({
          plantId: `${code}-PLANT-01`,
          code: String(form.get('code')).trim().toUpperCase(),
          name: form.get('name'),
          factoryType: form.get('factoryType'),
          costPerHour: Number(form.get('costPerHour') || 0),
          nominalSpeed: Number(form.get('nominalSpeed') || 0),
          speedUnit: String(form.get('speedUnit') || '').trim() || null,
        }), 'Machine registered.')} busy={saving}>
          <Input label="Machine code" name="code" placeholder={`${code}-LINE-01`} />
          <Input label="Machine name" name="name" />
          <Input label="Factory type" name="factoryType" defaultValue={code.toLowerCase()} />
          <Input label="Hourly operating cost" name="costPerHour" type="number" min="0" step="0.01" required={false} defaultValue="0" />
          <Input label="Nominal speed" name="nominalSpeed" type="number" min="0" step="0.01" required={false} defaultValue="0" />
          <Input label="Speed unit" name="speedUnit" required={false} placeholder="pieces_per_hour" />
        </EntryCard>
        <EntryCard title="Register a tool or die" description="Track cycle life and assigned machine for maintenance planning." onSubmit={(event) => submit(event, (form) => productionApi.createTool({
          code: String(form.get('code')).trim().toUpperCase(),
          name: form.get('name'),
          toolType: form.get('toolType'),
          maxCycles: Number(form.get('maxCycles')),
          assignedWorkCenterCode: String(form.get('assignedWorkCenterCode') || '').trim() || null,
        }), 'Tool registered.')} busy={saving}>
          <Input label="Tool code" name="code" placeholder={`${code}-TOOL-01`} />
          <Input label="Tool name" name="name" />
          <Input label="Tool type" name="toolType" placeholder="die, mold, roller…" />
          <Input label="Maximum cycles" name="maxCycles" type="number" min="1" />
          <Select label="Assigned work center" name="assignedWorkCenterCode" options={machineOptions} required={false} placeholder="Unassigned" />
        </EntryCard>
      </div>
      <section className="prod-card prod-table-card"><div className="prod-card-heading"><div><h2>Registered work centers</h2><p>Machine state and line details</p></div></div><DataTable columns={[
        { key: 'code', label: 'Code' }, { key: 'name', label: 'Work center' }, { key: 'factoryType', label: 'Type' },
        { key: 'status', label: 'Status', render: (row) => <span className={`prod-pill ${row.status === 'Active' ? 'prod-pill-green' : 'prod-pill-gold'}`}>{row.status}</span> },
        { key: 'nominalSpeed', label: 'Nominal speed', render: (row) => `${formatNumber(row.nominalSpeed)} ${row.speedUnit || ''}` },
        { key: 'actions', label: 'Actions', render: (row) => <div className="prod-row-actions"><button className="prod-text-button" onClick={() => loadDetails('Work center', () => productionApi.getWorkCenter(row.code))}>Details</button><button className="prod-text-button" onClick={() => runAction(() => productionApi.updateWorkCenter(row.code, { status: row.status === 'Active' ? 'Maintenance' : 'Active' }), row.status === 'Active' ? 'Machine marked for maintenance.' : 'Machine returned to active status.')}>{row.status === 'Active' ? 'Mark maintenance' : 'Set active'}</button></div> },
      ]} rows={scoped.workCenters} empty="Register a work center before entering production." /></section>
      <section className="prod-card prod-table-card"><div className="prod-card-heading"><div><h2>Tooling register</h2><p>Cycle life and maintenance actions</p></div></div><DataTable columns={[
        { key: 'code', label: 'Tool code' }, { key: 'name', label: 'Tool' }, { key: 'assignedWorkCenterCode', label: 'Machine' },
        { key: 'lifetime', label: 'Cycle life', render: (row) => `${formatNumber(row.currentCycles)} / ${formatNumber(row.maxCycles)}` },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: '', render: (row) => <div className="prod-row-actions"><button className="prod-text-button" onClick={() => {
          const cycles = Number(window.prompt(`Cycles to add to ${row.code}`, '100'));
          if (Number.isFinite(cycles) && cycles > 0) runAction(() => productionApi.addToolCycles(row.code, cycles), 'Tool cycle count updated.');
        }}>Add cycles</button><button className="prod-text-button" onClick={() => runAction(() => productionApi.serviceTool(row.code), 'Tool maintenance recorded.')}>Service</button></div> },
      ]} rows={scoped.tools} empty="No tools have been registered for this factory." /></section>
    </>
  );

  const renderQuality = () => (
    <>
      <div className="prod-page-heading"><p className="prod-eyebrow">OPERATIONS · PRODUCT INTEGRITY</p><h1>Quality & traceability</h1><p>Capture inspections and raw-material lot usage against each manufacturing order.</p></div>
      <div className="prod-content-grid prod-content-grid-even">
        <EntryCard title="Record quality inspection" description="Pass/fail status is evaluated using the measurement limits." onSubmit={(event) => submit(event, (form) => productionApi.createQualityInspection({
          manufacturingOrderId: form.get('manufacturingOrderId'),
          inspectorId: String(form.get('inspectorId')).trim(),
          inspectionType: String(form.get('inspectionType')).trim(),
          measuredValue: Number(form.get('measuredValue')),
          targetValue: Number(form.get('targetValue')),
          lowerLimit: form.get('lowerLimit') === '' ? null : Number(form.get('lowerLimit')),
          upperLimit: form.get('upperLimit') === '' ? null : Number(form.get('upperLimit')),
          sampleSize: Number(form.get('sampleSize') || 1),
          notes: String(form.get('notes') || '').trim() || null,
        }), 'Quality inspection saved.')} busy={saving}>
          <Select label="Manufacturing order" name="manufacturingOrderId" options={orderOptions} placeholder={orderOptions.length ? 'Select an order' : 'Create an order first'} />
          <Input label="Inspector ID" name="inspectorId" placeholder={`${code}-QA-01`} />
          <Input label="Inspection type" name="inspectionType" placeholder="thickness, gsm, moisture…" />
          <Input label="Measured value" name="measuredValue" type="number" step="0.001" />
          <Input label="Target value" name="targetValue" type="number" step="0.001" />
          <Input label="Lower limit" name="lowerLimit" type="number" step="0.001" required={false} />
          <Input label="Upper limit" name="upperLimit" type="number" step="0.001" required={false} />
          <Input label="Sample size" name="sampleSize" type="number" min="1" defaultValue="1" />
          <Textarea label="Inspection notes" name="notes" />
        </EntryCard>
        <EntryCard title="Trace material lot" description="Connect supplier raw-material batches to a finished production order." onSubmit={(event) => submit(event, (form) => productionApi.createMaterialLot({
          manufacturingOrderId: form.get('manufacturingOrderId'),
          componentSku: String(form.get('componentSku')).trim(),
          lotNumber: String(form.get('lotNumber')).trim(),
          quantityUsed: Number(form.get('quantityUsed')),
          unitOfMeasure: String(form.get('unitOfMeasure')).trim(),
        }), 'Material lot linked to work order.')} busy={saving}>
          <Select label="Manufacturing order" name="manufacturingOrderId" options={orderOptions} placeholder={orderOptions.length ? 'Select an order' : 'Create an order first'} />
          <Input label="Component SKU" name="componentSku" placeholder="Raw material item code" />
          <Input label="Supplier lot number" name="lotNumber" />
          <Input label="Quantity used" name="quantityUsed" type="number" min="0" step="0.001" />
          <Input label="Unit of measure" name="unitOfMeasure" placeholder="kg, pieces, meter…" />
        </EntryCard>
      </div>
      <section className="prod-card prod-table-card"><div className="prod-card-heading"><div><h2>Inspection history</h2><p>Recorded quality results and tolerances</p></div></div><DataTable columns={[
        { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
        { key: 'manufacturingOrderId', label: 'Order', render: (row) => scoped.orders.find((order) => order.id === row.manufacturingOrderId)?.orderNumber || row.manufacturingOrderId },
        { key: 'inspectionType', label: 'Test' }, { key: 'reading', label: 'Measured / target', render: (row) => `${row.measuredValue} / ${row.targetValue}` },
        { key: 'status', label: 'Result', render: (row) => <span className={`prod-pill ${row.status === 'Pass' ? 'prod-pill-green' : 'prod-pill-red'}`}>{row.status}</span> },
      ]} rows={[...scoped.qualityInspections].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))} empty="Inspection records will appear here." /></section>
      <section className="prod-card prod-table-card"><div className="prod-card-heading"><div><h2>Material lot traceability</h2><p>Supplier lots consumed by each order</p></div></div><DataTable columns={[
        { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
        { key: 'manufacturingOrderId', label: 'Order', render: (row) => scoped.orders.find((order) => order.id === row.manufacturingOrderId)?.orderNumber || row.manufacturingOrderId },
        { key: 'componentSku', label: 'Component' }, { key: 'lotNumber', label: 'Supplier lot' }, { key: 'quantityUsed', label: 'Quantity', render: (row) => `${formatNumber(row.quantityUsed, 3)} ${row.unitOfMeasure}` },
      ]} rows={[...scoped.materialLots].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))} empty="Material lot usage will appear here." /></section>
    </>
  );

  const renderReports = () => (
    <>
      <div className="prod-page-heading"><p className="prod-eyebrow">INSIGHTS · REPORTING</p><h1>Production reports</h1><p>Turn shift entries into useful weekly and monthly summaries, ready to export.</p></div>
      <section className="prod-card prod-report-card">
        <div className="prod-report-controls">
          <label className="prod-field"><span>Period grouping</span><select value={reportType} onChange={(event) => setReportType(event.target.value)}><option value="week">Weekly</option><option value="month">Monthly</option></select></label>
          <label className="prod-field"><span>Date range</span><select value={reportDays} onChange={(event) => setReportDays(Number(event.target.value))}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="60">Last 60 days</option><option value="90">Last 90 days</option></select></label>
          <button className="prod-button prod-button-primary" onClick={() => reportCsv(reportRows, reportType)} disabled={!reportRows.length}>Download CSV</button>
        </div>
        <div className="prod-report-summary"><div><span>Periods in range</span><strong>{reportRows.length}</strong></div><div><span>Good output</span><strong>{formatNumber(reportRows.reduce((sum, row) => sum + row.output, 0))}</strong></div><div><span>Scrap</span><strong>{formatNumber(reportRows.reduce((sum, row) => sum + row.scrap, 0))}</strong></div><div><span>Downtime</span><strong>{formatNumber(reportRows.reduce((sum, row) => sum + row.downtime, 0))} min</strong></div></div>
        <DataTable columns={[
          { key: 'period', label: reportType === 'week' ? 'ISO week' : 'Month' }, { key: 'output', label: 'Good output', render: (row) => formatNumber(row.output) },
          { key: 'scrap', label: 'Scrap units', render: (row) => formatNumber(row.scrap) }, { key: 'downtime', label: 'Downtime', render: (row) => `${formatNumber(row.downtime)} min` },
          { key: 'shifts', label: 'Shift reports' }, { key: 'yield', label: 'Yield', render: (row) => `${formatNumber(row.output + row.scrap ? row.output / (row.output + row.scrap) * 100 : 0)}%` },
        ]} rows={reportRows} empty="No production entries in this date range. Record shifts to generate a report." />
      </section>
      <section className="prod-card prod-report-card">
        <div className="prod-card-heading"><div><h2>Operator performance</h2><p>Query the production analytics API for an operator and date range.</p></div></div>
        <form className="prod-report-controls" onSubmit={generateOperatorReport}>
          <label className="prod-field"><span>Operator ID</span><input name="operatorId" value={operatorId} onChange={(event) => setOperatorId(event.target.value)} placeholder={`${code}-OP-01`} required /></label>
          <label className="prod-field"><span>From</span><input type="date" name="startDate" defaultValue={dateKey(new Date(Date.now() - 30 * 86400000))} required /></label>
          <label className="prod-field"><span>To</span><input type="date" name="endDate" defaultValue={dateKey(new Date())} required /></label>
          <button className="prod-button prod-button-primary">Generate operator report</button>
        </form>
        {operatorReport?.summary && <div className="prod-report-summary"><div><span>Active hours</span><strong>{formatNumber(operatorReport.summary.totalActiveHours, 2)}</strong></div><div><span>Good units</span><strong>{formatNumber(operatorReport.summary.totalGoodUnitsProduced)}</strong></div><div><span>Units / hour</span><strong>{formatNumber(operatorReport.summary.averageProductivityPerHour, 2)}</strong></div><div><span>Scrap rate</span><strong>{operatorReport.summary.overallScrapRatePercentage}</strong></div></div>}
        {operatorReport?.shiftBreakdown && <DataTable columns={[
          { key: 'performanceDate', label: 'Date', render: (row) => formatDate(row.performanceDate) }, { key: 'workCenterCode', label: 'Machine' }, { key: 'shiftName', label: 'Shift' },
          { key: 'goodUnitsProduced', label: 'Good units', render: (row) => formatNumber(row.goodUnitsProduced) }, { key: 'totalActiveHours', label: 'Active hours', render: (row) => formatNumber(row.totalActiveHours, 2) },
        ]} rows={operatorReport.shiftBreakdown} empty="No operator records for this date range." />}
      </section>
    </>
  );

  const viewContent = {
    overview: renderOverview,
    production: () => <ProductionEntryView code={code} orderOptions={orderOptions} machineOptions={machineOptions} reasonOptions={reasonOptions} scoped={scoped} recentLogs={recentLogs} saving={saving} submit={submit} refresh={refresh} formatNumber={formatNumber} actor={access?.user} workstation={workstation} onWorkstationChange={updateWorkstation} />,
    downtime: () => <DowntimeView code={code} machineOptions={machineOptions} reasonOptions={reasonOptions} scoped={scoped} saving={saving} submit={submit} runAction={runAction} downtimeCount={downtimeCount} setDowntimeCount={setDowntimeCount} formatDate={formatDate} formatNumber={formatNumber} />,
    products: renderProducts,
    orders: renderOrders,
    machines: renderMachines,
    quality: renderQuality,
    reports: renderReports,
  }[activeView]?.();

  return (
    <AuditContext.Provider value={auditEntries}>
    <div className="prod-shell">
      <aside className="prod-sidebar">
        <Brand className="prod-brand" />
        {['WORKSPACE', 'DATA ENTRY', 'OPERATIONS', 'INSIGHTS'].map((group) => <div className="prod-nav-group" key={group}>
          <p>{group}</p>{navigation.filter((item) => item.group === group && (isAdmin || access?.modules?.includes(item.id))).map((item) => <button key={item.id} onClick={() => setActiveView(item.id)} className={`prod-nav-link ${activeView === item.id ? 'prod-nav-link-active' : ''}`}><span>{item.icon}</span>{item.label}{item.id === 'downtime' && activeDowntime.length > 0 && <i>{activeDowntime.length}</i>}</button>)}
        </div>)}
        <div className="prod-sidebar-bottom"><div className="prod-user"><span>{session.user.name?.[0]?.toUpperCase() || 'U'}</span><div><strong>{session.user.name}</strong><small>Production workspace</small></div></div><Link to="/dashboard" className="prod-back-link">← Personal dashboard</Link></div>
      </aside>
      <main className="prod-main">
        <header className="prod-topbar"><div><span className="prod-topbar-mobile">{currentNav?.label || 'System settings'}</span><span className="prod-breadcrumb">Lyu ERP <i>/</i> Production <i>/</i> <strong>{currentNav?.label || 'System settings'}</strong></span></div><div className="prod-topbar-right"><label className="prod-workstation-control" title="A label saved in this browser; the browser cannot read your PC hostname."><span>Workstation label</span><input aria-label="Workstation label" value={workstation} onChange={(event) => updateWorkstation(event.target.value)} placeholder="Name this workstation" /></label><span className="prod-live"><i /> Operations online</span><button className="prod-icon-button" aria-label="Refresh production data" onClick={() => refresh()} disabled={refreshing}>{refreshing ? '…' : '↻'}</button><span className="prod-user-initial">{session.user.name?.[0]?.toUpperCase() || 'U'}</span></div></header>
        {loading ? <div className="prod-loading"><span className="prod-loader" />Loading factory data…</div> : <div className="prod-view">
          <div className="prod-view-heading"><div><span className="prod-factory-chip">{code || 'ALL'} FACTORY</span><span className="prod-today-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span></div><button className="prod-button prod-button-outline" onClick={() => refresh()} disabled={refreshing}>{refreshing ? 'Refreshing…' : '↻ Refresh data'}</button></div>
            {apiErrors.length > 0 && <section className="prod-card prod-api-warning prod-global-warning"><strong>Some production services could not be reached.</strong><p>{apiErrors.map(([key, value]) => `${resourceErrors[key]}: ${value.error}`).join(' · ')}</p><button className="prod-text-button" onClick={() => refresh()}>Retry failed data ↻</button></section>}
          {viewContent}
          <footer className="prod-footer"><span>PRODUCTION OPERATIONS</span><span>{code || 'MULTI-FACTORY'} · {new Date().getFullYear()}</span></footer>
        </div>}
      </main>
      {detailLoading && <div className="prod-detail-backdrop"><div className="prod-detail-modal"><span className="prod-loader" />Loading details…</div></div>}
      {details && <div className="prod-detail-backdrop" role="presentation" onClick={() => setDetails(null)}><section className="prod-detail-modal" role="dialog" aria-modal="true" aria-label={details.label} onClick={(event) => event.stopPropagation()}><div className="prod-modal-heading"><div><span className="prod-eyebrow">RECORD DETAILS</span><h2>{details.label}</h2></div><button className="prod-icon-button" onClick={() => setDetails(null)} aria-label="Close details">×</button></div><pre>{JSON.stringify(details.data, null, 2)}</pre></section></div>}
      {editingBom && <div className="prod-detail-backdrop" role="presentation" onClick={() => setEditingBom(null)}><section className="prod-detail-modal" role="dialog" aria-modal="true" aria-label="Edit product recipe" onClick={(event) => event.stopPropagation()}><div className="prod-modal-heading"><div><span className="prod-eyebrow">PRODUCT SETUP</span><h2>Edit recipe</h2></div><button className="prod-icon-button" onClick={() => setEditingBom(null)} aria-label="Close edit form">×</button></div><p className="prod-edit-sku">{editingBom.productSku}</p><form className="prod-modal-form" onSubmit={saveBomEdit}><Input label="Product name" name="productName" defaultValue={editingBom.productName} /><Input label="Standard run time (minutes)" name="standardRunMinutes" type="number" min="0" step="0.1" defaultValue={editingBom.standardRunMinutes} /><button className="prod-button prod-button-primary">Save changes</button></form></section></div>}
      {toast && <div className={`prod-toast prod-toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}><span>{toast.kind === 'success' ? '✓' : '!'}</span><p>{toast.message}</p><button onClick={() => setToast(null)} aria-label="Dismiss notification">×</button></div>}
    </div>
    </AuditContext.Provider>
  );
}
