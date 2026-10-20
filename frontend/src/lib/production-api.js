const basePath = '/api/v1/production';

function workstationName() {
  try {
    return window.localStorage.getItem('lyu-erp-workstation')
      || 'Unlabeled workstation';
  } catch {
    return 'Unlabeled workstation';
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${basePath}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'X-Workstation-Name': workstationName(),
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || payload.error || `Request failed (${response.status})`);
  }
  return payload.data;
}

export const productionApi = {
  getAccess: () => request('/access'),
  listAudit: () => request('/audit?limit=250'),
  listUsers: () => request('/settings/users'),
  createUser: (body) => request('/settings/users', { method: 'POST', body }),
  updateUserModules: (userId, modules) => request(`/settings/users/${encodeURIComponent(userId)}/modules`, { method: 'PUT', body: { modules } }),
  listBoms: () => request('/boms'),
  createBom: (body) => request('/boms', { method: 'POST', body }),
  getBom: (id) => request(`/boms/${encodeURIComponent(id)}`),
  updateBom: (id, body) => request(`/boms/${encodeURIComponent(id)}`, { method: 'PUT', body }),
  deactivateBom: (id) => request(`/boms/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  listWorkCenters: () => request('/work-centers'),
  createWorkCenter: (body) => request('/work-centers', { method: 'POST', body }),
  getWorkCenter: (code) => request(`/work-centers/${encodeURIComponent(code)}`),
  updateWorkCenter: (code, body) => request(`/work-centers/${encodeURIComponent(code)}`, { method: 'PUT', body }),
  listOrders: () => request('/manufacturing-orders'),
  createOrder: (body) => request('/manufacturing-orders', { method: 'POST', body }),
  getOrder: (id) => request(`/manufacturing-orders/${encodeURIComponent(id)}`),
  updateOrderStatus: (id, status) => request(`/manufacturing-orders/${encodeURIComponent(id)}/status`, { method: 'PUT', body: { status } }),
  getOrderProgress: (id) => request(`/manufacturing-orders/${encodeURIComponent(id)}/progress`),
  listProductionLogs: () => request('/production-logs'),
  createProductionLog: (body) => request('/production-logs', { method: 'POST', body }),
  listDowntime: () => request('/downtime/logs'),
  listDowntimeReasons: () => request('/downtime/reasons'),
  createDowntimeReason: (body) => request('/downtime/reasons', { method: 'POST', body }),
  createDowntime: (body) => request('/downtime/logs', { method: 'POST', body }),
  resolveDowntime: (id, body) => request(`/downtime/logs/${encodeURIComponent(id)}/resolve`, { method: 'PUT', body }),
  listQualityInspections: () => request('/quality/inspections'),
  createQualityInspection: (body) => request('/quality/inspections', { method: 'POST', body }),
  listTools: () => request('/tools'),
  createTool: (body) => request('/tools', { method: 'POST', body }),
  addToolCycles: (code, cyclesToAdd) => request(`/tools/${encodeURIComponent(code)}/increment-cycles`, { method: 'PUT', body: { cyclesToAdd } }),
  serviceTool: (code) => request(`/tools/${encodeURIComponent(code)}/maintenance`, { method: 'PUT', body: {} }),
  listMaterialLots: () => request('/traceability/lots'),
  createMaterialLot: (body) => request('/traceability/lots', { method: 'POST', body }),
  listMachineOee: () => request('/analytics/machine-oee'),
  getOperatorPerformance: (operatorId, startDate, endDate) => request(`/analytics/operator-performance?${new URLSearchParams({ operatorId, startDate, endDate })}`),
};

export async function loadProductionData(modules = [], isAdmin = false) {
  const access = new Set(isAdmin ? ['overview', 'production', 'downtime', 'products', 'orders', 'machines', 'quality', 'reports'] : modules);
  const loads = {
    boms: { modules: ['overview', 'products', 'orders'], load: productionApi.listBoms },
    workCenters: { modules: ['overview', 'machines', 'production', 'downtime', 'orders', 'quality'], load: productionApi.listWorkCenters },
    orders: { modules: ['overview', 'orders', 'production', 'quality', 'reports'], load: productionApi.listOrders },
    productionLogs: { modules: ['overview', 'production', 'reports'], load: productionApi.listProductionLogs },
    downtime: { modules: ['overview', 'downtime', 'production', 'reports'], load: productionApi.listDowntime },
    downtimeReasons: { modules: ['overview', 'downtime', 'production'], load: productionApi.listDowntimeReasons },
    qualityInspections: { modules: ['overview', 'quality'], load: productionApi.listQualityInspections },
    tools: { modules: ['overview', 'machines'], load: productionApi.listTools },
    materialLots: { modules: ['overview', 'quality'], load: productionApi.listMaterialLots },
    machineOee: { modules: ['overview', 'reports'], load: productionApi.listMachineOee },
    audit: { modules: ['overview', 'production', 'downtime', 'products', 'orders', 'machines', 'quality', 'reports'], load: productionApi.listAudit },
  };
  const entries = await Promise.all(Object.entries(loads)
    .filter(([, resource]) => resource.modules.some((module) => access.has(module)))
    .map(async ([key, resource]) => {
    try {
      return [key, { data: await resource.load(), error: null }];
    } catch (error) {
      return [key, { data: [], error: error.message }];
    }
  }));
  return Object.fromEntries(entries);
}
