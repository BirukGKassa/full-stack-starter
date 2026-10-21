export function toIso(value) {
  return value ? new Date(value).toISOString() : null;
}

export function formatNumber(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function companyMatches(record, company, keys) {
  if (!company) return true;
  if (record.companyId) return record.companyId === company;
  return keys.some((key) => String(record[key] || '').toUpperCase().startsWith(`${company}-`) || String(record[key] || '').toUpperCase() === company);
}

export function dateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function weekKey(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const weekOne = new Date(date.getFullYear(), 0, 4);
  const week = 1 + Math.round(((date - weekOne) / 86400000 - 3 + ((weekOne.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function reportCsv(rows, periodType) {
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
