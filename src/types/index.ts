export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'ARCHIVED';
export type VersionStatus = 'DRAFT' | 'READY_FOR_TESTING' | 'TESTING_IN_PROGRESS' | 'SUCCESSFUL' | 'NEEDS_IMPROVEMENT' | 'FAILED' | 'ARCHIVED';
export type OutcomeClassification = 'FAILED' | 'NEEDS_IMPROVEMENT' | 'SUCCESSFUL' | 'INCONCLUSIVE' | 'INDETERMINATE';

export interface Project {
  id: string;
  project_code: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ResearchObjective {
  id: string;
  project_id: string;
  objective_code: string;
  problem_statement: string;
  target_specification: string;
  created_at: string;
}

export interface AcceptanceCriterion {
  id: string;
  objective_id: string;
  metric_name: string;
  operator: string;
  target_value: number;
  target_max_value?: number | null;
  unit: string;
  is_critical: boolean;
  created_at?: string;
}

export interface Apparatus {
  id: string;
  project_id: string;
  apparatus_code: string;
  name: string;
  apparatus_type: string;
  description: string | null;
  created_at: string;
}

export interface ApparatusVersion {
  id: string;
  apparatus_id: string;
  parent_version_id: string | null;
  version_number: number;
  version_tag: string;
  status: VersionStatus;
  operating_parameters: Record<string, any>;
  design_rationale: string | null;
  safety_constraints: string | null;
  is_immutable: boolean;
  created_at: string;
  created_by: string | null;
  branch_label?: string;
  version_seq?: number;
}

export interface BomItem {
  id: string;
  apparatus_version_id: string;
  component_name: string;
  component_type: string;
  material: string;
  dimensions: string | null;
  quantity: number;
  unit: string;
  part_number_or_supplier: string | null;
  custom_specs: Record<string, any>;
}

export interface Experiment {
  id: string;
  project_id: string;
  apparatus_version_id: string;
  experiment_code: string;
  conducted_at: string;
  procedure_steps: string;
  observed_deviations: string | null;
  primary_outcome: OutcomeClassification;
  engineer_notes: string | null;
  failure_symptoms: string | null;
  is_locked: boolean;
  created_at: string;
}

export interface Measurement {
  id: string;
  experiment_id: string;
  parameter_name: string;
  measured_value: number;
  uncertainty_margin: number;
  unit: string;
  base_si_value?: number;
  run_index: number;
  sample_timestamp?: string;
  is_outlier?: boolean;
}

export interface UnitValidationRequest {
  value: number;
  from_unit: string;
  target_unit?: string | null;
  is_differential?: boolean;
}

export interface UnitValidationResponse {
  is_valid: boolean;
  original_value: number;
  original_unit: string;
  base_si_value?: number | null;
  base_si_unit?: string | null;
  converted_value?: number | null;
  converted_unit?: string | null;
  dimensionality?: string | null;
  error_message?: string | null;
}

export interface UncertaintyRequest {
  observations: number[];
  target_value: number;
  operator?: string;
  instrument_tolerance?: number;
  target_max_value?: number | null;
}

export interface UncertaintyEvaluation {
  mean: number;
  sample_std: number;
  type_a_uncertainty: number;
  type_b_uncertainty: number;
  combined_uncertainty: number;
  expanded_uncertainty_k2: number;
  degrees_of_freedom: number;
  is_indeterminate: boolean;
  verdict: 'PASSED' | 'FAILED' | 'INDETERMINATE' | 'MISSING_DATA';
}

export interface ProposedChangeItem {
  change_type: string;
  target_component: string;
  before_spec: Record<string, any>;
  after_spec: Record<string, any>;
}

export interface ImprovementHypothesis {
  title: string;
  rationale: string;
  expected_benefit: string;
  potential_risks: string;
  evidential_support_score: number;
  proposed_changes: ProposedChangeItem[];
}

export interface DiagnosticAnalysisResponse {
  apparatus_name: string;
  version_tag: string;
  outcome_summary: string;
  performance_gap_analysis: string;
  ranked_causes: Array<{
    cause: string;
    evidence_level: number;
    rationale?: string;
  }>;
  safety_verification: string;
  hypotheses: ImprovementHypothesis[];
  missing_data_requests: string[];
}

export interface ExperimentDiagnosticRequest {
  apparatus_name: string;
  version_tag: string;
  problem_statement: string;
  target_specification: string;
  bom_components: any[];
  operating_parameters: Record<string, any>;
  measurements: any[];
  missed_criteria: any[];
  observed_deviations?: string | null;
  engineer_notes?: string | null;
  historical_failure_context?: any[] | null;
}


