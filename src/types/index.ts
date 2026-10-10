export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'ARCHIVED';
export type VersionStatus = 'DRAFT' | 'READY_FOR_TESTING' | 'TESTING_IN_PROGRESS' | 'SUCCESSFUL' | 'NEEDS_IMPROVEMENT' | 'FAILED' | 'ARCHIVED';
export type OutcomeClassification = 'FAILED' | 'NEEDS_IMPROVEMENT' | 'SUCCESSFUL' | 'INCONCLUSIVE';

export interface Project {
  id: string;
  project_code: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
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
