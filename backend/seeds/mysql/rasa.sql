-- RASA flour milling demo data. Requires the MySQL schema to be applied first.
-- Generates two shifts per day for the latest 60 completed days, ending yesterday.
START TRANSACTION;

INSERT INTO boms
  (id, product_sku, product_name, version, is_active, output_quantity, output_unit, standard_run_minutes, notes, metadata)
VALUES
  ('RASA-BOM-001', 'RASA-WHEAT-FLOUR-50', 'Wheat Flour 50 kg Grade 1', 1, 1, 1, 'kg', 18, 'Grade 1 wheat flour milling recipe', JSON_OBJECT('grain', 'wheat', 'factory', 'RASA')),
  ('RASA-BOM-002', 'RASA-ATTA-FLOUR-25', 'Whole Wheat Atta Flour 25 kg', 1, 1, 1, 'kg', 22, 'Whole wheat atta milling recipe', JSON_OBJECT('grain', 'whole_wheat', 'factory', 'RASA'))
ON DUPLICATE KEY UPDATE product_name = VALUES(product_name), metadata = VALUES(metadata);

INSERT INTO bom_lines
  (id, bom_id, component_sku, component_name, quantity_required, unit_of_measure, unit_cost, scrap_factor)
VALUES
  ('RASA-BL-001', 'RASA-BOM-001', 'RASA-WHEAT-GRAIN', 'Clean wheat grain', 1.08, 'kg', 0.42, 0.035),
  ('RASA-BL-002', 'RASA-BOM-001', 'RASA-FLOUR-BAG-50', '50 kg flour packaging bag', 0.02, 'piece', 0.18, 0.005),
  ('RASA-BL-003', 'RASA-BOM-002', 'RASA-WHEAT-GRAIN', 'Clean whole wheat grain', 1.04, 'kg', 0.42, 0.025),
  ('RASA-BL-004', 'RASA-BOM-002', 'RASA-FLOUR-BAG-25', '25 kg atta packaging bag', 0.04, 'piece', 0.14, 0.005)
ON DUPLICATE KEY UPDATE bom_id = VALUES(bom_id), component_sku = VALUES(component_sku), quantity_required = VALUES(quantity_required);

INSERT INTO work_centers
  (id, plant_id, code, name, factory_type, status, cost_per_hour, nominal_speed, speed_unit, metadata)
VALUES
  ('RASA-WC-001', 'RASA-PLANT-01', 'RASA-MILL-01', 'Wheat Cleaning and Roller Mill 1', 'flour_milling', 'Active', 115, 12, 'tonnes_per_hour', JSON_OBJECT('grain', 'wheat', 'mill_stages', 4)),
  ('RASA-WC-002', 'RASA-PLANT-01', 'RASA-PACK-01', '25 kg Atta Flour Packing Line', 'flour_milling', 'Active', 72, 8, 'tonnes_per_hour', JSON_OBJECT('pack_size_kg', 25))
ON DUPLICATE KEY UPDATE name = VALUES(name), factory_type = VALUES(factory_type), metadata = VALUES(metadata);

INSERT INTO manufacturing_orders
  (id, company_id, order_number, bom_id, product_sku, target_quantity, produced_qty, scrap_qty, status, priority, batch_number, due_date, started_at, notes)
VALUES
  ('RASA-MO-001', 'RASA', 'RASA-MO-2026-001', 'RASA-BOM-001', 'RASA-WHEAT-FLOUR-50', 1300000, 0, 0, 'In Progress', 'High', 'RASA-BATCH-WHEAT-01', DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 60 DAY), 'Rolling production run for Grade 1 wheat flour'),
  ('RASA-MO-002', 'RASA', 'RASA-MO-2026-002', 'RASA-BOM-002', 'RASA-ATTA-FLOUR-25', 1050000, 0, 0, 'In Progress', 'Normal', 'RASA-BATCH-ATTA-01', DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 60 DAY), 'Rolling production run for whole wheat atta')
ON DUPLICATE KEY UPDATE target_quantity = VALUES(target_quantity), status = VALUES(status), notes = VALUES(notes);

INSERT INTO downtime_reasons (id, category, reason_code, description, requires_technician, is_active)
VALUES
  ('RASA-DR-001', 'Cleaning', 'RASA-GRAIN-CLEAN', 'Grain cleaning and separator stoppage', 1, 1),
  ('RASA-DR-002', 'Mechanical', 'RASA-MILL-ROLL', 'Roller mill or sifter maintenance', 1, 1),
  ('RASA-DR-003', 'Changeover', 'RASA-PACK-CHANGE', 'Bag-size or flour-grade changeover', 0, 1)
ON DUPLICATE KEY UPDATE description = VALUES(description), is_active = VALUES(is_active);

