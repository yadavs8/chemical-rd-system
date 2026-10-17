import { Project, Apparatus, ApparatusVersion, BomItem, Experiment, Measurement, ResearchObjective, AcceptanceCriterion } from "@/types";

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    project_code: "PRJ-SYNGAS-FT",
    title: "Syngas Fischer-Tropsch Catalytic Hydrogenation",
    description: "Continuous catalytic hydrogenation of carbon monoxide to synthetic C5-C20 liquid hydrocarbon fuels utilizing structured cobalt-ruthenium catalyst beds under elevated temperature and pressure.",
    status: "ACTIVE",
    created_at: "2026-09-01T08:00:00.000Z",
    updated_at: "2026-10-15T14:30:00.000Z"
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    project_code: "PRJ-SCO2-EXT",
    title: "Supercritical CO2 Countercurrent Extraction",
    description: "High-pressure supercritical fluid carbon dioxide extraction and selective fractionation of high-value oleochemicals and botanical active ingredients with automated Coriolis mass flow regulation.",
    status: "ACTIVE",
    created_at: "2026-08-15T09:00:00.000Z",
    updated_at: "2026-10-12T11:15:00.000Z"
  }
];

export const INITIAL_OBJECTIVES: ResearchObjective[] = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    project_id: "a0000000-0000-0000-0000-000000000001",
    objective_code: "OBJ-FT-CONV",
    problem_statement: "High exothermicity in Fischer-Tropsch synthesis causes local hotspot thermal runaways (>245°C), triggering cobalt catalyst active-site sintering, excessive methane selectivity (>30 mol%), and column overpressurization.",
    target_specification: "Achieve single-pass CO conversion >= 85.0%, maintain peak catalyst bed radial Delta-T <= 8.0°C, and limit column differential pressure drop to <= 1.5 bar at space velocities >= 4500 h^-1.",
    created_at: "2026-09-02T08:30:00.000Z"
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    project_id: "a0000000-0000-0000-0000-000000000002",
    objective_code: "OBJ-SCO2-YIELD",
    problem_statement: "High-pressure dense-phase CO2 micro-channel fluctuations cause seal creeping and pressure oscillation in extraction vessels above 250 bar.",
    target_specification: "Attain target active extraction recovery >= 92.0% with solvent-to-feed ratio <= 20.0 kg CO2/kg raw feed at 280 bar steady operating pressure with pressure sigma <= 0.5 bar.",
    created_at: "2026-08-16T10:00:00.000Z"
  }
];

export const INITIAL_CRITERIA: AcceptanceCriterion[] = [
  {
    id: "c1000000-0000-0000-0000-000000000001",
    objective_id: "b0000000-0000-0000-0000-000000000001",
    metric_name: "Syngas Conversion Yield",
    operator: ">=",
    target_value: 85.0,
    target_max_value: null,
    unit: "%",
    is_critical: true
  },
  {
    id: "c1000000-0000-0000-0000-000000000002",
    objective_id: "b0000000-0000-0000-0000-000000000001",
    metric_name: "Catalyst Bed Delta-T",
    operator: "<=",
    target_value: 8.0,
    target_max_value: null,
    unit: "degC",
    is_critical: true
  },
  {
    id: "c1000000-0000-0000-0000-000000000003",
    objective_id: "b0000000-0000-0000-0000-000000000001",
    metric_name: "Differential Pressure Drop",
    operator: "<=",
    target_value: 1.5,
    target_max_value: null,
    unit: "bar",
    is_critical: false
  },
  {
    id: "c1000000-0000-0000-0000-000000000004",
    objective_id: "b0000000-0000-0000-0000-000000000001",
    metric_name: "Effluent Space Velocity",
    operator: ">=",
    target_value: 4500.0,
    target_max_value: null,
    unit: "h^-1",
    is_critical: false
  },
  {
    id: "c1000000-0000-0000-0000-000000000005",
    objective_id: "b0000000-0000-0000-0000-000000000002",
    metric_name: "Extraction Recovery",
    operator: ">=",
    target_value: 92.0,
    target_max_value: null,
    unit: "%",
    is_critical: true
  },
  {
    id: "c1000000-0000-0000-0000-000000000006",
    objective_id: "b0000000-0000-0000-0000-000000000002",
    metric_name: "Operating Pressure",
    operator: ">=",
    target_value: 275.0,
    target_max_value: null,
    unit: "bar",
    is_critical: true
  },
  {
    id: "c1000000-0000-0000-0000-000000000007",
    objective_id: "b0000000-0000-0000-0000-000000000002",
    metric_name: "Pressure Fluctuation Sigma",
    operator: "<=",
    target_value: 0.5,
    target_max_value: null,
    unit: "bar",
    is_critical: false
  }
];

