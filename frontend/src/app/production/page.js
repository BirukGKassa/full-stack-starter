import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { authClient } from '../../lib/auth-client.js';
import Brand from '../components/brand.js';
import DowntimeView from './views/downtime.js';
import OverviewView from './views/overview.js';
import ProductionEntryView from './views/production-entry.js';
import ProductsView from './views/products.js';
import OrdersView from './views/orders.js';
import MachinesView from './views/machines.js';
import QualityView from './views/quality.js';
import ReportsView from './views/reports.js';
import ProductionShell from './components/production-shell.js';
import { navigation } from './constants.js';
import useProductionActions from './use-production-actions.js';
import useProductionData from './use-production-data.js';
import useProductionMetrics from './use-production-metrics.js';
import { formatDate, formatNumber } from './utils.js';

export default function ProductionPage() {
  const { data: session, isPending } = authClient.useSession();
  const [activeView, setActiveView] = useState('overview');
  const [downtimeCount, setDowntimeCount] = useState(1);
  const workspace = useProductionData();
  const metrics = useProductionMetrics(workspace.scoped, workspace.setToast);
  const actions = useProductionActions(workspace.refresh, workspace.setToast);
  useEffect(() => {
    if (!workspace.access?.modules?.length) return;
    if (!workspace.access.modules.includes(activeView)) setActiveView(workspace.access.modules[0]);
  }, [workspace.access, activeView]);
  if (isPending) return <div className="page-loading">Loading production workspace<span>✳</span></div>;
  if (!session?.user) return <Navigate to="/go?mode=signin" replace />;
  if (!workspace.loading && workspace.access?.modules?.length === 0) {
    return <main className="prod-no-access"><Brand /><h1>No production modules assigned</h1><p>Ask your administrator to assign the modules you need.</p><Link to="/dashboard">Return to dashboard</Link></main>;
  }
  const { code, scoped, refresh, loading, access, isAdmin, companyName, workstation, updateWorkstation, refreshing } = workspace;
  const orderOptions = scoped.orders.map((order) => ({ value: order.id, label: `${order.orderNumber} · ${order.productSku}` }));
  const bomOptions = scoped.boms.map((bom) => ({ value: bom.id, label: `${bom.productSku} · ${bom.productName}` }));
  const machineOptions = scoped.workCenters.map((center) => ({ value: center.code, label: `${center.code} · ${center.name}` }));
  const reasonOptions = scoped.downtimeReasons.map((reason) => ({ value: reason.id, label: `${reason.reasonCode} · ${reason.description}` }));
  const viewProps = { code, scoped, submit: actions.submit, saving: actions.saving, formatDate, formatNumber, loadDetails: actions.loadDetails, openBomEditor: actions.openBomEditor, runAction: actions.runAction, setActiveView, companyName, ...metrics };
  const viewContent = {
    overview: <OverviewView {...viewProps} />,
    production: <ProductionEntryView code={code} orderOptions={orderOptions} machineOptions={machineOptions} reasonOptions={reasonOptions} scoped={scoped} recentLogs={metrics.recentLogs} saving={actions.saving} submit={actions.submit} refresh={refresh} formatNumber={formatNumber} actor={access?.user} workstation={workstation} onWorkstationChange={updateWorkstation} />,
    downtime: <DowntimeView code={code} machineOptions={machineOptions} reasonOptions={reasonOptions} scoped={scoped} saving={actions.saving} submit={actions.submit} runAction={actions.runAction} downtimeCount={downtimeCount} setDowntimeCount={setDowntimeCount} formatDate={formatDate} formatNumber={formatNumber} />,
    products: <ProductsView {...viewProps} />, orders: <OrdersView {...viewProps} bomOptions={bomOptions} />,
    machines: <MachinesView {...viewProps} machineOptions={machineOptions} />, quality: <QualityView {...viewProps} orderOptions={orderOptions} />,
    reports: <ReportsView {...viewProps} />,
  }[activeView];
  return <ProductionShell session={session} access={access} isAdmin={isAdmin} activeView={activeView} setActiveView={setActiveView} activeDowntime={metrics.activeDowntime} workstation={workstation} updateWorkstation={updateWorkstation}
    currentNav={navigation.find((item) => item.id === activeView)} refreshing={refreshing} refresh={refresh} loading={loading} code={code} apiErrors={Object.entries(workspace.resources).filter(([, value]) => value?.error)} viewContent={viewContent}
    auditEntries={workspace.auditEntries} actions={actions} toast={workspace.toast} setToast={workspace.setToast} />;
}
