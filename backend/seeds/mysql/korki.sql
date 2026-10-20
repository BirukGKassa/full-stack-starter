-- KORKI bottle closure demo data. Requires the MySQL schema to be applied first.
-- Generates two shifts per day for the latest 60 completed days, ending yesterday.
START TRANSACTION;

INSERT INTO boms
  (id, product_sku, product_name, version, is_active, output_quantity, output_unit, standard_run_minutes, notes, metadata)
VALUES
  ('KORKI-BOM-001', 'KORKI-CAP-28MM', '28 mm HDPE Bottle Cap', 1, 1, 1, 'piece', 20, '28 mm tamper-evident bottle cap recipe', JSON_OBJECT('material', 'HDPE', 'factory', 'KORKI')),
  ('KORKI-BOM-002', 'KORKI-CLOSURE-38MM', '38 mm HDPE Bottle Closure', 1, 1, 1, 'piece', 25, '38 mm bottle closure with liner', JSON_OBJECT('material', 'HDPE', 'factory', 'KORKI'))
ON DUPLICATE KEY UPDATE product_name = VALUES(product_name), metadata = VALUES(metadata);

INSERT INTO bom_lines
  (id, bom_id, component_sku, component_name, quantity_required, unit_of_measure, unit_cost, scrap_factor)
VALUES
  ('KORKI-BL-001', 'KORKI-BOM-001', 'KORKI-HDPE-RESIN', 'Food-grade HDPE resin', 0.0032, 'kg', 1.80, 0.018),
  ('KORKI-BL-002', 'KORKI-BOM-001', 'KORKI-COLOR-MB', 'Cap color masterbatch', 0.00008, 'kg', 2.40, 0.012),
  ('KORKI-BL-003', 'KORKI-BOM-002', 'KORKI-HDPE-RESIN', 'Food-grade HDPE resin', 0.0048, 'kg', 1.80, 0.018),
  ('KORKI-BL-004', 'KORKI-BOM-002', 'KORKI-FOAM-LINER', 'Closure foam liner', 1, 'piece', 0.008, 0.010)
ON DUPLICATE KEY UPDATE bom_id = VALUES(bom_id), component_sku = VALUES(component_sku), quantity_required = VALUES(quantity_required);

INSERT INTO work_centers
  (id, plant_id, code, name, factory_type, status, cost_per_hour, nominal_speed, speed_unit, metadata)
VALUES
  ('KORKI-WC-001', 'KORKI-PLANT-01', 'KORKI-MOLD-01', '28 mm Cap Injection Molding Cell', 'bottle_closure', 'Active', 92, 18000, 'pieces_per_hour', JSON_OBJECT('cavities', 24)),
  ('KORKI-WC-002', 'KORKI-PLANT-01', 'KORKI-MOLD-02', '38 mm Closure and Liner Cell', 'bottle_closure', 'Active', 105, 14500, 'pieces_per_hour', JSON_OBJECT('cavities', 16))
ON DUPLICATE KEY UPDATE name = VALUES(name), factory_type = VALUES(factory_type), metadata = VALUES(metadata);

INSERT INTO manufacturing_orders
  (id, company_id, order_number, bom_id, product_sku, target_quantity, produced_qty, scrap_qty, status, priority, batch_number, due_date, started_at, notes)
VALUES
  ('KORKI-MO-001', 'KORKI', 'KORKI-MO-2026-001', 'KORKI-BOM-001', 'KORKI-CAP-28MM', 1800000, 0, 0, 'In Progress', 'High', 'KORKI-BATCH-CAP-01', DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 60 DAY), 'Rolling production run for 28 mm caps'),
  ('KORKI-MO-002', 'KORKI', 'KORKI-MO-2026-002', 'KORKI-BOM-002', 'KORKI-CLOSURE-38MM', 1500000, 0, 0, 'In Progress', 'Normal', 'KORKI-BATCH-CLOSURE-01', DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 60 DAY), 'Rolling production run for 38 mm closures')
