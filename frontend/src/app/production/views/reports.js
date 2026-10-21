import { DataTable } from '../components/ui.js';
import { dateKey, reportCsv } from '../utils.js';

export default function ReportsView({ code, reportType, setReportType, reportDays, setReportDays, reportRows, formatNumber, generateOperatorReport, operatorId, setOperatorId, operatorReport }) {
  return (
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
}