export const INITIAL_APPARATUS: Apparatus[] = [
  {
    id: "c0000000-0000-0000-0000-000000000001",
    project_id: "a0000000-0000-0000-0000-000000000001",
    apparatus_code: "RIG-CAT-FLOW",
    name: "Tubular Catalytic Flow Reactor Skid",
    apparatus_type: "Fixed-Bed Micro-Pilot Plant",
    description: "Multi-zone temperature-controlled tubular reactor for gas-phase Fischer-Tropsch catalytic synthesis with dual-annulus oil cooling jacket, backpressure regulator, and online GC sampling.",
    created_at: "2026-09-03T10:00:00.000Z"
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    project_id: "a0000000-0000-0000-0000-000000000002",
    apparatus_code: "RIG-EXTRACT-04",
    name: "Supercritical CO2 Countercurrent Extraction Column",
    apparatus_type: "High-Pressure Supercritical Extraction Skid",
    description: "High-pressure continuous countercurrent fractionation column rated for 400 bar / 150°C with automated Coriolis mass flow metering and dual cyclonic separators.",
    created_at: "2026-08-17T11:00:00.000Z"
  }
];

export const INITIAL_VERSIONS: ApparatusVersion[] = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    apparatus_id: "c0000000-0000-0000-0000-000000000001",
    parent_version_id: null,
    version_number: 1,
    version_tag: "V1.0",
    status: "FAILED",
    operating_parameters: {
      temperature_c: 245,
      pressure_bar: 25.0,
      feed_rate_ml_min: 5.0,
      coolant_flow_l_h: 120,
      space_velocity_h: 4200,
      dilution_ratio: "0%"
    },
    design_rationale: "Initial baseline fixed-bed design with 100% undiluted 20% Co/Al2O3 extruded pellets and mineral oil thermal jacket.",
    safety_constraints: "Operating limit: Max temperature 260°C, max reactor pressure 35 bar, rupture disk burst threshold 40 bar.",
    is_immutable: false,
    created_at: "2026-09-05T09:00:00.000Z",
    created_by: null,
    branch_label: "main",
    version_seq: 1
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    apparatus_id: "c0000000-0000-0000-0000-000000000001",
    parent_version_id: "d0000000-0000-0000-0000-000000000001",
    version_number: 2,
    version_tag: "V2.0",
    status: "NEEDS_IMPROVEMENT",
    operating_parameters: {
      temperature_c: 235,
      pressure_bar: 25.0,
      feed_rate_ml_min: 5.5,
      coolant_flow_l_h: 160,
      space_velocity_h: 4500,
      dilution_ratio: "25% SiC"
    },
    design_rationale: "Branched from V1.0: Introduced 25% inert Silicon Carbide (SiC) catalyst dilution and upgraded coolant recirculation pump flow from 120 L/h to 160 L/h to mitigate radial hotspots.",
    safety_constraints: "Operating limit: Max temperature 250°C, max reactor pressure 35 bar, emergency N2 dump on bed Delta-T > 15°C.",
    is_immutable: false,
    created_at: "2026-09-20T14:00:00.000Z",
    created_by: null,
    branch_label: "main",
    version_seq: 2
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    apparatus_id: "c0000000-0000-0000-0000-000000000001",
    parent_version_id: "d0000000-0000-0000-0000-000000000002",
    version_number: 3,
    version_tag: "V3.0",
    status: "SUCCESSFUL",
    operating_parameters: {
      temperature_c: 225,
      pressure_bar: 25.0,
      feed_rate_ml_min: 5.8,
      coolant_flow_l_h: 220,
      space_velocity_h: 4800,
      dilution_ratio: "50% SiC"
    },
    design_rationale: "Validated production baseline: 50% SiC thermal dilution bed, Hastelloy C-276 inner core sleeve, Inconel 600 multi-point thermocouple rake, and 220 L/h synthetic heat transfer fluid circulation.",
    safety_constraints: "Operating limit: Max temperature 240°C, max pressure 35 bar, Kalrez 6375 perfluoroelastomer seal rating, SIL-2 interlock on Delta-T > 10°C.",
    is_immutable: true,
    created_at: "2026-10-08T11:30:00.000Z",
    created_by: null,
    branch_label: "main",
    version_seq: 3
  },
  {
    id: "d0000000-0000-0000-0000-000000000004",
    apparatus_id: "c0000000-0000-0000-0000-000000000002",
    parent_version_id: null,
    version_number: 1,
    version_tag: "V1.0",
    status: "NEEDS_IMPROVEMENT",
    operating_parameters: {
      extraction_pressure_bar: 250.0,
      column_temp_c: 45.0,
      co2_flow_kg_h: 12.0,
      separator_p_bar: 65.0
    },
    design_rationale: "Standard 316L stainless steel extraction column with PTFE chevron packings and manual needle regulation.",
    safety_constraints: "Overpressure safety relief valve set at 320 bar.",
    is_immutable: false,
    created_at: "2026-08-18T10:00:00.000Z",
    created_by: null,
    branch_label: "main",
    version_seq: 1
  },
  {
    id: "d0000000-0000-0000-0000-000000000005",
    apparatus_id: "c0000000-0000-0000-0000-000000000002",
    parent_version_id: "d0000000-0000-0000-0000-000000000004",
    version_number: 2,
    version_tag: "V2.1",
    status: "SUCCESSFUL",
    operating_parameters: {
      extraction_pressure_bar: 280.0,
      column_temp_c: 50.0,
      co2_flow_kg_h: 18.5,
      separator_p_bar: 60.0
    },
    design_rationale: "Upgraded to SS 316Ti forged column with Kalrez 6375 O-rings, Monel 400 micro-metering valves, and Coriolis mass flow feedback loop.",
    safety_constraints: "Rated 400 bar burst threshold, certified helium leak test < 1x10^-6 mbar L/s.",
    is_immutable: true,
    created_at: "2026-09-27T15:00:00.000Z",
    created_by: null,
    branch_label: "main",
    version_seq: 2
  }
];