ON DUPLICATE KEY UPDATE target_quantity = VALUES(target_quantity), status = VALUES(status), notes = VALUES(notes);

INSERT INTO downtime_reasons (id, category, reason_code, description, requires_technician, is_active)
VALUES
  ('KORKI-DR-001', 'Mechanical', 'KORKI-MOLD-STOP', 'Mold or injection press stoppage', 1, 1),
  ('KORKI-DR-002', 'Changeover', 'KORKI-COLOR-CHANGE', 'Resin or color changeover and purge', 0, 1),
  ('KORKI-DR-003', 'Quality', 'KORKI-DIMENSION-CHECK', 'Closure dimension or liner quality hold', 1, 1)
ON DUPLICATE KEY UPDATE description = VALUES(description), is_active = VALUES(is_active);

INSERT INTO factory_tools
  (id, code, name, tool_type, max_cycles, current_cycles, status, assigned_work_center_code, last_maintenance_date)
VALUES
  ('KORKI-TOOL-001', 'KORKI-MOLD-CAP-28', '28 mm 24-Cavity Cap Mold', 'injection_mold', 2000000, 718000, 'Active', 'KORKI-MOLD-01', DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
  ('KORKI-TOOL-002', 'KORKI-MOLD-CLOSURE-38', '38 mm 16-Cavity Closure Mold', 'injection_mold', 1500000, 604000, 'Active', 'KORKI-MOLD-02', DATE_SUB(CURDATE(), INTERVAL 5 DAY))
ON DUPLICATE KEY UPDATE current_cycles = VALUES(current_cycles), status = VALUES(status), assigned_work_center_code = VALUES(assigned_work_center_code);

DROP TEMPORARY TABLE IF EXISTS _korki_production_rows;
DROP TEMPORARY TABLE IF EXISTS _korki_seed_days;
CREATE TEMPORARY TABLE _korki_seed_days (day_offset INT NOT NULL PRIMARY KEY);
INSERT INTO _korki_seed_days (day_offset)
WITH RECURSIVE day_offsets AS (
  SELECT 0 AS day_offset
  UNION ALL
  SELECT day_offset + 1 FROM day_offsets WHERE day_offset < 59
)
SELECT day_offset FROM day_offsets;

CREATE TEMPORARY TABLE _korki_production_rows AS
SELECT
  CONCAT('KORKI-PL-', DATE_FORMAT(DATE_ADD(CURDATE() - INTERVAL 60 DAY, INTERVAL d.day_offset DAY), '%Y%m%d'), '-L', c.line_no, '-S', s.shift_no) AS production_id,
  DATE_ADD(CURDATE() - INTERVAL 60 DAY, INTERVAL d.day_offset DAY) AS work_date,
  d.day_offset,
  c.line_no,
  c.work_center_code,
  c.order_id,
  c.bom_id,
  c.operator_id,
  c.product_sku,
  c.output_unit,
  c.inspection_type,
  c.inspection_target,
  c.inspection_tolerance,
  s.shift_no,
  s.shift_name,
  s.start_time,
  s.end_time,
  c.base_output + MOD(d.day_offset * 17 + c.line_no * 31 + s.shift_no * 13, 280) AS good_qty,
  c.base_scrap + MOD(d.day_offset * 3 + c.line_no + s.shift_no, 13) AS scrap_qty,
  15 + MOD(d.day_offset * 7 + c.line_no * 11 + s.shift_no * 17, 51) AS downtime_minutes
FROM _korki_seed_days d
CROSS JOIN (
  SELECT 1 AS line_no, 'KORKI-MOLD-01' AS work_center_code, 'KORKI-MO-001' AS order_id, 'KORKI-BOM-001' AS bom_id, 'KORKI-OP-001' AS operator_id, 'KORKI-CAP-28MM' AS product_sku, 'piece' AS output_unit, 'cap_outer_diameter_mm' AS inspection_type, 28.0 AS inspection_target, 0.3 AS inspection_tolerance, 12400 AS base_output, 120 AS base_scrap
  UNION ALL
  SELECT 2, 'KORKI-MOLD-02', 'KORKI-MO-002', 'KORKI-BOM-002', 'KORKI-OP-002', 'KORKI-CLOSURE-38MM', 'piece', 'closure_outer_diameter_mm', 38.0, 0.4, 9800, 105
) c
CROSS JOIN (
  SELECT 1 AS shift_no, 'Morning_Shift' AS shift_name, '06:00:00' AS start_time, '14:00:00' AS end_time
  UNION ALL
  SELECT 2, 'Evening_Shift', '14:00:00', '22:00:00'
) s;

INSERT INTO machine_production_logs
  (id, manufacturing_order_id, work_center_code, operator_id, shift_name, start_time, end_time, duration_minutes, output_quantity, output_unit, scrap_quantity, notes, created_at)
SELECT
  production_id, order_id, work_center_code, operator_id, shift_name,
  TIMESTAMP(work_date, start_time), TIMESTAMP(work_date, end_time), 480,
  good_qty, output_unit, scrap_qty, 'Generated KORKI demo shift', TIMESTAMP(work_date, end_time)
FROM _korki_production_rows
ON DUPLICATE KEY UPDATE output_quantity = VALUES(output_quantity), scrap_quantity = VALUES(scrap_quantity), end_time = VALUES(end_time);

UPDATE manufacturing_orders mo
JOIN (
  SELECT order_id, SUM(good_qty) AS good_qty, SUM(scrap_qty) AS scrap_qty
  FROM _korki_production_rows
  GROUP BY order_id
) seeded ON seeded.order_id = mo.id
SET mo.produced_qty = seeded.good_qty, mo.scrap_qty = seeded.scrap_qty;

INSERT INTO machine_downtime_logs
  (id, company_id, work_center_code, downtime_reason_id, start_time, end_time, duration_minutes, technician_id, is_verified, notes, created_at)
SELECT
  CONCAT('KORKI-DL-', DATE_FORMAT(work_date, '%Y%m%d'), '-L', line_no, '-S', shift_no),
  'KORKI', work_center_code,
  CASE MOD(day_offset + line_no + shift_no, 3)
    WHEN 0 THEN 'KORKI-DR-001' WHEN 1 THEN 'KORKI-DR-002' ELSE 'KORKI-DR-003'
  END,
  TIMESTAMP(work_date, start_time),
  DATE_ADD(TIMESTAMP(work_date, start_time), INTERVAL downtime_minutes MINUTE),
  downtime_minutes, 'KORKI-TECH-01', 1, 'Generated KORKI demo downtime',
  TIMESTAMP(work_date, start_time)
FROM _korki_production_rows
ON DUPLICATE KEY UPDATE duration_minutes = VALUES(duration_minutes), end_time = VALUES(end_time), is_verified = VALUES(is_verified);

INSERT INTO quality_inspections
  (id, manufacturing_order_id, inspector_id, inspection_type, measured_value, target_value, lower_limit, upper_limit, status, sample_size, notes, created_at)
SELECT
  CONCAT('KORKI-QA-', DATE_FORMAT(work_date, '%Y%m%d'), '-L', line_no, '-S', shift_no),
  order_id, 'KORKI-QA-01', inspection_type,
  CASE WHEN MOD(day_offset * 7 + line_no + shift_no, 31) = 0
    THEN inspection_target + inspection_tolerance + 0.15
    ELSE inspection_target + (MOD(day_offset * 3 + line_no * 5 + shift_no, 9) - 4) * 0.05
  END,
  inspection_target, inspection_target - inspection_tolerance, inspection_target + inspection_tolerance,
  CASE WHEN MOD(day_offset * 7 + line_no + shift_no, 31) = 0 THEN 'Fail' ELSE 'Pass' END,
  5, 'Generated KORKI closure dimension inspection', TIMESTAMP(work_date, end_time)
FROM _korki_production_rows
ON DUPLICATE KEY UPDATE measured_value = VALUES(measured_value), status = VALUES(status), created_at = VALUES(created_at);

INSERT INTO material_lot_traces
  (id, manufacturing_order_id, component_sku, lot_number, quantity_used, unit_of_measure, created_at)
SELECT
  CONCAT('KORKI-MT-', DATE_FORMAT(p.work_date, '%Y%m%d'), '-L', p.line_no, '-S', p.shift_no, '-', RIGHT(bl.id, 2)),
  p.order_id, bl.component_sku,
  CONCAT('SUP-KORKI-', bl.component_sku, '-', DATE_FORMAT(p.work_date, '%Y%m')),
  p.good_qty * bl.quantity_required, bl.unit_of_measure, TIMESTAMP(p.work_date, p.end_time)
FROM _korki_production_rows p
JOIN bom_lines bl ON bl.bom_id = p.bom_id
ON DUPLICATE KEY UPDATE quantity_used = VALUES(quantity_used), lot_number = VALUES(lot_number);

INSERT INTO machine_performance_summaries
  (id, work_center_code, performance_date, shift_name, planned_operating_minutes, runtime_minutes, downtime_minutes, total_units_produced, good_units, scrap_units, availability_rate, performance_rate, quality_rate, oee_score, created_at)
SELECT
  CONCAT('KORKI-MPS-', DATE_FORMAT(work_date, '%Y%m%d'), '-L', line_no, '-S', shift_no),
  work_center_code, work_date, shift_name, 480, 480 - downtime_minutes, downtime_minutes,
  good_qty + scrap_qty, good_qty, scrap_qty,
  ROUND((480 - downtime_minutes) / 480 * 100, 2),
  82 + MOD(day_offset * 3 + line_no * 7 + shift_no * 5, 16),
  ROUND(good_qty / (good_qty + scrap_qty) * 100, 2),
  ROUND(((480 - downtime_minutes) / 480 * 100) * (82 + MOD(day_offset * 3 + line_no * 7 + shift_no * 5, 16)) * (good_qty / (good_qty + scrap_qty) * 100) / 10000, 2),
  TIMESTAMP(work_date, end_time)
FROM _korki_production_rows
ON DUPLICATE KEY UPDATE runtime_minutes = VALUES(runtime_minutes), downtime_minutes = VALUES(downtime_minutes), total_units_produced = VALUES(total_units_produced), good_units = VALUES(good_units), scrap_units = VALUES(scrap_units), availability_rate = VALUES(availability_rate), performance_rate = VALUES(performance_rate), quality_rate = VALUES(quality_rate), oee_score = VALUES(oee_score);

INSERT INTO operator_performance_summaries
  (id, operator_id, work_center_code, performance_date, shift_name, total_active_hours, good_units_produced, scrap_units_produced, productivity_rate_per_hour, scrap_rate_percentage, created_at)
SELECT
  CONCAT('KORKI-OPS-', DATE_FORMAT(work_date, '%Y%m%d'), '-L', line_no, '-S', shift_no),
  operator_id, work_center_code, work_date, shift_name, ROUND((480 - downtime_minutes) / 60, 2),
  good_qty, scrap_qty, ROUND(good_qty / ((480 - downtime_minutes) / 60), 2),
  ROUND(scrap_qty / (good_qty + scrap_qty) * 100, 2), TIMESTAMP(work_date, end_time)
FROM _korki_production_rows
ON DUPLICATE KEY UPDATE total_active_hours = VALUES(total_active_hours), good_units_produced = VALUES(good_units_produced), scrap_units_produced = VALUES(scrap_units_produced), productivity_rate_per_hour = VALUES(productivity_rate_per_hour), scrap_rate_percentage = VALUES(scrap_rate_percentage);

DROP TEMPORARY TABLE _korki_production_rows;
DROP TEMPORARY TABLE _korki_seed_days;
COMMIT;
