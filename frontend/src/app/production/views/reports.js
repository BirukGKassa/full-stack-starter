import { DataTable, Input, Select } from '../components/ui.js';
import { dateKey, reportCsv } from '../utils.js';

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : '—';
}

export default function ReportsView({ code, reportType, setReportType, reportDays, setReportDays, reportRows, formatNumber, generateOperatorReport, operatorId, setOperatorId, operatorReport }) {
  const periods = [{ value: 'week', label: 'Weekly' }, { value: 'month', label: 'Monthly' }];
  const dateRanges = [7, 30, 60, 90].map((days) => ({ value: String(days), label: `Last ${days} days` }));
  return <>
    <header className="mb-6 space-y-2">
      <p className="text-sm font-medium text-[#71717a] dark:text-[#a1a1aa]">Insights · Reporting</p>
      <h1 className="text-3xl font-semibold tracking-tight text-[#18181b] dark:text-[#fafafa]">Production reports</h1>
      <p className="text-sm leading-6 text-[#71717a] dark:text-[#a1a1aa]">Turn shift entries into useful weekly and monthly summaries, ready to export.</p>
    </header>
    <section className="mb-6 space-y-4 rounded-xl border border-[#e4e4e7] bg-white p-6 shadow-sm dark:border-[#27272a] dark:bg-[#18181b] max-[640px]:p-4">
      <div className="flex flex-wrap items-end gap-3">
        <Select label="Period grouping" name="reportType" options={periods} value={reportType} onChange={(event) => setReportType(event.target.value)} required={false} />
        <Select label="Date range" name="reportDays" options={dateRanges} value={String(reportDays)} onChange={(event) => setReportDays(Number(event.target.value))} required={false} />
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-[#18181b] px-4 text-sm font-medium text-white hover:bg-[#27272a] disabled:opacity-50 dark:bg-[#fafafa] dark:text-[#18181b] dark:hover:bg-[#e4e4e7]" type="button" onClick={() => reportCsv(reportRows, reportType)} disabled={!reportRows.length}>Download CSV</button>
      </div>
      <div className="grid grid-cols-2 gap-3 border-y border-[#e4e4e7] py-4 dark:border-[#3f3f46] sm:grid-cols-4">
        <div><span className="text-xs text-[#71717a] dark:text-[#a1a1aa]">Periods in range</span><strong className="block text-lg font-semibold text-[#18181b] dark:text-[#fafafa]">{reportRows.length}</strong></div>
        <div><span className="text-xs text-[#71717a] dark:text-[#a1a1aa]">Good output</span><strong className="block text-lg font-semibold text-[#18181b] dark:text-[#fafafa]">{formatNumber(reportRows.reduce((sum, row) => sum + row.output, 0))}</strong></div>
        <div><span className="text-xs text-[#71717a] dark:text-[#a1a1aa]">Scrap</span><strong className="block text-lg font-semibold text-[#18181b] dark:text-[#fafafa]">{formatNumber(reportRows.reduce((sum, row) => sum + row.scrap, 0))}</strong></div>
        <div><span className="text-xs text-[#71717a] dark:text-[#a1a1aa]">Downtime</span><strong className="block text-lg font-semibold text-[#18181b] dark:text-[#fafafa]">{formatNumber(reportRows.reduce((sum, row) => sum + row.downtime, 0))} min</strong></div>
      </div>
      <DataTable columns={[
        { key: 'period', label: reportType === 'week' ? 'ISO week' : 'Month' }, { key: 'output', label: 'Good output', render: (row) => formatNumber(row.output) },
        { key: 'scrap', label: 'Scrap units', render: (row) => formatNumber(row.scrap) }, { key: 'downtime', label: 'Downtime', render: (row) => `${formatNumber(row.downtime)} min` },
        { key: 'shifts', label: 'Shift reports' }, { key: 'yield', label: 'Yield', render: (row) => `${formatNumber(row.output + row.scrap ? row.output / (row.output + row.scrap) * 100 : 0)}%` },
      ]} rows={reportRows} empty="No production entries in this date range. Record shifts to generate a report." />
    </section>
    <section className="space-y-4 rounded-xl border border-[#e4e4e7] bg-white p-6 shadow-sm dark:border-[#27272a] dark:bg-[#18181b] max-[640px]:p-4">
      <header className="space-y-1">
        <h2 className="text-base font-semibold tracking-tight text-[#18181b] dark:text-[#fafafa]">Operator performance</h2>
        <p className="text-sm leading-6 text-[#71717a] dark:text-[#a1a1aa]">Query the production analytics API for an operator and date range.</p>
      </header>
      <form className="flex flex-wrap items-end gap-3" onSubmit={generateOperatorReport}>
        <Input label="Operator ID" name="operatorId" value={operatorId} onChange={(event) => setOperatorId(event.target.value)} placeholder={`${code}-OP-01`} />
        <Input label="From" name="startDate" type="date" defaultValue={dateKey(new Date(Date.now() - 30 * 86400000))} />
        <Input label="To" name="endDate" type="date" defaultValue={dateKey(new Date())} />
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-[#18181b] px-4 text-sm font-medium text-white hover:bg-[#27272a] dark:bg-[#fafafa] dark:text-[#18181b] dark:hover:bg-[#e4e4e7]">Generate operator report</button>
      </form>
      {operatorReport?.summary && <div className="grid grid-cols-2 gap-3 border-y border-[#e4e4e7] py-4 dark:border-[#3f3f46] sm:grid-cols-4">
        <div><span className="text-xs text-[#71717a] dark:text-[#a1a1aa]">Active hours</span><strong className="block text-lg font-semibold text-[#18181b] dark:text-[#fafafa]">{formatNumber(operatorReport.summary.totalActiveHours, 2)}</strong></div>
        <div><span className="text-xs text-[#71717a] dark:text-[#a1a1aa]">Good units</span><strong className="block text-lg font-semibold text-[#18181b] dark:text-[#fafafa]">{formatNumber(operatorReport.summary.totalGoodUnitsProduced)}</strong></div>
        <div><span className="text-xs text-[#71717a] dark:text-[#a1a1aa]">Units / hour</span><strong className="block text-lg font-semibold text-[#18181b] dark:text-[#fafafa]">{formatNumber(operatorReport.summary.averageProductivityPerHour, 2)}</strong></div>
        <div><span className="text-xs text-[#71717a] dark:text-[#a1a1aa]">Scrap rate</span><strong className="block text-lg font-semibold text-[#18181b] dark:text-[#fafafa]">{operatorReport.summary.overallScrapRatePercentage}</strong></div>
      </div>}
      {operatorReport?.shiftBreakdown && <DataTable columns={[
        { key: 'performanceDate', label: 'Date', render: (row) => formatDate(row.performanceDate) }, { key: 'workCenterCode', label: 'Machine' }, { key: 'shiftName', label: 'Shift' },
        { key: 'goodUnitsProduced', label: 'Good units', render: (row) => formatNumber(row.goodUnitsProduced) }, { key: 'totalActiveHours', label: 'Active hours', render: (row) => formatNumber(row.totalActiveHours, 2) },
      ]} rows={operatorReport.shiftBreakdown} empty="No operator records for this date range." />}
    </section>
  </>;
}