INSERT INTO factory_tools
  (id, code, name, tool_type, max_cycles, current_cycles, status, assigned_work_center_code, last_maintenance_date)
VALUES
  ('RASA-TOOL-001', 'RASA-ROLLER-01', 'Roller Mill Pair 1', 'mill_roller', 30000, 11800, 'Active', 'RASA-MILL-01', DATE_SUB(CURDATE(), INTERVAL 11 DAY)),
  ('RASA-TOOL-002', 'RASA-PACK-JAW-01', '25 kg Bag Sealing Jaw', 'sealing_jaw', 800000, 241000, 'Active', 'RASA-PACK-01', DATE_SUB(CURDATE(), INTERVAL 7 DAY))
ON DUPLICATE KEY UPDATE current_cycles = VALUES(current_cycles), status = VALUES(status), assigned_work_center_code = VALUES(assigned_work_center_code);

DROP TEMPORARY TABLE IF EXISTS _rasa_production_rows;
DROP TEMPORARY TABLE IF EXISTS _rasa_seed_days;
CREATE TEMPORARY TABLE _rasa_seed_days (day_offset INT NOT NULL PRIMARY KEY);
INSERT INTO _rasa_seed_days (day_offset)
WITH RECURSIVE day_offsets AS (
  SELECT 0 AS day_offset
  UNION ALL
  SELECT day_offset + 1 FROM day_offsets WHERE day_offset < 59
)
SELECT day_offset FROM day_offsets;

