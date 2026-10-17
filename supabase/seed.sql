-- ==============================================================================
-- SEED DATA: supabase/seed.sql
-- DESCRIPTION: Rich Chemical Pilot Plant Dataset matching migrations 001 & 002
-- Systems:
--   1. Syngas Fischer-Tropsch Catalytic Hydrogenation (RIG-CAT-FLOW)
--   2. Supercritical CO2 Countercurrent Extraction (RIG-EXTRACT-04)
-- ==============================================================================

-- 1. Projects
INSERT INTO projects (id, project_code, title, description, status, created_at, updated_at)
VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'PRJ-SYNGAS-FT',
    'Syngas Fischer-Tropsch Catalytic Hydrogenation',
    'Continuous catalytic hydrogenation of carbon monoxide to synthetic C5-C20 liquid hydrocarbon fuels utilizing structured cobalt-ruthenium catalyst beds under elevated temperature and pressure.',
    'ACTIVE',
    '2026-09-01 08:00:00+00',
    '2026-10-15 14:30:00+00'
),
(
    'a0000000-0000-0000-0000-000000000002',
    'PRJ-SCO2-EXT',
    'Supercritical CO2 Countercurrent Extraction',
    'High-pressure supercritical fluid carbon dioxide extraction and selective fractionation of high-value oleochemicals and botanical active ingredients with automated Coriolis mass flow regulation.',
    'ACTIVE',
    '2026-08-15 09:00:00+00',
    '2026-10-12 11:15:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Research Objectives
INSERT INTO research_objectives (id, project_id, objective_code, problem_statement, target_specification, created_at)
VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'OBJ-FT-CONV',
    'High exothermicity in Fischer-Tropsch synthesis causes local hotspot thermal runaways (>245°C), triggering cobalt catalyst active-site sintering, excessive methane selectivity (>30 mol%), and column overpressurization.',
    'Achieve single-pass CO conversion >= 85.0%, maintain peak catalyst bed radial Delta-T <= 8.0°C, and limit column differential pressure drop to <= 1.5 bar at space velocities >= 4500 h^-1.',
    '2026-09-02 08:30:00+00'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'OBJ-SCO2-YIELD',
    'High-pressure dense-phase CO2 micro-channel fluctuations cause seal creeping and pressure oscillation in extraction vessels above 250 bar.',
    'Attain target active extraction recovery >= 92.0% with solvent-to-feed ratio <= 20.0 kg CO2/kg raw feed at 280 bar steady operating pressure with pressure sigma <= 0.5 bar.',
    '2026-08-16 10:00:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Acceptance Criteria
INSERT INTO acceptance_criteria (id, objective_id, metric_name, operator, target_value, target_max_value, unit, is_critical, created_at)
VALUES
(
    'c1000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Syngas Conversion Yield',
    '>=',
    85.000000,
    NULL,
    '%',
    TRUE,
    '2026-09-02 09:00:00+00'
),
(
    'c1000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Catalyst Bed Delta-T',
    '<=',
    8.000000,
    NULL,
    'degC',
    TRUE,
    '2026-09-02 09:00:00+00'
),
(
    'c1000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'Differential Pressure Drop',
    '<=',
    1.500000,
    NULL,
    'bar',
    FALSE,
    '2026-09-02 09:00:00+00'
),
(
    'c1000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000001',
    'Effluent Space Velocity',
    '>=',
    4500.000000,
    NULL,
    'h^-1',
    FALSE,
    '2026-09-02 09:00:00+00'
),
(
    'c1000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000002',
    'Extraction Recovery',
    '>=',
    92.000000,
    NULL,
    '%',
    TRUE,
    '2026-08-16 10:15:00+00'
),
(
    'c1000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000002',
    'Operating Pressure',
    '>=',
    275.000000,
    NULL,
    'bar',
    TRUE,
    '2026-08-16 10:15:00+00'
),
(
    'c1000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000002',
    'Pressure Fluctuation Sigma',
    '<=',
    0.500000,
    NULL,
    'bar',
    FALSE,
    '2026-08-16 10:15:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Apparatus Rigs
INSERT INTO apparatus (id, project_id, apparatus_code, name, apparatus_type, description, created_at)
VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'RIG-CAT-FLOW',
    'Tubular Catalytic Flow Reactor Skid',
    'Fixed-Bed Micro-Pilot Plant',
    'Multi-zone temperature-controlled tubular reactor for gas-phase Fischer-Tropsch catalytic synthesis with dual-annulus oil cooling jacket, backpressure regulator, and online GC sampling.',
    '2026-09-03 10:00:00+00'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'RIG-EXTRACT-04',
    'Supercritical CO2 Countercurrent Extraction Column',
    'High-Pressure Supercritical Extraction Skid',
    'High-pressure continuous countercurrent fractionation column rated for 400 bar / 150°C with automated Coriolis mass flow metering and dual cyclonic separators.',
    '2026-08-17 11:00:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Apparatus Versions
-- Insert initial records with is_immutable = false to allow child bom_items insertion without triggering immutability constraints, then freeze below.
INSERT INTO apparatus_versions (
    id, apparatus_id, parent_version_id, version_number, version_tag, status,
    operating_parameters, design_rationale, safety_constraints, is_immutable,
    branch_label, version_seq, created_at
)
VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    NULL,
    1,
    'V1.0',
    'FAILED',
    '{"temperature_c": 245, "pressure_bar": 25.0, "feed_rate_ml_min": 5.0, "coolant_flow_l_h": 120, "space_velocity_h": 4200, "dilution_ratio": "0%"}'::jsonb,
    'Initial baseline fixed-bed design with 100% undiluted 20% Co/Al2O3 extruded pellets and mineral oil thermal jacket.',
    'Operating limit: Max temperature 260°C, max reactor pressure 35 bar, rupture disk burst threshold 40 bar.',
    FALSE,
    'main',
    1,
    '2026-09-05 09:00:00+00'
),
(
    'd0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    2,
    'V2.0',
    'NEEDS_IMPROVEMENT',
    '{"temperature_c": 235, "pressure_bar": 25.0, "feed_rate_ml_min": 5.5, "coolant_flow_l_h": 160, "space_velocity_h": 4500, "dilution_ratio": "25% SiC"}'::jsonb,
    'Branched from V1.0: Introduced 25% inert Silicon Carbide (SiC) catalyst dilution and upgraded coolant recirculation pump flow from 120 L/h to 160 L/h to mitigate radial hotspots.',
    'Operating limit: Max temperature 250°C, max reactor pressure 35 bar, emergency N2 dump on bed Delta-T > 15°C.',
    FALSE,
    'main',
    2,
    '2026-09-20 14:00:00+00'
),
(
    'd0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    3,
    'V3.0',
    'SUCCESSFUL',
    '{"temperature_c": 225, "pressure_bar": 25.0, "feed_rate_ml_min": 5.8, "coolant_flow_l_h": 220, "space_velocity_h": 4800, "dilution_ratio": "50% SiC"}'::jsonb,
    'Validated production baseline: 50% SiC thermal dilution bed, Hastelloy C-276 inner core sleeve, Inconel 600 multi-point thermocouple rake, and 220 L/h synthetic heat transfer fluid circulation.',
    'Operating limit: Max temperature 240°C, max pressure 35 bar, Kalrez 6375 perfluoroelastomer seal rating, SIL-2 interlock on Delta-T > 10°C.',
    FALSE,
    'main',
    3,
    '2026-10-08 11:30:00+00'
),
(
    'd0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000002',
    NULL,
    1,
    'V1.0',
    'NEEDS_IMPROVEMENT',
    '{"extraction_pressure_bar": 250.0, "column_temp_c": 45.0, "co2_flow_kg_h": 12.0, "separator_p_bar": 65.0}'::jsonb,
    'Standard 316L stainless steel extraction column with PTFE chevron packings and manual needle regulation.',
    'Overpressure safety relief valve set at 320 bar.',
    FALSE,
    'main',
    1,
    '2026-08-18 10:00:00+00'
),
(
    'd0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000004',
    2,
    'V2.1',
    'SUCCESSFUL',
    '{"extraction_pressure_bar": 280.0, "column_temp_c": 50.0, "co2_flow_kg_h": 18.5, "separator_p_bar": 60.0}'::jsonb,
    'Upgraded to SS 316Ti forged column with Kalrez 6375 O-rings, Monel 400 micro-metering valves, and Coriolis mass flow feedback loop.',
    'Rated 400 bar burst threshold, certified helium leak test < 1x10^-6 mbar L/s.',
    FALSE,
    'main',
    2,
    '2026-09-27 15:00:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Bill of Materials (BOM) Items per Version
INSERT INTO bom_items (
    id, apparatus_version_id, component_name, component_type, material,
    dimensions, quantity, unit, part_number_or_supplier, custom_specs
)
VALUES
-- V1.0 (RIG-CAT-FLOW - FAILED)
(
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'Primary Tubular Reactor Body',
    'Reactor Core',
    'Stainless Steel 316L',
    'ID 12.7 mm x OD 19.05 mm x 600 mm',
    1.000,
    'pcs',
    'SS-316L-TUB-05',
    '{"surface_roughness_ra_um": 0.8, "burst_rating_bar": 45}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000001',
    'Active Catalyst Pellets',
    'Active Catalyst Charge',
    'Co/Al2O3 (20 wt% Co)',
    '1.5 mm cylindrical extrudates',
    85.000,
    'g',
    'CAT-CO-AL2O3-STD',
    '{"metal_dispersion_pct": 8.5, "pore_volume_ml_g": 0.42, "dilution_ratio": "0%"}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000001',
    'Axial Thermowell',
    'Instrumentation Sheath',
    'Stainless Steel 316L',
    'OD 3.18 mm, Wall 0.5 mm',
    1.000,
    'pcs',
    'TW-SS316-01',
    '{"sensing_points": 1, "thermal_response_tau_s": 4.2}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000001',
    'Cooling Annulus Jacket',
    'Heat Exchanger',
    'Stainless Steel 304',
    'ID 38.1 mm x Length 500 mm',
    1.000,
    'pcs',
    'JKT-SS304-40',
    '{"fluid": "Mineral Oil", "max_flow_l_h": 140}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000005',
    'd0000000-0000-0000-0000-000000000001',
    'Flange Face Gaskets',
    'Gasket Seal',
    'Virgin PTFE (Teflon)',
    'ConFlat CF-25 flange seal',
    4.000,
    'pcs',
    'GSK-PTFE-CF25',
    '{"max_temp_c": 200, "creeping_threshold_bar": 22}'::jsonb
),

-- V2.0 (RIG-CAT-FLOW - NEEDS IMPROVEMENT)
(
    'e0000000-0000-0000-0000-000000000006',
    'd0000000-0000-0000-0000-000000000002',
    'Primary Tubular Reactor Body',
    'Reactor Core',
    'Stainless Steel 316L',
    'ID 12.7 mm x OD 19.05 mm x 600 mm',
    1.000,
    'pcs',
    'SS-316L-TUB-05',
    '{"surface_roughness_ra_um": 0.8, "burst_rating_bar": 45}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000007',
    'd0000000-0000-0000-0000-000000000002',
    'Diluted Catalyst Bed Charge',
    'Catalytic Bed Matrix',
    'Co/Al2O3 + SiC (25% dilution)',
    '65g Co/Al2O3 + 20g alpha-SiC',
    85.000,
    'g',
    'CAT-CO-SIC-25DIL',
    '{"active_co_wt_pct": 15.3, "dilution_ratio": "25% SiC"}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000008',
    'd0000000-0000-0000-0000-000000000002',
    'Multipoint Thermocouple Rake',
    'Internal Sensor Array',
    'Inconel 600 (UNS N06600)',
    'OD 3.18 mm x 5-Point Internal Rake',
    1.000,
    'pcs',
    'TC-INC600-5PT',
    '{"junction_spacing_mm": 50, "calibration": "Type-K Class-1"}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000009',
    'd0000000-0000-0000-0000-000000000002',
    'Baffled Coolant Jacket',
    'Heat Exchanger',
    'Stainless Steel 304 with Spiral Baffles',
    'ID 38.1 mm x Length 500 mm',
    1.000,
    'pcs',
    'JKT-SS304-BAFFLE',
    '{"fluid": "Synthetic Ester Fluid", "flow_rating_l_h": 180}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000010',
    'd0000000-0000-0000-0000-000000000002',
    'Flange High-Temp Gaskets',
    'Gasket Seal',
    'Fluoroelastomer FKM (Viton GF)',
    'AS568-115 O-rings',
    4.000,
    'pcs',
    'GSK-FKM-115',
    '{"max_temp_c": 230, "durometer_shore_a": 80}'::jsonb
),

-- V3.0 (RIG-CAT-FLOW - IMMUTABLE SUCCESSFUL BASELINE)
(
    'e0000000-0000-0000-0000-000000000011',
    'd0000000-0000-0000-0000-000000000003',
    'Heavy-Wall Reactor Core Sleeve',
    'High-Alloy Reactor Core',
    'Hastelloy C-276 (UNS N10276)',
    'ID 12.7 mm x OD 22.2 mm x 650 mm (Wall 4.75 mm)',
    1.000,
    'pcs',
    'HYS-C276-SCH80-CUSTOM',
    '{"thermal_conductivity_w_mk": 12.8, "corrosion_allowance_mm": 0.05, "asme_rated_pressure_bar": 120}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000012',
    'd0000000-0000-0000-0000-000000000003',
    'Engineered 50/50 Isothermal Catalyst Bed',
    'Catalyst & Thermal Dissipation Bed',
    'Co/Al2O3 + SiC (50/50 wt% dilution)',
    '45g 20wt% Co/Al2O3 + 45g alpha-SiC Beads',
    90.000,
    'g',
    'CAT-CO-SIC-50ISO',
    '{"sic_thermal_cond_w_mk": 120.0, "cobalt_wt_pct": 10.0, "pellet_diameter_mm": 1.2}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000013',
    'd0000000-0000-0000-0000-000000000003',
    'Thermally Conductive Diluent Beads',
    'Conductive Matrix Diluent',
    'Silicon Carbide (SiC alpha-phase 99.8%)',
    'Spherical beads 1.0 - 1.2 mm diameter',
    45.000,
    'g',
    'SIC-ALPHA-SPH-12',
    '{"sintered_density_g_cm3": 3.15, "hardness_mohs": 9.5, "thermal_diffusivity_cm2_s": 0.45}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000014',
    'd0000000-0000-0000-0000-000000000003',
    '7-Point Multipoint Thermocouple Array',
    'Internal Sensor Array',
    'Inconel 600 (UNS N06600)',
    'OD 2.4 mm x 7-Point Fast-Response Rake',
    1.000,
    'pcs',
    'OMEGA-INC600-7PT',
    '{"response_time_ms": 280, "uncertainty_k2_degc": 0.25, "sensor_positions_mm": [20, 40, 60, 80, 100, 140, 180]}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000015',
    'd0000000-0000-0000-0000-000000000003',
    'High-Flux Turbulent Heat Exchange Shell',
    'Cooling Exchanger Shell',
    'Nickel 200 (UNS N02200)',
    'Spiral guide shell, ID 42 mm x Length 550 mm',
    1.000,
    'pcs',
    'NI200-SHELL-HIQ',
    '{"thermal_conductivity_w_mk": 70.2, "rated_reynolds_number": 4800, "flow_capacity_l_h": 250}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000016',
    'd0000000-0000-0000-0000-000000000003',
    'Dual-Stage Backpressure Micro-Regulator',
    'Pressure Control Valve',
    'Monel 400 (UNS N04400)',
    '1/4 inch Swagelok tube fittings, 0-50 bar',
    1.000,
    'pcs',
    'SWAGELOK-BP-M400-05',
    '{"seat_material": "Kalrez 6375", "cv": 0.04, "control_precision_bar": 0.05}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000017',
    'd0000000-0000-0000-0000-000000000003',
    'Engineered Perfluoroelastomer Seals',
    'Critical Flange Gasket Seal',
    'Kalrez 6375 Perfluoroelastomer (FFKM)',
    'Custom precision molded face seal',
    4.000,
    'pcs',
    'DUPONT-KALREZ-6375',
    '{"continuous_rating_temp_c": 275, "chemical_inertness": "Universal", "compression_set_pct": 14}'::jsonb
),

-- V2.1 (RIG-EXTRACT-04 - IMMUTABLE SUCCESSFUL)
(
    'e0000000-0000-0000-0000-000000000018',
    'd0000000-0000-0000-0000-000000000005',
    'Forged Supercritical Extraction Column',
    'High Pressure Vessel',
    'SS 316Ti (Titanium-Stabilized)',
    'ID 50.8 mm x OD 88.9 mm x 1200 mm',
    1.000,
    'pcs',
    'COL-316TI-400BAR',
    '{"design_pressure_bar": 400, "design_temp_c": 150}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000019',
    'd0000000-0000-0000-0000-000000000005',
    'Micro-Metering Backpressure Control Valve',
    'Pressure Regulating Valve',
    'Monel 400 (UNS N04400)',
    '1/4 inch NPT female, rated 400 bar',
    2.000,
    'pcs',
    'MONEL-NV-400B',
    '{"stem_hardened": "Stellite 6", "cv": 0.02}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000020',
    'd0000000-0000-0000-0000-000000000005',
    'High-Pressure O-Ring Static Seals',
    'Vessel Closure Seal',
    'Kalrez 6375 Perfluoroelastomer (FFKM)',
    'AS568-220 high durometer 90 Shore A',
    6.000,
    'pcs',
    'KALREZ-OR-220-90A',
    '{"explosive_decompression_resistance": "Norsok M-710 certified"}'::jsonb
),
(
    'e0000000-0000-0000-0000-000000000021',
    'd0000000-0000-0000-0000-000000000005',
    'Reverse-Buckling Rupture Disk Assembly',
    'Safety Relief Mechanism',
    'Nickel 200 (UNS N02200)',
    'Nominal size 1/2 inch, burst 350 bar @ 100°C',
    2.000,
    'pcs',
    'NI200-RD-350BAR',
    '{"burst_tolerance_pct": 3.0, "manufacturing_range": 0}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 7. Operating Parameter Records (Typed EAV from 002)
INSERT INTO operating_parameter_records (
    id, apparatus_version_id, param_key, param_type, value_original,
    unit_original, value_si, uncertainty_margin
)
VALUES
-- V1.0 (RIG-CAT-FLOW)
('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'bed_temperature', 'TEMPERATURE', 245.000000, 'degC', 518.15000000, 1.500000),
('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'reactor_pressure', 'PRESSURE_GAUGE', 25.000000, 'bar', 2500000.00000000, 0.200000),
('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'coolant_flow', 'FLOW_ACTUAL', 120.000000, 'L/h', 0.00003333, 4.000000),

-- V3.0 (RIG-CAT-FLOW)
('f0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000003', 'bed_temperature', 'TEMPERATURE', 225.000000, 'degC', 498.15000000, 0.250000),
('f0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000003', 'reactor_pressure', 'PRESSURE_GAUGE', 25.000000, 'bar', 2500000.00000000, 0.050000),
('f0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', 'coolant_flow', 'FLOW_ACTUAL', 220.000000, 'L/h', 0.00006111, 1.500000),

-- V2.1 (RIG-EXTRACT-04)
('f0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000005', 'extraction_pressure', 'PRESSURE_GAUGE', 280.000000, 'bar', 28000000.00000000, 0.180000),
('f0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000005', 'column_temp', 'TEMPERATURE', 50.000000, 'degC', 323.15000000, 0.200000)
ON CONFLICT (id) DO NOTHING;

-- 8. Experiments & Failure Autopsy Records
INSERT INTO experiments (
    id, project_id, apparatus_version_id, experiment_code, conducted_at,
    procedure_steps, observed_deviations, primary_outcome, engineer_notes,
    failure_symptoms, is_locked, created_at
)
VALUES
-- EXP-8902 on V1.0 (Failed Run / Autopsy)
(
    '10000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'EXP-8902',
    '2026-09-10 14:22:00+00',
    '1. Reactor purged with N2 at 5 bar for 45 mins.
2. Heated to 220°C at 2.0°C/min ramp rate under N2.
3. Switched feed to syngas (H2/CO = 2.05:1) at 25 bar.
4. Increased space velocity to 4200 h^-1.',
    'Observed severe thermal runaway above 248°C. Catalyst bed radial Delta-T surged to +22.8°C (limit <= 8.0°C). Single-pass syngas conversion collapsed from 78.5% down to 61.4% with rapid methane runaway (CH4 selectivity > 34%). Differential pressure drop across catalyst bed spiked to 3.2 bar (target <= 1.5 bar).',
    'FAILED',
    'Autopsy Conclusion: Catalyst bed experienced laminar cooling starvation. Undiluted 20% Co/Al2O3 extruded pellets created severe localized exotherm at bed inlet (45-60 mm elevation). Scanning electron microscopy post-mortem confirmed cobalt crystallite sintering from 11 nm to 34 nm and graphitic coke shell encapsulation.',
    'Symptom 1: Localized radial hotspot (+22.8°C above jacket oil).
Symptom 2: Rapid loss of CO conversion (61.4% vs 85.0% target).
Symptom 3: Severe pressure drop spike to 3.2 bar caused by catalyst thermal fracturing and fines accumulation.
Symptom 4: Mineral oil coolant exit temperature rose 14.5°C over supply.',
    TRUE,
    '2026-09-10 16:00:00+00'
),
-- EXP-8915 on V2.0 (Needs Improvement)
(
    '10000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    'EXP-8915',
    '2026-09-24 10:15:00+00',
    '1. Reactor purged and preheated to 220°C.
2. Syngas fed at 25 bar with 160 L/h synthetic coolant circulation.
3. 25% SiC dilution bed evaluated at GHSV 4500 h^-1.',
    'Bed radial Delta-T reduced from 22.8°C to 11.4°C with 25% SiC dilution. Syngas conversion stabilized at 81.2% (target 85.0%). Differential pressure remained high at 2.1 bar due to non-uniform pellet packing density.',
    'NEEDS_IMPROVEMENT',
    'SiC thermal dilution successfully dampened runaway tendency, but 25% dilution is insufficient to meet the strict <= 8.0°C Delta-T criterion. Increased dilution to 50% required along with Hastelloy sleeve for enhanced radial thermal conduction.',
    'Hotspot peak at 70 mm reached 11.4°C over setpoint. Single-pass conversion 81.2% fell 3.8% short of critical acceptance threshold.',
    TRUE,
    '2026-09-24 12:30:00+00'
),
-- EXP-8940 on V3.0 (Certified Run 1 - Successful)
(
    '10000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003',
    'EXP-8940',
    '2026-10-09 08:30:00+00',
    '1. N2 purge at 5 bar for 30 minutes.
2. Ramp to 225°C under synthetic coolant flow of 220 L/h.
3. Syngas feed introduced at 25 bar, GHSV 4800 h^-1.
4. Continuous 48-hour steady-state logging.',
    'Zero thermal excursion detected. Steady-state catalytic conversion achieved 87.4% across 48 continuous hours. Radial bed Delta-T remained tightly regulated at 5.4°C (target <= 8.0°C). Differential pressure drop held stable at 1.15 bar (target <= 1.5 bar). Methane selectivity restrained below 8.2 mol%.',
    'SUCCESSFUL',
    '50/50 SiC dilution in Hastelloy C-276 sleeve combined with 220 L/h turbulent cooling achieved near-perfect isothermal plug-flow behavior. All critical acceptance criteria met with expanded uncertainty margin.',
    'None. Post-run borescope inspection revealed pristine catalyst pellets without fragmentation or carbon deposition.',
    TRUE,
    '2026-10-11 10:00:00+00'
),
-- EXP-8941 on V3.0 (Certified Run 2 - Reproducibility Replicate)
(
    '10000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003',
    'EXP-8941',
    '2026-10-12 09:00:00+00',
    '1. Identical repeat protocol to EXP-8940.
2. Independent syngas feed batch and fresh catalyst charge.
3. 48-hour verification run for ISO 17025 certification.',
    'Replicate run confirmed high repeatability: Syngas conversion 86.9% ± 0.38%, peak radial Delta-T 5.7°C ± 0.20°C, differential pressure drop 1.18 bar ± 0.05 bar.',
    'SUCCESSFUL',
    'Verified statistical reproducibility across multi-day campaigns. Sigma on conversion across runs is 0.42%. Fully certified for pilot production.',
    'None. System performance repeatable within 95% confidence interval.',
    TRUE,
    '2026-10-14 11:30:00+00'
),
-- EXP-7720 on RIG-EXTRACT-04 V2.1 (Successful)
(
    '10000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000005',
    'EXP-7720',
    '2026-09-28 08:00:00+00',
    '1. Pressurized column to 280 bar with dense CO2.
2. Heated to 50°C.
3. Commenced countercurrent feed at 1.0 kg/h with CO2 solvent at 18.5 kg/h.
4. Monitored backpressure valve stability via Monel 400 micro-metering.',
    'Supercritical CO2 extraction achieved 94.6% active yield at 280 bar. Monel 400 micro-metering valves maintained column backpressure within ±0.18 bar. Zero seal leakage or Kalrez extrusion observed.',
    'SUCCESSFUL',
    'Process verified across 5 consecutive replicate batches. Average recovery 94.6% exceeds 92.0% target.',
    'None. Kalrez 6375 seals showed 0% explosive decompression damage.',
    TRUE,
    '2026-09-29 16:00:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- 9. Scientific Measurements with Uncertainty (±sigma)
INSERT INTO measurements (
    id, experiment_id, parameter_name, measured_value, uncertainty_margin,
    unit, base_si_value, run_index, sample_timestamp, is_outlier
)
VALUES
-- Measurements for EXP-8902 (FAILED)
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Syngas Conversion Yield', 61.400000, 1.200000, '%', 0.61400000, 1, '2026-09-10 15:00:00+00', FALSE),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Catalyst Bed Delta-T', 22.800000, 0.600000, 'degC', 22.80000000, 1, '2026-09-10 15:00:00+00', FALSE),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Differential Pressure Drop', 3.200000, 0.150000, 'bar', 320000.00000000, 1, '2026-09-10 15:00:00+00', FALSE),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Effluent Space Velocity', 3850.000000, 80.000000, 'h^-1', 1.06940000, 1, '2026-09-10 15:00:00+00', FALSE),

-- Measurements for EXP-8915 (NEEDS_IMPROVEMENT)
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Syngas Conversion Yield', 81.200000, 0.900000, '%', 0.81200000, 1, '2026-09-24 11:30:00+00', FALSE),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'Catalyst Bed Delta-T', 11.400000, 0.400000, 'degC', 11.40000000, 1, '2026-09-24 11:30:00+00', FALSE),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', 'Differential Pressure Drop', 2.100000, 0.100000, 'bar', 210000.00000000, 1, '2026-09-24 11:30:00+00', FALSE),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 'Effluent Space Velocity', 4400.000000, 60.000000, 'h^-1', 1.22220000, 1, '2026-09-24 11:30:00+00', FALSE),

-- Measurements for EXP-8940 (SUCCESSFUL Run 1)
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', 'Syngas Conversion Yield', 87.400000, 0.350000, '%', 0.87400000, 1, '2026-10-09 16:00:00+00', FALSE),
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000003', 'Catalyst Bed Delta-T', 5.400000, 0.250000, 'degC', 5.40000000, 1, '2026-10-09 16:00:00+00', FALSE),
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000003', 'Differential Pressure Drop', 1.150000, 0.050000, 'bar', 115000.00000000, 1, '2026-10-09 16:00:00+00', FALSE),
('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000003', 'Effluent Space Velocity', 4820.000000, 45.000000, 'h^-1', 1.33890000, 1, '2026-10-09 16:00:00+00', FALSE),

-- Measurements for EXP-8941 (SUCCESSFUL Run 2 - Replicate)
('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000004', 'Syngas Conversion Yield', 86.900000, 0.380000, '%', 0.86900000, 1, '2026-10-12 16:00:00+00', FALSE),
('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000004', 'Catalyst Bed Delta-T', 5.700000, 0.200000, 'degC', 5.70000000, 1, '2026-10-12 16:00:00+00', FALSE),
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000004', 'Differential Pressure Drop', 1.180000, 0.050000, 'bar', 118000.00000000, 1, '2026-10-12 16:00:00+00', FALSE),
('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000004', 'Effluent Space Velocity', 4790.000000, 40.000000, 'h^-1', 1.33060000, 1, '2026-10-12 16:00:00+00', FALSE),

-- Measurements for EXP-7720 (Supercritical Extraction)
('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000005', 'Extraction Recovery', 94.600000, 0.300000, '%', 0.94600000, 1, '2026-09-28 12:00:00+00', FALSE),
('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000005', 'Operating Pressure', 280.200000, 0.180000, 'bar', 28020000.00000000, 1, '2026-09-28 12:00:00+00', FALSE),
('20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000005', 'Solvent Ratio', 18.500000, 0.200000, 'kg/kg', 18.50000000, 1, '2026-09-28 12:00:00+00', FALSE)
ON CONFLICT (id) DO NOTHING;

-- 10. Experiment Criteria Snapshots (from 002)
INSERT INTO experiment_criteria_snapshots (
    id, experiment_id, metric_name, operator, target_value, target_max_value,
    unit, observed_mean, expanded_uncertainty_k2, verdict, is_critical, evaluated_at
)
VALUES
-- Snapshots for EXP-8902 (FAILED)
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Syngas Conversion Yield', '>=', 85.000000, NULL, '%', 61.400000, 2.400000, 'FAILED', TRUE, '2026-09-10 15:30:00+00'),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Catalyst Bed Delta-T', '<=', 8.000000, NULL, 'degC', 22.800000, 1.200000, 'FAILED', TRUE, '2026-09-10 15:30:00+00'),
('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Differential Pressure Drop', '<=', 1.500000, NULL, 'bar', 3.200000, 0.300000, 'FAILED', FALSE, '2026-09-10 15:30:00+00'),

-- Snapshots for EXP-8940 (PASSED)
('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'Syngas Conversion Yield', '>=', 85.000000, NULL, '%', 87.400000, 0.700000, 'PASSED', TRUE, '2026-10-09 17:00:00+00'),
('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'Catalyst Bed Delta-T', '<=', 8.000000, NULL, 'degC', 5.400000, 0.500000, 'PASSED', TRUE, '2026-10-09 17:00:00+00'),
('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'Differential Pressure Drop', '<=', 1.500000, NULL, 'bar', 1.150000, 0.100000, 'PASSED', FALSE, '2026-10-09 17:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- 11. AI Root-Cause Analyses & Improvement Hypotheses
INSERT INTO ai_analyses (
    id, experiment_id, model_identifier, outcome_summary, performance_gap_analysis,
    ranked_causes, safety_verification, generated_at, reviewed_by_engineer
)
VALUES
(
    '40000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'claude-3-5-sonnet-chemical-phys',
    'Catalytic thermal runaway confirmed. Radial heat dissipation capacity is exceeded by the exothermic hydrogenation enthalpy of the concentrated cobalt bed.',
    'Syngas conversion 61.4% fell 23.6% below target (85.0%). Catalyst bed Delta-T 22.8°C exceeded limit (8.0°C) by 14.8°C. Differential pressure 3.2 bar exceeded limit (1.5 bar) by 1.7 bar.',
    '[
        {"cause": "Laminar boundary layer thermal stagnation inside cooling jacket annulus", "evidence_level": 5},
        {"cause": "Absence of inert conductive diluent causing catastrophic hotspot at inlet 45-60mm", "evidence_level": 5},
        {"cause": "Thermal sintering of cobalt crystallites (11nm -> 34nm) causing permanent active site loss", "evidence_level": 4},
        {"cause": "Fine catalyst pellet attrition causing bed compaction and differential pressure surge to 3.2 bar", "evidence_level": 4}
    ]'::jsonb,
    'Rupture disk rated at 40 bar remained intact. Emergency N2 purge successfully brought temperature below 180°C within 12 minutes. Flange seals showed thermal deformation.',
    '2026-09-10 16:30:00+00',
    TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO improvement_hypotheses (
    id, ai_analysis_id, title, rationale, expected_benefit, potential_risks,
    evidential_support_score, approval_status, created_at
)
VALUES
(
    '50000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    'Dilute catalyst bed 1:1 with inert alpha-SiC beads & upgrade coolant circulation to turbulent regime',
    'Silicon carbide possesses high thermal conductivity (120 W/mK) compared to porous alumina (0.3 W/mK). 50% dilution spreads volumetric heat generation over double the axial length, allowing radial jacket heat flux to keep pace with hydrogenation kinetics.',
    'Eliminates localized hotspots, reduces bed Delta-T below 6.0°C, prevents cobalt active-site sintering, and restores single-pass syngas conversion to >= 86%.',
    'Requires doubling reactor tube length to maintain identical space velocity and catalyst residence time.',
    5,
    'ACCEPTED',
    '2026-09-11 09:00:00+00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO proposed_changes (
    id, hypothesis_id, change_type, target_component, before_spec, after_spec, promoted_to_version_id
)
VALUES
(
    '60000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000001',
    'COMPONENT_REPLACE',
    'Catalyst Bed Matrix',
    '{"dilution_ratio": "0%", "material": "Co/Al2O3 100%"}'::jsonb,
    '{"dilution_ratio": "50% SiC", "material": "Co/Al2O3 + alpha-SiC 50/50 wt%"}'::jsonb,
    'd0000000-0000-0000-0000-000000000003'
),
(
    '60000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000001',
    'PARAM_MOD',
    'Coolant Jacket Recirculation Flow',
    '{"flow_l_h": 120, "flow_regime": "Laminar"}'::jsonb,
    '{"flow_l_h": 220, "flow_regime": "Turbulent (Re > 4500)"}'::jsonb,
    'd0000000-0000-0000-0000-000000000003'
),
(
    '60000000-0000-0000-0000-000000000003',
    '50000000-0000-0000-0000-000000000001',
    'METALLURGY_UPGRADE',
    'Reactor Core Tube',
    '{"material": "SS 316L", "wall_thickness_mm": 3.175}'::jsonb,
    '{"material": "Hastelloy C-276", "wall_thickness_mm": 4.75}'::jsonb,
    'd0000000-0000-0000-0000-000000000003'
)
ON CONFLICT (id) DO NOTHING;

-- 12. Reproducibility Certification Records
INSERT INTO reproducibility_records (
    id, apparatus_version_id, validated_run_count, standard_deviation,
    repeatability_verdict, certified_at
)
VALUES
(
    '70000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003',
    4,
    0.004200,
    'Demonstrated 100% repeatability across 4 independent test batches without thermal excursion. Standard deviation on single-pass conversion is σ = ±0.42%. Certified as Immutable Blueprint Baseline.',
    '2026-10-14 14:00:00+00'
),
(
    '70000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000005',
    5,
    0.001800,
    'Demonstrated high reproducibility across 5 independent supercritical CO2 extraction replicates. Backpressure variation σ = ±0.18 bar. Certified as Immutable Production Blueprint.',
    '2026-09-30 11:00:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- 13. Audited Configuration Amendments
INSERT INTO configuration_amendments (
    id, apparatus_version_id, reason, field_amended, previous_value, corrected_value, signed_by, amendment_timestamp
)
VALUES
(
    '80000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003',
    'Calibration adjustment: Omega multipoint thermocouple array factory calibration certificate re-measured sensing offset at 225°C.',
    'operating_parameters.temperature_offset_c',
    '{"offset_c": 0.0}'::jsonb,
    '{"offset_c": -0.15}'::jsonb,
    'Dr. A. Batra, Lead Chemical Process R&D',
    '2026-10-14 16:45:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- 14. Freeze Successful Versions into Immutable Records
-- Now that all child entities (BOM items, parameters, experiments) are seeded, activate immutability lock.
UPDATE apparatus_versions
SET is_immutable = TRUE
WHERE id IN (
    'd0000000-0000-0000-0000-000000000003', -- V3.0 RIG-CAT-FLOW
    'd0000000-0000-0000-0000-000000000005'  -- V2.1 RIG-EXTRACT-04
);
