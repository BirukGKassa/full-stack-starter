-- AMR PP woven bag demo data. Requires the MySQL schema to be applied first.
-- Generates two shifts per day for the latest 60 completed days, ending yesterday.
START TRANSACTION;

INSERT INTO boms
  (id, product_sku, product_name, version, is_active, output_quantity, output_unit, standard_run_minutes, notes, metadata)
VALUES
  ('AMR-BOM-001', 'AMR-PP-BAG-25KG', 'Woven Polypropylene Bag 25 kg', 1, 1, 1, 'bag', 24, '25 kg printed woven bag recipe', JSON_OBJECT('material', 'polypropylene', 'factory', 'AMR')),
  ('AMR-BOM-002', 'AMR-PP-BAG-50KG', 'Woven Polypropylene Bag 50 kg', 1, 1, 1, 'bag', 28, '50 kg printed woven bag recipe', JSON_OBJECT('material', 'polypropylene', 'factory', 'AMR'))
ON DUPLICATE KEY UPDATE product_name = VALUES(product_name), metadata = VALUES(metadata);

INSERT INTO bom_lines
  (id, bom_id, component_sku, component_name, quantity_required, unit_of_measure, unit_cost, scrap_factor)
VALUES
  ('AMR-BL-001', 'AMR-BOM-001', 'AMR-PP-RESIN', 'Polypropylene resin', 0.085, 'kg', 1.45, 0.020),
  ('AMR-BL-002', 'AMR-BOM-001', 'AMR-PP-MASTERBATCH', 'Color masterbatch', 0.003, 'kg', 2.10, 0.015),
  ('AMR-BL-003', 'AMR-BOM-002', 'AMR-PP-RESIN', 'Polypropylene resin', 0.125, 'kg', 1.45, 0.020),
  ('AMR-BL-004', 'AMR-BOM-002', 'AMR-PP-MASTERBATCH', 'Color masterbatch', 0.004, 'kg', 2.10, 0.015)
ON DUPLICATE KEY UPDATE bom_id = VALUES(bom_id), component_sku = VALUES(component_sku), quantity_required = VALUES(quantity_required);

INSERT INTO work_centers
  (id, plant_id, code, name, factory_type, status, cost_per_hour, nominal_speed, speed_unit, metadata)
VALUES
  ('AMR-WC-001', 'AMR-PLANT-01', 'AMR-BAG-01', '25 kg Bag Weaving and Stitching Line', 'pp_bag', 'Active', 78, 1800, 'bags_per_hour', JSON_OBJECT('bag_weight_kg', 25)),
  ('AMR-WC-002', 'AMR-PLANT-01', 'AMR-BAG-02', '50 kg Bag Printing and Sewing Line', 'pp_bag', 'Active', 84, 1450, 'bags_per_hour', JSON_OBJECT('bag_weight_kg', 50))
ON DUPLICATE KEY UPDATE name = VALUES(name), factory_type = VALUES(factory_type), metadata = VALUES(metadata);

INSERT INTO manufacturing_orders
  (id, company_id, order_number, bom_id, product_sku, target_quantity, produced_qty, scrap_qty, status, priority, batch_number, due_date, started_at, notes)
VALUES
  ('AMR-MO-001', 'AMR', 'AMR-MO-2026-001', 'AMR-BOM-001', 'AMR-PP-BAG-25KG', 230000, 0, 0, 'In Progress', 'High', 'AMR-BATCH-25-01', DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 60 DAY), 'Rolling production run for 25 kg bags'),
  ('AMR-MO-002', 'AMR', 'AMR-MO-2026-002', 'AMR-BOM-002', 'AMR-PP-BAG-50KG', 200000, 0, 0, 'In Progress', 'Normal', 'AMR-BATCH-50-01', DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 60 DAY), 'Rolling production run for 50 kg bags')
ON DUPLICATE KEY UPDATE target_quantity = VALUES(target_quantity), status = VALUES(status), notes = VALUES(notes);

INSERT INTO downtime_reasons (id, category, reason_code, description, requires_technician, is_active)
VALUES
  ('AMR-DR-001', 'Mechanical', 'AMR-LOOM-STOP', 'Circular loom or weaving stoppage', 1, 1),
  ('AMR-DR-002', 'Changeover', 'AMR-PRINT-SETUP', 'Print cylinder or color changeover', 0, 1),
  ('AMR-DR-003', 'Quality', 'AMR-SEAM-REWORK', 'Bag seam or cutting quality adjustment', 1, 1)
ON DUPLICATE KEY UPDATE description = VALUES(description), is_active = VALUES(is_active);