CREATE TEMPORARY TABLE _rasa_production_rows AS
SELECT
  CONCAT('RASA-PL-', DATE_FORMAT(DATE_ADD(CURDATE() - INTERVAL 60 DAY, INTERVAL d.day_offset DAY), '%Y%m%d'), '-L', c.line_no, '-S', s.shift_no) AS production_id,
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
FROM _rasa_seed_days d
CROSS JOIN (
  SELECT 1 AS line_no, 'RASA-MILL-01' AS work_center_code, 'RASA-MO-001' AS order_id, 'RASA-BOM-001' AS bom_id, 'RASA-OP-001' AS operator_id, 'RASA-WHEAT-FLOUR-50' AS product_sku, 'kg' AS output_unit, 'flour_moisture_pct' AS inspection_type, 12.5 AS inspection_target, 0.5 AS inspection_tolerance, 9300 AS base_output, 95 AS base_scrap
  UNION ALL
  SELECT 2, 'RASA-PACK-01', 'RASA-MO-002', 'RASA-BOM-002', 'RASA-OP-002', 'RASA-ATTA-FLOUR-25', 'kg', 'flour_moisture_pct', 13.0, 0.6, 7400, 82
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
  good_qty, output_unit, scrap_qty, 'Generated RASA demo shift', TIMESTAMP(work_date, end_time)
FROM _rasa_production_rows
ON DUPLICATE KEY UPDATE output_quantity = VALUES(output_quantity), scrap_quantity = VALUES(scrap_quantity), end_time = VALUES(end_time);

UPDATE manufacturing_orders mo
JOIN (
  SELECT order_id, SUM(good_qty) AS good_qty, SUM(scrap_qty) AS scrap_qty
  FROM _rasa_production_rows
  GROUP BY order_id
) seeded ON seeded.order_id = mo.id
SET mo.produced_qty = seeded.good_qty, mo.scrap_qty = seeded.scrap_qty;

INSERT INTO machine_downtime_logs
  (id, company_id, work_center_code, downtime_reason_id, start_time, end_time, duration_minutes, technician_id, is_verified, notes, created_at)
SELECT
  CONCAT('RASA-DL-', DATE_FORMAT(work_date, '%Y%m%d'), '-L', line_no, '-S', shift_no),
  'RASA', work_center_code,
  CASE MOD(day_offset + line_no + shift_no, 3)
    WHEN 0 THEN 'RASA-DR-001' WHEN 1 THEN 'RASA-DR-002' ELSE 'RASA-DR-003'
  END,
  TIMESTAMP(work_date, start_time),
  DATE_ADD(TIMESTAMP(work_date, start_time), INTERVAL downtime_minutes MINUTE),
  downtime_minutes, 'RASA-TECH-01', 1, 'Generated RASA demo downtime',
  TIMESTAMP(work_date, start_time)
FROM _rasa_production_rows
ON DUPLICATE KEY UPDATE duration_minutes = VALUES(duration_minutes), end_time = VALUES(end_time), is_verified = VALUES(is_verified);

INSERT INTO quality_inspections
  (id, manufacturing_order_id, inspector_id, inspection_type, measured_value, target_value, lower_limit, upper_limit, status, sample_size, notes, created_at)
SELECT
  CONCAT('RASA-QA-', DATE_FORMAT(work_date, '%Y%m%d'), '-L', line_no, '-S', shift_no),
  order_id, 'RASA-QA-01', inspection_type,
  CASE WHEN MOD(day_offset * 7 + line_no + shift_no, 31) = 0
    THEN inspection_target + inspection_tolerance + 0.20
    ELSE inspection_target + (MOD(day_offset * 3 + line_no * 5 + shift_no, 9) - 4) * 0.05
  END,
  inspection_target, inspection_target - inspection_tolerance, inspection_target + inspection_tolerance,
  CASE WHEN MOD(day_offset * 7 + line_no + shift_no, 31) = 0 THEN 'Fail' ELSE 'Pass' END,
  5, 'Generated RASA flour moisture inspection', TIMESTAMP(work_date, end_time)
FROM _rasa_production_rows
ON DUPLICATE KEY UPDATE measured_value = VALUES(measured_value), status = VALUES(status), created_at = VALUES(created_at);

INSERT INTO material_lot_traces
  (id, manufacturing_order_id, component_sku, lot_number, quantity_used, unit_of_measure, created_at)
SELECT
  CONCAT('RASA-MT-', DATE_FORMAT(p.work_date, '%Y%m%d'), '-L', p.line_no, '-S', p.shift_no, '-', RIGHT(bl.id, 2)),
  p.order_id, bl.component_sku,
  CONCAT('SUP-RASA-', bl.component_sku, '-', DATE_FORMAT(p.work_date, '%Y%m')),
  p.good_qty * bl.quantity_required, bl.unit_of_measure, TIMESTAMP(p.work_date, p.end_time)
FROM _rasa_production_rows p
JOIN bom_lines bl ON bl.bom_id = p.bom_id
ON DUPLICATE KEY UPDATE quantity_used = VALUES(quantity_used), lot_number = VALUES(lot_number);

INSERT INTO machine_performance_summaries
  (id, work_center_code, performance_date, shift_name, planned_operating_minutes, runtime_minutes, downtime_minutes, total_units_produced, good_units, scrap_units, availability_rate, performance_rate, quality_rate, oee_score, created_at)
SELECT
  CONCAT('RASA-MPS-', DATE_FORMAT(work_date, '%Y%m%d'), '-L', line_no, '-S', shift_no),
  work_center_code, work_date, shift_name, 480, 480 - downtime_minutes, downtime_minutes,
  good_qty + scrap_qty, good_qty, scrap_qty,
  ROUND((480 - downtime_minutes) / 480 * 100, 2),
  82 + MOD(day_offset * 3 + line_no * 7 + shift_no * 5, 16),
  ROUND(good_qty / (good_qty + scrap_qty) * 100, 2),
  ROUND(((480 - downtime_minutes) / 480 * 100) * (82 + MOD(day_offset * 3 + line_no * 7 + shift_no * 5, 16)) * (good_qty / (good_qty + scrap_qty) * 100) / 10000, 2),
  TIMESTAMP(work_date, end_time)
FROM _rasa_production_rows
ON DUPLICATE KEY UPDATE runtime_minutes = VALUES(runtime_minutes), downtime_minutes = VALUES(downtime_minutes), total_units_produced = VALUES(total_units_produced), good_units = VALUES(good_units), scrap_units = VALUES(scrap_units), availability_rate = VALUES(availability_rate), performance_rate = VALUES(performance_rate), quality_rate = VALUES(quality_rate), oee_score = VALUES(oee_score);

INSERT INTO operator_performance_summaries
  (id, operator_id, work_center_code, performance_date, shift_name, total_active_hours, good_units_produced, scrap_units_produced, productivity_rate_per_hour, scrap_rate_percentage, created_at)
SELECT
  CONCAT('RASA-OPS-', DATE_FORMAT(work_date, '%Y%m%d'), '-L', line_no, '-S', shift_no),
  operator_id, work_center_code, work_date, shift_name, ROUND((480 - downtime_minutes) / 60, 2),
  good_qty, scrap_qty, ROUND(good_qty / ((480 - downtime_minutes) / 60), 2),
  ROUND(scrap_qty / (good_qty + scrap_qty) * 100, 2), TIMESTAMP(work_date, end_time)
FROM _rasa_production_rows
ON DUPLICATE KEY UPDATE total_active_hours = VALUES(total_active_hours), good_units_produced = VALUES(good_units_produced), scrap_units_produced = VALUES(scrap_units_produced), productivity_rate_per_hour = VALUES(productivity_rate_per_hour), scrap_rate_percentage = VALUES(scrap_rate_percentage);

DROP TEMPORARY TABLE _rasa_production_rows;
DROP TEMPORARY TABLE _rasa_seed_days;
COMMIT;
