const basePath = '/api/v1/production';

async function request(path, options = {}) {
  const response = await fetch(`${basePath}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
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

export async function loadProductionData() {
  const entries = await Promise.all(Object.entries({
    boms: productionApi.listBoms,
    workCenters: productionApi.listWorkCenters,
    orders: productionApi.listOrders,
    productionLogs: productionApi.listProductionLogs,
    downtime: productionApi.listDowntime,
    downtimeReasons: productionApi.listDowntimeReasons,
    qualityInspections: productionApi.listQualityInspections,
    tools: productionApi.listTools,
    materialLots: productionApi.listMaterialLots,
    machineOee: productionApi.listMachineOee,
  }).map(async ([key, load]) => {
    try {
      return [key, { data: await load(), error: null }];
    } catch (error) {
      return [key, { data: [], error: error.message }];
    }
  }));
  return Object.fromEntries(entries);
}