export const INITIAL_BOM_ITEMS: BomItem[] = [
  // V1.0 (RIG-CAT-FLOW - FAILED)
  {
    id: "e0000000-0000-0000-0000-000000000001",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000001",
    component_name: "Primary Tubular Reactor Body",
    component_type: "Reactor Core",
    material: "Stainless Steel 316L",
    dimensions: "ID 12.7 mm x OD 19.05 mm x 600 mm",
    quantity: 1,
    unit: "pcs",
    part_number_or_supplier: "SS-316L-TUB-05",
    custom_specs: { surface_roughness_ra_um: 0.8, burst_rating_bar: 45 }
  },
  {
    id: "e0000000-0000-0000-0000-000000000002",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000001",
    component_name: "Active Catalyst Pellets",
    component_type: "Active Catalyst Charge",
    material: "Co/Al2O3 (20 wt% Co)",
    dimensions: "1.5 mm cylindrical extrudates",
    quantity: 85,
    unit: "g",
    part_number_or_supplier: "CAT-CO-AL2O3-STD",
    custom_specs: { metal_dispersion_pct: 8.5, pore_volume_ml_g: 0.42, dilution_ratio: "0%" }
  },
  {
    id: "e0000000-0000-0000-0000-000000000003",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000001",
    component_name: "Axial Thermowell",
    component_type: "Instrumentation Sheath",
    material: "Stainless Steel 316L",
    dimensions: "OD 3.18 mm, Wall 0.5 mm",
    quantity: 1,
    unit: "pcs",
    part_number_or_supplier: "TW-SS316-01",
    custom_specs: { sensing_points: 1, thermal_response_tau_s: 4.2 }
  },
  {
    id: "e0000000-0000-0000-0000-000000000004",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000001",
    component_name: "Cooling Annulus Jacket",
    component_type: "Heat Exchanger",
    material: "Stainless Steel 304",
    dimensions: "ID 38.1 mm x Length 500 mm",
    quantity: 1,
    unit: "pcs",
    part_number_or_supplier: "JKT-SS304-40",
    custom_specs: { fluid: "Mineral Oil", max_flow_l_h: 140 }
  },
  {
    id: "e0000000-0000-0000-0000-000000000005",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000001",
    component_name: "Flange Face Gaskets",
    component_type: "Gasket Seal",
    material: "Virgin PTFE (Teflon)",
    dimensions: "ConFlat CF-25 flange seal",
    quantity: 4,
    unit: "pcs",
    part_number_or_supplier: "GSK-PTFE-CF25",
    custom_specs: { max_temp_c: 200, creeping_threshold_bar: 22 }
  },

  // V2.0 (RIG-CAT-FLOW - NEEDS IMPROVEMENT)
  {
    id: "e0000000-0000-0000-0000-000000000006",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000002",
    component_name: "Primary Tubular Reactor Body",
    component_type: "Reactor Core",
    material: "Stainless Steel 316L",
    dimensions: "ID 12.7 mm x OD 19.05 mm x 600 mm",
    quantity: 1,
    unit: "pcs",
    part_number_or_supplier: "SS-316L-TUB-05",
    custom_specs: { surface_roughness_ra_um: 0.8, burst_rating_bar: 45 }
  },
  {
    id: "e0000000-0000-0000-0000-000000000007",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000002",
    component_name: "Diluted Catalyst Bed Charge",
    component_type: "Catalytic Bed Matrix",
    material: "Co/Al2O3 + SiC (25% dilution)",
    dimensions: "65g Co/Al2O3 + 20g alpha-SiC",
    quantity: 85,
    unit: "g",
    part_number_or_supplier: "CAT-CO-SIC-25DIL",
    custom_specs: { active_co_wt_pct: 15.3, dilution_ratio: "25% SiC" }
  },
  {
    id: "e0000000-0000-0000-0000-000000000008",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000002",
    component_name: "Multipoint Thermocouple Rake",
    component_type: "Internal Sensor Array",
    material: "Inconel 600 (UNS N06600)",
    dimensions: "OD 3.18 mm x 5-Point Internal Rake",
    quantity: 1,
    unit: "pcs",
    part_number_or_supplier: "TC-INC600-5PT",
    custom_specs: { junction_spacing_mm: 50, calibration: "Type-K Class-1" }
  },
  {
    id: "e0000000-0000-0000-0000-000000000009",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000002",
    component_name: "Baffled Coolant Jacket",
    component_type: "Heat Exchanger",
    material: "Stainless Steel 304 with Spiral Baffles",
    dimensions: "ID 38.1 mm x Length 500 mm",
    quantity: 1,
    unit: "pcs",
    part_number_or_supplier: "JKT-SS304-BAFFLE",
    custom_specs: { fluid: "Synthetic Ester Fluid", flow_rating_l_h: 180 }
  },
  {
    id: "e0000000-0000-0000-0000-000000000010",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000002",
    component_name: "Flange High-Temp Gaskets",
    component_type: "Gasket Seal",
    material: "Fluoroelastomer FKM (Viton GF)",
    dimensions: "AS568-115 O-rings",
    quantity: 4,
    unit: "pcs",
    part_number_or_supplier: "GSK-FKM-115",
    custom_specs: { max_temp_c: 230, durometer_shore_a: 80 }
  },

  // V3.0 (RIG-CAT-FLOW - IMMUTABLE SUCCESSFUL BASELINE)
  {
    id: "e0000000-0000-0000-0000-000000000011",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000003",
    component_name: "Heavy-Wall Reactor Core Sleeve",
    component_type: "High-Alloy Reactor Core",
    material: "Hastelloy C-276 (UNS N10276)",
    dimensions: "ID 12.7 mm x OD 22.2 mm x 650 mm (Wall 4.75 mm)",
    quantity: 1,
    unit: "pcs",
    part_number_or_supplier: "HYS-C276-SCH80-CUSTOM",
    custom_specs: { thermal_conductivity_w_mk: 12.8, corrosion_allowance_mm: 0.05, asme_rated_pressure_bar: 120 }
  },
  {
    id: "e0000000-0000-0000-0000-000000000012",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000003",
    component_name: "Engineered 50/50 Isothermal Catalyst Bed",
    component_type: "Catalyst & Thermal Dissipation Bed",
    material: "Co/Al2O3 + SiC (50/50 wt% dilution)",
    dimensions: "45g 20wt% Co/Al2O3 + 45g alpha-SiC Beads",
    quantity: 90,
    unit: "g",
    part_number_or_supplier: "CAT-CO-SIC-50ISO",
    custom_specs: { sic_thermal_cond_w_mk: 120.0, cobalt_wt_pct: 10.0, pellet_diameter_mm: 1.2 }
  },
  {
    id: "e0000000-0000-0000-0000-000000000013",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000003",
    component_name: "Thermally Conductive Diluent Beads",
    component_type: "Conductive Matrix Diluent",
    material: "Silicon Carbide (SiC alpha-phase 99.8%)",
    dimensions: "Spherical beads 1.0 - 1.2 mm diameter",
    quantity: 45,
    unit: "g",
    part_number_or_supplier: "SIC-ALPHA-SPH-12",
    custom_specs: { sintered_density_g_cm3: 3.15, hardness_mohs: 9.5, thermal_diffusivity_cm2_s: 0.45 }
  },
  {
    id: "e0000000-0000-0000-0000-000000000014",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000003",
    component_name: "7-Point Multipoint Thermocouple Array",
    component_type: "Internal Sensor Array",
    material: "Inconel 600 (UNS N06600)",
    dimensions: "OD 2.4 mm x 7-Point Fast-Response Rake",
    quantity: 1,
    unit: "pcs",
    part_number_or_supplier: "OMEGA-INC600-7PT",
    custom_specs: { response_time_ms: 280, uncertainty_k2_degc: 0.25, sensor_positions_mm: [20, 40, 60, 80, 100, 140, 180] }
  },
  {
    id: "e0000000-0000-0000-0000-000000000015",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000003",
    component_name: "High-Flux Turbulent Heat Exchange Shell",
    component_type: "Cooling Exchanger Shell",
    material: "Nickel 200 (UNS N02200)",
    dimensions: "Spiral guide shell, ID 42 mm x Length 550 mm",
    quantity: 1,
    unit: "pcs",
    part_number_or_supplier: "NI200-SHELL-HIQ",
    custom_specs: { thermal_conductivity_w_mk: 70.2, rated_reynolds_number: 4800, flow_capacity_l_h: 250 }
  },
  {
    id: "e0000000-0000-0000-0000-000000000016",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000003",
    component_name: "Dual-Stage Backpressure Micro-Regulator",
    component_type: "Pressure Control Valve",
    material: "Monel 400 (UNS N04400)",
    dimensions: "1/4 inch Swagelok tube fittings, 0-50 bar",
    quantity: 1,
    unit: "pcs",
    part_number_or_supplier: "SWAGELOK-BP-M400-05",
    custom_specs: { seat_material: "Kalrez 6375", cv: 0.04, control_precision_bar: 0.05 }
  },
  {
    id: "e0000000-0000-0000-0000-000000000017",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000003",
    component_name: "Engineered Perfluoroelastomer Seals",
    component_type: "Critical Flange Gasket Seal",
    material: "Kalrez 6375 Perfluoroelastomer (FFKM)",
    dimensions: "Custom precision molded face seal",
    quantity: 4,
    unit: "pcs",
    part_number_or_supplier: "DUPONT-KALREZ-6375",
    custom_specs: { continuous_rating_temp_c: 275, chemical_inertness: "Universal", compression_set_pct: 14 }
  },

  // V2.1 (RIG-EXTRACT-04 - IMMUTABLE SUCCESSFUL)
  {
    id: "e0000000-0000-0000-0000-000000000018",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000005",
    component_name: "Forged Supercritical Extraction Column",
    component_type: "High Pressure Vessel",
    material: "SS 316Ti (Titanium-Stabilized)",
    dimensions: "ID 50.8 mm x OD 88.9 mm x 1200 mm",
    quantity: 1,
    unit: "pcs",
    part_number_or_supplier: "COL-316TI-400BAR",
    custom_specs: { design_pressure_bar: 400, design_temp_c: 150 }
  },
  {
    id: "e0000000-0000-0000-0000-000000000019",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000005",
    component_name: "Micro-Metering Backpressure Control Valve",
    component_type: "Pressure Regulating Valve",
    material: "Monel 400 (UNS N04400)",
    dimensions: "1/4 inch NPT female, rated 400 bar",
    quantity: 2,
    unit: "pcs",
    part_number_or_supplier: "MONEL-NV-400B",
    custom_specs: { stem_hardened: "Stellite 6", cv: 0.02 }
  },
  {
    id: "e0000000-0000-0000-0000-000000000020",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000005",
    component_name: "High-Pressure O-Ring Static Seals",
    component_type: "Vessel Closure Seal",
    material: "Kalrez 6375 Perfluoroelastomer (FFKM)",
    dimensions: "AS568-220 high durometer 90 Shore A",
    quantity: 6,
    unit: "pcs",
    part_number_or_supplier: "KALREZ-OR-220-90A",
    custom_specs: { explosive_decompression_resistance: "Norsok M-710 certified" }
  },
  {
    id: "e0000000-0000-0000-0000-000000000021",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000005",
    component_name: "Reverse-Buckling Rupture Disk Assembly",
    component_type: "Safety Relief Mechanism",
    material: "Nickel 200 (UNS N02200)",
    dimensions: "Nominal size 1/2 inch, burst 350 bar @ 100°C",
    quantity: 2,
    unit: "pcs",
    part_number_or_supplier: "NI200-RD-350BAR",
    custom_specs: { burst_tolerance_pct: 3.0, manufacturing_range: 0 }
  }
];

