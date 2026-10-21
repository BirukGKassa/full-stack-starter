async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Request failed (${response.status})`);
  return payload.data ?? payload;
}

export const systemApi = {
  getPublicSystem: () => request('/api/public/system'),
  getAdminOverview: () => request('/api/admin/system'),
  getLicenseStatus: () => request('/api/admin/license-status'),
  updateCompany: (body) => request('/api/admin/company', { method: 'PUT', body }),
  registerLicense: (licenseKey) => request('/api/admin/licenses', { method: 'POST', body: { licenseKey } }),
  refreshLicense: () => request('/api/admin/licenses/refresh', { method: 'POST', body: {} }),
  revokeUserSessions: (userId) => request(`/api/admin/users/${encodeURIComponent(userId)}/sessions`, { method: 'DELETE' }),
  listSessions: () => request('/api/account/sessions'),
  revokeSession: (sessionId) => request(`/api/account/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE' }),
};
