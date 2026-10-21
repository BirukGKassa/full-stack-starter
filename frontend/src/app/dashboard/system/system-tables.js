import SystemDataTable from './system-data-table.js';

function dateTime(value) {
  return value ? new Date(value).toLocaleString() : '—';
}

export default function SystemTables({ overview, loading, onRefresh, onRevoke }) {
  const sessions = overview.sessions.map((item) => ({ id: item.id, cells: [item.userName, dateTime(item.createdAt), dateTime(item.updatedAt), dateTime(item.expiresAt), item.userAgent || item.ipAddress || 'Unknown device', <button className="prod-text-button prod-revoke-session" disabled={loading} onClick={() => onRevoke(item.userId, item.userName)}>Revoke all</button>] }));
  const errors = overview.errors.map((item) => ({ id: item.id, cells: [dateTime(item.createdAt), item.level, item.category, item.message, item.statusCode || '—', item.path || '—'] }));
  const activity = overview.activity.map((item) => ({ id: item.id, cells: [dateTime(item.createdAt), item.userName, item.moduleKey, item.action, item.recordId || '—', item.workstationName || '—'] }));
  const downtime = overview.downtime.map((item) => ({ id: item.id, cells: [dateTime(item.startTime), item.workCenterCode, item.companyId, item.durationMinutes ?? 'Ongoing', item.isVerified ? 'Yes' : 'No', item.notes || '—'] }));
  return <>
    <SystemDataTable title="System activity and sessions" description="Signed-in users, session dates, and workstation information." columns={['User', 'Started', 'Last updated', 'Expires', 'Client', 'Action']} rows={sessions} emptyLabel="No active sessions." action={<button className="prod-text-button" onClick={onRefresh} disabled={loading}>Refresh ↻</button>} />
    <SystemDataTable title="System failures and errors" description="Recent server-side failures and health events, grouped by endpoint." columns={['Time', 'Level', 'Area', 'Message', 'HTTP', 'Path']} rows={errors} emptyLabel="No system errors have been recorded." />
    <SystemDataTable title="ERP activity log" description="Recent user actions recorded across production modules." columns={['Time', 'User', 'Module', 'Action', 'Record', 'Workstation']} rows={activity} emptyLabel="No activity recorded yet." />
    <SystemDataTable title="Machine downtime" description="Recent operational stoppages, grouped separately from system errors." columns={['Start', 'Machine', 'Company', 'Duration (min)', 'Verified', 'Notes']} rows={downtime} emptyLabel="No downtime records found." />
  </>;
}