export const INITIAL_EXPERIMENTS: Experiment[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    project_id: "a0000000-0000-0000-0000-000000000001",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000001",
    experiment_code: "EXP-8902",
    conducted_at: "2026-09-10T14:22:00.000Z",
    procedure_steps: "1. Reactor purged with N2 at 5 bar for 45 mins.\n2. Heated to 220°C at 2.0°C/min ramp rate under N2.\n3. Switched feed to syngas (H2/CO = 2.05:1) at 25 bar.\n4. Increased space velocity to 4200 h^-1.",
    observed_deviations: "Observed severe thermal runaway above 248°C. Catalyst bed radial Delta-T surged to +22.8°C (limit <= 8.0°C). Single-pass syngas conversion collapsed from 78.5% down to 61.4% with rapid methane runaway (CH4 selectivity > 34%). Differential pressure drop across catalyst bed spiked to 3.2 bar (target <= 1.5 bar).",
    primary_outcome: "FAILED",
    engineer_notes: "Autopsy Conclusion: Catalyst bed experienced laminar cooling starvation. Undiluted 20% Co/Al2O3 extruded pellets created severe localized exotherm at bed inlet (45-60 mm elevation). Scanning electron microscopy post-mortem confirmed cobalt crystallite sintering from 11 nm to 34 nm and graphitic coke shell encapsulation.",
    failure_symptoms: "Hotspot localized at bed inlet 45-60mm. Catalyst discharge showed heavy soot, coke deposition, and thermal agglomeration/sintering of cobalt active sites. Coolant exit temperature rose 14.5°C over supply.",
    is_locked: true,
    created_at: "2026-09-10T16:00:00.000Z"
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    project_id: "a0000000-0000-0000-0000-000000000001",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000002",
    experiment_code: "EXP-8915",
    conducted_at: "2026-09-24T10:15:00.000Z",
    procedure_steps: "1. Reactor purged and preheated to 220°C.\n2. Syngas fed at 25 bar with 160 L/h synthetic coolant circulation.\n3. 25% SiC dilution bed evaluated at GHSV 4500 h^-1.",
    observed_deviations: "Bed radial Delta-T reduced from 22.8°C to 11.4°C with 25% SiC dilution. Syngas conversion stabilized at 81.2% (target 85.0%). Differential pressure remained high at 2.1 bar due to non-uniform pellet packing density.",
    primary_outcome: "NEEDS_IMPROVEMENT",
    engineer_notes: "SiC thermal dilution successfully dampened runaway tendency, but 25% dilution is insufficient to meet the strict <= 8.0°C Delta-T criterion. Increased dilution to 50% required along with Hastelloy sleeve for enhanced radial thermal conduction.",
    failure_symptoms: "Minor hotspot remaining at 70mm zone. Conversion still 3.8% below target specification.",
    is_locked: true,
    created_at: "2026-09-24T12:30:00.000Z"
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    project_id: "a0000000-0000-0000-0000-000000000001",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000003",
    experiment_code: "EXP-8940",
    conducted_at: "2026-10-09T08:30:00.000Z",
    procedure_steps: "1. N2 purge at 5 bar for 30 minutes.\n2. Ramp to 225°C under synthetic coolant flow of 220 L/h.\n3. Syngas feed introduced at 25 bar, GHSV 4800 h^-1.\n4. Continuous 48-hour steady-state logging.",
    observed_deviations: "Zero thermal excursion detected. Steady-state catalytic conversion achieved 87.4% across 48 continuous hours. Radial bed Delta-T remained tightly regulated at 5.4°C (target <= 8.0°C). Differential pressure drop held stable at 1.15 bar (target <= 1.5 bar). Methane selectivity restrained below 8.2 mol%.",
    primary_outcome: "SUCCESSFUL",
    engineer_notes: "50/50 SiC dilution in Hastelloy C-276 sleeve combined with 220 L/h turbulent cooling achieved near-perfect isothermal plug-flow behavior. All critical acceptance criteria met with expanded uncertainty margin.",
    failure_symptoms: null,
    is_locked: true,
    created_at: "2026-10-11T10:00:00.000Z"
  },
  {
    id: "10000000-0000-0000-0000-000000000004",
    project_id: "a0000000-0000-0000-0000-000000000001",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000003",
    experiment_code: "EXP-8941",
    conducted_at: "2026-10-12T09:00:00.000Z",
    procedure_steps: "1. Identical repeat protocol to EXP-8940.\n2. Independent syngas feed batch and fresh catalyst charge.\n3. 48-hour verification run for ISO 17025 certification.",
    observed_deviations: "Replicate run confirmed high repeatability: Syngas conversion 86.9% ± 0.38%, peak radial Delta-T 5.7°C ± 0.20°C, differential pressure drop 1.18 bar ± 0.05 bar.",
    primary_outcome: "SUCCESSFUL",
    engineer_notes: "Verified statistical reproducibility across multi-day campaigns. Sigma on conversion across runs is 0.42%. Fully certified for pilot production.",
    failure_symptoms: null,
    is_locked: true,
    created_at: "2026-10-14T11:30:00.000Z"
  },
  {
    id: "10000000-0000-0000-0000-000000000005",
    project_id: "a0000000-0000-0000-0000-000000000002",
    apparatus_version_id: "d0000000-0000-0000-0000-000000000005",
    experiment_code: "EXP-7720",
    conducted_at: "2026-09-28T08:00:00.000Z",
    procedure_steps: "1. Pressurized column to 280 bar with dense CO2.\n2. Heated to 50°C.\n3. Commenced countercurrent feed at 1.0 kg/h with CO2 solvent at 18.5 kg/h.\n4. Monitored backpressure valve stability via Monel 400 micro-metering.",
    observed_deviations: "Supercritical CO2 extraction achieved 94.6% active yield at 280 bar. Monel 400 micro-metering valves maintained column backpressure within ±0.18 bar. Zero seal leakage or Kalrez extrusion observed.",
    primary_outcome: "SUCCESSFUL",
    engineer_notes: "Process verified across 5 consecutive replicate batches. Average recovery 94.6% exceeds 92.0% target.",
    failure_symptoms: null,
    is_locked: true,
    created_at: "2026-09-29T16:00:00.000Z"
  }
];