INSERT INTO factory_tools
  (id, code, name, tool_type, max_cycles, current_cycles, status, assigned_work_center_code, last_maintenance_date)
VALUES
  ('AMR-TOOL-001', 'AMR-CYL-25KG-01', '25 kg Bag Print Cylinder', 'printing_cylinder', 1000000, 325000, 'Active', 'AMR-BAG-01', DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
  ('AMR-TOOL-002', 'AMR-KNIFE-50KG-01', '50 kg Bag Cutting Knife', 'cutting_knife', 500000, 188000, 'Active', 'AMR-BAG-02', DATE_SUB(CURDATE(), INTERVAL 6 DAY))
ON DUPLICATE KEY UPDATE current_cycles = VALUES(current_cycles), status = VALUES(status), assigned_work_center_code = VALUES(assigned_work_center_code);

DROP TEMPORARY TABLE IF EXISTS _amr_production_rows;
DROP TEMPORARY TABLE IF EXISTS _amr_seed_days;
CREATE TEMPORARY TABLE _amr_seed_days (day_offset INT NOT NULL PRIMARY KEY);
INSERT INTO _amr_seed_days (day_offset)
WITH RECURSIVE day_offsets AS (
  SELECT 0 AS day_offset
  UNION ALL
  SELECT day_offset + 1 FROM day_offsets WHERE day_offset < 59
)
SELECT day_offset FROM day_offsets;

CREATE TEMPORARY TABLE _amr_production_rows AS
SELECT
  CONCAT('AMR-PL-', DATE_FORMAT(DATE_ADD(CURDATE() - INTERVAL 60 DAY, INTERVAL d.day_offset DAY), '%Y%m%d'), '-L', c.line_no, '-S', s.shift_no) AS production_id,
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
FROM _amr_seed_days d
CROSS JOIN (
  SELECT 1 AS line_no, 'AMR-BAG-01' AS work_center_code, 'AMR-MO-001' AS order_id, 'AMR-BOM-001' AS bom_id, 'AMR-OP-001' AS operator_id, 'AMR-PP-BAG-25KG' AS product_sku, 'bag' AS output_unit, 'bag_gsm' AS inspection_type, 75.0 AS inspection_target, 3.0 AS inspection_tolerance, 1550 AS base_output, 35 AS base_scrap
  UNION ALL
  SELECT 2, 'AMR-BAG-02', 'AMR-MO-002', 'AMR-BOM-002', 'AMR-OP-002', 'AMR-PP-BAG-50KG', 'bag', 'bag_gsm', 90.0, 4.0, 1320, 38
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
  good_qty, output_unit, scrap_qty, 'Generated AMR demo shift', TIMESTAMP(work_date, end_time)
FROM _amr_production_rows
ON DUPLICATE KEY UPDATE output_quantity = VALUES(output_quantity), scrap_quantity = VALUES(scrap_quantity), end_time = VALUES(end_time);

UPDATE manufacturing_orders mo
JOIN (
  SELECT order_id, SUM(good_qty) AS good_qty, SUM(scrap_qty) AS scrap_qty
  FROM _amr_production_rows
  GROUP BY order_id
) seeded ON seeded.order_id = mo.id
SET mo.produced_qty = seeded.good_qty, mo.scrap_qty = seeded.scrap_qty;

INSERT INTO machine_downtime_logs
  (id, company_id, work_center_code, downtime_reason_id, start_time, end_time, duration_minutes, technician_id, is_verified, notes, created_at)
SELECT
  CONCAT('AMR-DL-', DATE_FORMAT(work_date, '%Y%m%d'), '-L', line_no, '-S', shift_no),
  'AMR', work_center_code,
  CASE MOD(day_offset + line_no + shift_no, 3)
    WHEN 0 THEN 'AMR-DR-001' WHEN 1 THEN 'AMR-DR-002' ELSE 'AMR-DR-003'
  END,
  TIMESTAMP(work_date, start_time),
  DATE_ADD(TIMESTAMP(work_date, start_time), INTERVAL downtime_minutes MINUTE),
  downtime_minutes, 'AMR-TECH-01', 1, 'Generated AMR demo downtime',
  TIMESTAMP(work_date, start_time)
FROM _amr_production_rows
ON DUPLICATE KEY UPDATE duration_minutes = VALUES(duration_minutes), end_time = VALUES(end_time), is_verified = VALUES(is_verified);

INSERT INTO quality_inspections
  (id, manufacturing_order_id, inspector_id, inspection_type, measured_value, target_value, lower_limit, upper_limit, status, sample_size, notes, created_at)
SELECT
  CONCAT('AMR-QA-', DATE_FORMAT(work_date, '%Y%m%d'), '-L', line_no, '-S', shift_no),
  order_id, 'AMR-QA-01', inspection_type,
  CASE WHEN MOD(day_offset * 7 + line_no + shift_no, 31) = 0
    THEN inspection_target + inspection_tolerance + 1.0
    ELSE inspection_target + (MOD(day_offset * 3 + line_no * 5 + shift_no, 9) - 4) * 0.25
  END,
  inspection_target, inspection_target - inspection_tolerance, inspection_target + inspection_tolerance,
  CASE WHEN MOD(day_offset * 7 + line_no + shift_no, 31) = 0 THEN 'Fail' ELSE 'Pass' END,
  5, 'Generated AMR bag weight inspection', TIMESTAMP(work_date, end_time)
FROM _amr_production_rows
ON DUPLICATE KEY UPDATE measured_value = VALUES(measured_value), status = VALUES(status), created_at = VALUES(created_at);

INSERT INTO material_lot_traces
  (id, manufacturing_order_id, component_sku, lot_number, quantity_used, unit_of_measure, created_at)
SELECT
  CONCAT('AMR-MT-', DATE_FORMAT(p.work_date, '%Y%m%d'), '-L', p.line_no, '-S', p.shift_no, '-', RIGHT(bl.id, 2)),
  p.order_id, bl.component_sku,
  CONCAT('SUP-AMR-', bl.component_sku, '-', DATE_FORMAT(p.work_date, '%Y%m')),
  p.good_qty * bl.quantity_required, bl.unit_of_measure, TIMESTAMP(p.work_date, p.end_time)
FROM _amr_production_rows p
JOIN bom_lines bl ON bl.bom_id = p.bom_id
ON DUPLICATE KEY UPDATE quantity_used = VALUES(quantity_used), lot_number = VALUES(lot_number);

INSERT INTO machine_performance_summaries
  (id, work_center_code, performance_date, shift_name, planned_operating_minutes, runtime_minutes, downtime_minutes, total_units_produced, good_units, scrap_units, availability_rate, performance_rate, quality_rate, oee_score, created_at)
SELECT
  CONCAT('AMR-MPS-', DATE_FORMAT(work_date, '%Y%m%d'), '-L', line_no, '-S', shift_no),
  work_center_code, work_date, shift_name, 480, 480 - downtime_minutes, downtime_minutes,
  good_qty + scrap_qty, good_qty, scrap_qty,
  ROUND((480 - downtime_minutes) / 480 * 100, 2),
  82 + MOD(day_offset * 3 + line_no * 7 + shift_no * 5, 16),
  ROUND(good_qty / (good_qty + scrap_qty) * 100, 2),
  ROUND(((480 - downtime_minutes) / 480 * 100) * (82 + MOD(day_offset * 3 + line_no * 7 + shift_no * 5, 16)) * (good_qty / (good_qty + scrap_qty) * 100) / 10000, 2),
  TIMESTAMP(work_date, end_time)
FROM _amr_production_rows
ON DUPLICATE KEY UPDATE runtime_minutes = VALUES(runtime_minutes), downtime_minutes = VALUES(downtime_minutes), total_units_produced = VALUES(total_units_produced), good_units = VALUES(good_units), scrap_units = VALUES(scrap_units), availability_rate = VALUES(availability_rate), performance_rate = VALUES(performance_rate), quality_rate = VALUES(quality_rate), oee_score = VALUES(oee_score);

INSERT INTO operator_performance_summaries
  (id, operator_id, work_center_code, performance_date, shift_name, total_active_hours, good_units_produced, scrap_units_produced, productivity_rate_per_hour, scrap_rate_percentage, created_at)
SELECT
  CONCAT('AMR-OPS-', DATE_FORMAT(work_date, '%Y%m%d'), '-L', line_no, '-S', shift_no),
  operator_id, work_center_code, work_date, shift_name, ROUND((480 - downtime_minutes) / 60, 2),
  good_qty, scrap_qty, ROUND(good_qty / ((480 - downtime_minutes) / 60), 2),
  ROUND(scrap_qty / (good_qty + scrap_qty) * 100, 2), TIMESTAMP(work_date, end_time)
FROM _amr_production_rows
ON DUPLICATE KEY UPDATE total_active_hours = VALUES(total_active_hours), good_units_produced = VALUES(good_units_produced), scrap_units_produced = VALUES(scrap_units_produced), productivity_rate_per_hour = VALUES(productivity_rate_per_hour), scrap_rate_percentage = VALUES(scrap_rate_percentage);

DROP TEMPORARY TABLE _amr_production_rows;
DROP TEMPORARY TABLE _amr_seed_days;
COMMIT;
