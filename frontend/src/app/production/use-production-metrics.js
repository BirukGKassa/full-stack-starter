import { useMemo, useState } from 'react';
import { productionApi } from '../../lib/production-api.js';
import { dateKey, weekKey } from './utils.js';

export default function useProductionMetrics(scoped, setToast) {
  const [reportType, setReportType] = useState('week');
  const [reportDays, setReportDays] = useState(30);
  const [operatorId, setOperatorId] = useState('');
  const [operatorReport, setOperatorReport] = useState(null);
  const today = dateKey(new Date());
  const todayLogs = scoped.productionLogs.filter((log) => dateKey(log.startTime) === today);
  const outputToday = todayLogs.reduce((total, log) => total + Number(log.outputQuantity || 0), 0);
  const openOrders = scoped.orders.filter((order) => order.status !== 'Completed').length;
  const activeDowntime = scoped.downtime.filter((log) => !log.endTime);
  const averageOee = scoped.machineOee.length ? scoped.machineOee.reduce((total, row) => total + Number(row.oeeScore || 0), 0) / scoped.machineOee.length : null;
  const recentProduction = scoped.productionLogs.filter((log) => {
    const stamp = new Date(log.startTime);
    return !Number.isNaN(stamp.getTime()) && stamp >= new Date(Date.now() - 30 * 86400000);
  });
  const recentDowntimeMinutes = scoped.downtime.reduce((sum, log) => {
    const stamp = new Date(log.startTime);
    return stamp >= new Date(Date.now() - 30 * 86400000) ? sum + Number(log.durationMinutes || 0) : sum;
  }, 0);
  const plannedMinutes = recentProduction.reduce((sum, log) => sum + Number(log.durationMinutes || 0), 0);
  const good = recentProduction.reduce((sum, log) => sum + Number(log.outputQuantity || 0), 0);
  const total = recentProduction.reduce((sum, log) => sum + Number(log.outputQuantity || 0) + Number(log.scrapQuantity || 0), 0);
  const estimatedOee = plannedMinutes > 0 ? Math.max(0, ((plannedMinutes - recentDowntimeMinutes) / plannedMinutes) * (good / Math.max(1, total)) * 100) : null;
  const recentLogs = [...scoped.productionLogs].sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).slice(0, 8);
  const reportRows = useMemo(() => buildReportRows(scoped, reportDays, reportType), [reportDays, reportType, scoped.downtime, scoped.productionLogs]);
  async function generateOperatorReport(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = String(form.get('operatorId') || '').trim();
    if (!id) { setToast({ kind: 'error', message: 'Enter an operator ID to generate this report.' }); return; }
    try { setOperatorReport(await productionApi.getOperatorPerformance(id, form.get('startDate'), form.get('endDate'))); }
    catch (error) { setToast({ kind: 'error', message: error.message || 'Could not generate the operator report.' }); }
  }
  return { reportType, setReportType, reportDays, setReportDays, operatorId, setOperatorId, operatorReport,
    todayLogs, outputToday, openOrders, activeDowntime, averageOee, estimatedOee, recentLogs, reportRows, generateOperatorReport };
}

function buildReportRows(scoped, reportDays, reportType) {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - Number(reportDays));
  const groups = new Map();
  for (const log of scoped.productionLogs) {
    const stamp = new Date(log.startTime);
    if (Number.isNaN(stamp.getTime()) || stamp < cutoff) continue;
    const key = reportType === 'month' ? `${stamp.getFullYear()}-${String(stamp.getMonth() + 1).padStart(2, '0')}` : weekKey(stamp);
    const row = groups.get(key) || { period: key, output: 0, scrap: 0, downtime: 0, shifts: 0 };
    row.output += Number(log.outputQuantity || 0); row.scrap += Number(log.scrapQuantity || 0); row.shifts += 1; groups.set(key, row);
  }
  for (const item of scoped.downtime) {
    const stamp = new Date(item.startTime);
    if (Number.isNaN(stamp.getTime()) || stamp < cutoff) continue;
    const key = reportType === 'month' ? `${stamp.getFullYear()}-${String(stamp.getMonth() + 1).padStart(2, '0')}` : weekKey(stamp);
    const row = groups.get(key) || { period: key, output: 0, scrap: 0, downtime: 0, shifts: 0 };
    row.downtime += Number(item.durationMinutes || 0); groups.set(key, row);
  }
  return [...groups.values()].sort((a, b) => b.period.localeCompare(a.period));
}
