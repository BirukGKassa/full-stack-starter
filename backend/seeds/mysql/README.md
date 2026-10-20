# MySQL production demo data

Apply the backend MySQL schema first (`npm run db:push` from `backend`), then run one or more of these scripts against that same database:

- `amh.sql` — AMH aluminum extrusion profiles
- `amr.sql` — AMR PP woven bags
- `korki.sql` — KORKI bottle closures
- `rasa.sql` — RASA flour milling

Run each script in a MySQL 8.0+ client or MySQL Workbench. The scripts are scoped to their own company-prefixed IDs and codes and can be run together in one database. They use a rolling range of the latest 60 completed days (ending yesterday), with two shifts per day, so machine and operator summaries can be grouped into weekly or monthly reports. Re-running a script refreshes the same generated records rather than adding duplicate shifts.

Each script populates all 12 production tables: BOMs and BOM lines, work centers, manufacturing orders, downtime reasons and logs, tools, production logs, quality inspections, material traces, and machine/operator performance summaries. Better Auth's `user`, `session`, `account`, and `verification` tables are intentionally not seeded.

Some production tables do not have a `company_id` column in the current schema. The scripts use company-prefixed work-center codes, operator IDs, product SKUs, and record IDs to keep the sample companies distinct. Filter or group those tables by the company prefix.

Example weekly OEE report:

```sql
SELECT
  work_center_code,
  YEARWEEK(performance_date, 3) AS iso_week,
  ROUND(AVG(oee_score), 2) AS average_oee,
  SUM(good_units) AS good_units,
  SUM(scrap_units) AS scrap_units
FROM machine_performance_summaries
WHERE work_center_code LIKE 'AMH-%'
  AND performance_date >= CURDATE() - INTERVAL 59 DAY
GROUP BY work_center_code, YEARWEEK(performance_date, 3)
ORDER BY iso_week, work_center_code;
```

Example monthly operator report:

```sql
SELECT
  operator_id,
  DATE_FORMAT(performance_date, '%Y-%m') AS report_month,
  ROUND(SUM(good_units_produced) / NULLIF(SUM(total_active_hours), 0), 2) AS units_per_hour,
  ROUND(SUM(scrap_units_produced) /
    NULLIF(SUM(good_units_produced) + SUM(scrap_units_produced), 0) * 100, 2) AS scrap_rate_percentage
FROM operator_performance_summaries
WHERE operator_id LIKE 'AMH-%'
  AND performance_date >= CURDATE() - INTERVAL 59 DAY
GROUP BY operator_id, DATE_FORMAT(performance_date, '%Y-%m')
ORDER BY report_month, operator_id;
```