export const INITIAL_MEASUREMENTS: Measurement[] = [
  // EXP-8902 (FAILED)
  {
    id: "20000000-0000-0000-0000-000000000001",
    experiment_id: "10000000-0000-0000-0000-000000000001",
    parameter_name: "Syngas Conversion Yield",
    measured_value: 61.4,
    uncertainty_margin: 1.2,
    unit: "%",
    base_si_value: 0.614,
    run_index: 1
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    experiment_id: "10000000-0000-0000-0000-000000000001",
    parameter_name: "Catalyst Bed Delta-T",
    measured_value: 22.8,
    uncertainty_margin: 0.6,
    unit: "degC",
    base_si_value: 22.8,
    run_index: 1
  },
  {
    id: "20000000-0000-0000-0000-000000000003",
    experiment_id: "10000000-0000-0000-0000-000000000001",
    parameter_name: "Differential Pressure Drop",
    measured_value: 3.2,
    uncertainty_margin: 0.15,
    unit: "bar",
    base_si_value: 320000,
    run_index: 1
  },
  {
    id: "20000000-0000-0000-0000-000000000004",
    experiment_id: "10000000-0000-0000-0000-000000000001",
    parameter_name: "Effluent Space Velocity",
    measured_value: 3850,
    uncertainty_margin: 80,
    unit: "h^-1",
    base_si_value: 1.0694,
    run_index: 1
  },

  // EXP-8915 (NEEDS_IMPROVEMENT)
  {
    id: "20000000-0000-0000-0000-000000000005",
    experiment_id: "10000000-0000-0000-0000-000000000002",
    parameter_name: "Syngas Conversion Yield",
    measured_value: 81.2,
    uncertainty_margin: 0.9,
    unit: "%",
    base_si_value: 0.812,
    run_index: 1
  },
  {
    id: "20000000-0000-0000-0000-000000000006",
    experiment_id: "10000000-0000-0000-0000-000000000002",
    parameter_name: "Catalyst Bed Delta-T",
    measured_value: 11.4,
    uncertainty_margin: 0.4,
    unit: "degC",
    base_si_value: 11.4,
    run_index: 1
  },
  {
    id: "20000000-0000-0000-0000-000000000007",
    experiment_id: "10000000-0000-0000-0000-000000000002",
    parameter_name: "Differential Pressure Drop",
    measured_value: 2.1,
    uncertainty_margin: 0.1,
    unit: "bar",
    base_si_value: 210000,
    run_index: 1
  },
  {
    id: "20000000-0000-0000-0000-000000000008",
    experiment_id: "10000000-0000-0000-0000-000000000002",
    parameter_name: "Effluent Space Velocity",
    measured_value: 4400,
    uncertainty_margin: 60,
    unit: "h^-1",
    base_si_value: 1.2222,
    run_index: 1
  },

  // EXP-8940 (SUCCESSFUL)
  {
    id: "20000000-0000-0000-0000-000000000009",
    experiment_id: "10000000-0000-0000-0000-000000000003",
    parameter_name: "Syngas Conversion Yield",
    measured_value: 87.4,
    uncertainty_margin: 0.35,
    unit: "%",
    base_si_value: 0.874,
    run_index: 1
  },
  {
    id: "20000000-0000-0000-0000-000000000010",
    experiment_id: "10000000-0000-0000-0000-000000000003",
    parameter_name: "Catalyst Bed Delta-T",
    measured_value: 5.4,
    uncertainty_margin: 0.25,
    unit: "degC",
    base_si_value: 5.4,
    run_index: 1
  },
  {
    id: "20000000-0000-0000-0000-000000000011",
    experiment_id: "10000000-0000-0000-0000-000000000003",
    parameter_name: "Differential Pressure Drop",
    measured_value: 1.15,
    uncertainty_margin: 0.05,
    unit: "bar",
    base_si_value: 115000,
    run_index: 1
  },
  {
    id: "20000000-0000-0000-0000-000000000012",
    experiment_id: "10000000-0000-0000-0000-000000000003",
    parameter_name: "Effluent Space Velocity",
    measured_value: 4820,
    uncertainty_margin: 45,
    unit: "h^-1",
    base_si_value: 1.3389,
    run_index: 1
  },

  // EXP-8941 (SUCCESSFUL Replicate)
  {
    id: "20000000-0000-0000-0000-000000000013",
    experiment_id: "10000000-0000-0000-0000-000000000004",
    parameter_name: "Syngas Conversion Yield",
    measured_value: 86.9,
    uncertainty_margin: 0.38,
    unit: "%",
    base_si_value: 0.869,
    run_index: 1
  },
  {
    id: "20000000-0000-0000-0000-000000000014",
    experiment_id: "10000000-0000-0000-0000-000000000004",
    parameter_name: "Catalyst Bed Delta-T",
    measured_value: 5.7,
    uncertainty_margin: 0.20,
    unit: "degC",
    base_si_value: 5.7,
    run_index: 1
  },
  {
    id: "20000000-0000-0000-0000-000000000015",
    experiment_id: "10000000-0000-0000-0000-000000000004",
    parameter_name: "Differential Pressure Drop",
    measured_value: 1.18,
    uncertainty_margin: 0.05,
    unit: "bar",
    base_si_value: 118000,
    run_index: 1
  },
  {
    id: "20000000-0000-0000-0000-000000000016",
    experiment_id: "10000000-0000-0000-0000-000000000004",
    parameter_name: "Effluent Space Velocity",
    measured_value: 4790,
    uncertainty_margin: 40,
    unit: "h^-1",
    base_si_value: 1.3306,
    run_index: 1
  },

  // EXP-7720 (Supercritical Extraction)
  {
    id: "20000000-0000-0000-0000-000000000017",
    experiment_id: "10000000-0000-0000-0000-000000000005",
    parameter_name: "Extraction Recovery",
    measured_value: 94.6,
    uncertainty_margin: 0.30,
    unit: "%",
    base_si_value: 0.946,
    run_index: 1
  },
  {
    id: "20000000-0000-0000-0000-000000000018",
    experiment_id: "10000000-0000-0000-0000-000000000005",
    parameter_name: "Operating Pressure",
    measured_value: 280.2,
    uncertainty_margin: 0.18,
    unit: "bar",
    base_si_value: 28020000,
    run_index: 1
  },
  {
    id: "20000000-0000-0000-0000-000000000019",
    experiment_id: "10000000-0000-0000-0000-000000000005",
    parameter_name: "Solvent Ratio",
    measured_value: 18.5,
    uncertainty_margin: 0.20,
    unit: "kg/kg",
    base_si_value: 18.5,
    run_index: 1
  }
];
