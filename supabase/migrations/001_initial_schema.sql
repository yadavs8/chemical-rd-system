-- ==============================================================================
-- MIGRATION: 001_initial_schema.sql
-- DESCRIPTION: Initial schema for Chemical R&D Experiment and Apparatus System
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- pgvector for semantic search

-- 2. Enumerated Types
CREATE TYPE project_status AS ENUM ('ACTIVE', 'COMPLETED', 'ON_HOLD', 'ARCHIVED');
CREATE TYPE version_status AS ENUM ('DRAFT', 'READY_FOR_TESTING', 'TESTING_IN_PROGRESS', 'SUCCESSFUL', 'NEEDS_IMPROVEMENT', 'FAILED', 'ARCHIVED');
CREATE TYPE outcome_classification AS ENUM ('FAILED', 'NEEDS_IMPROVEMENT', 'SUCCESSFUL', 'INCONCLUSIVE');
CREATE TYPE hypothesis_status AS ENUM ('PROPOSED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED');
CREATE TYPE audit_action_type AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'BRANCH', 'FREEZE_IMMUTABLE', 'CLASSIFY');

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_code VARCHAR(32) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Research Objectives Table
CREATE TABLE IF NOT EXISTS research_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    objective_code VARCHAR(32) NOT NULL,
    problem_statement TEXT NOT NULL,
    target_specification TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(project_id, objective_code)
);

-- 5. Acceptance Criteria Table
CREATE TABLE IF NOT EXISTS acceptance_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id UUID NOT NULL REFERENCES research_objectives(id) ON DELETE CASCADE,
    metric_name VARCHAR(128) NOT NULL,
    operator VARCHAR(8) NOT NULL, -- e.g., '>=', '<=', '==', 'RANGE'
    target_value NUMERIC(14,6) NOT NULL,
    target_max_value NUMERIC(14,6), -- for range operators
    unit VARCHAR(32) NOT NULL,
    is_critical BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Apparatus Parent Entity
CREATE TABLE IF NOT EXISTS apparatus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    apparatus_code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    apparatus_type VARCHAR(128) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Apparatus Configuration Versions (Temporal & Immutability Core)
CREATE TABLE IF NOT EXISTS apparatus_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apparatus_id UUID NOT NULL REFERENCES apparatus(id) ON DELETE CASCADE,
    parent_version_id UUID REFERENCES apparatus_versions(id) ON DELETE SET NULL,
    version_number INT NOT NULL,
    version_tag VARCHAR(32) NOT NULL, -- e.g., 'V1.0', 'V2.1-branch'
    status version_status DEFAULT 'DRAFT' NOT NULL,
    operating_parameters JSONB DEFAULT '{}'::jsonb NOT NULL,
    design_rationale TEXT,
    safety_constraints TEXT,
    is_immutable BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID, -- Supabase auth.users reference
    UNIQUE(apparatus_id, version_number)
);

-- 8. Bill of Materials (BOM) Items per Version
CREATE TABLE IF NOT EXISTS bom_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apparatus_version_id UUID NOT NULL REFERENCES apparatus_versions(id) ON DELETE CASCADE,
    component_name VARCHAR(255) NOT NULL,
    component_type VARCHAR(128) NOT NULL,
    material VARCHAR(128) NOT NULL,
    dimensions VARCHAR(128),
    quantity NUMERIC(10,3) DEFAULT 1.0 NOT NULL,
    unit VARCHAR(32) DEFAULT 'pcs' NOT NULL,
    part_number_or_supplier VARCHAR(255),
    custom_specs JSONB DEFAULT '{}'::jsonb NOT NULL
);

-- 9. Experiments Table
CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    apparatus_version_id UUID NOT NULL REFERENCES apparatus_versions(id) ON DELETE RESTRICT,
    experiment_code VARCHAR(32) NOT NULL UNIQUE,
    conducted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    procedure_steps TEXT NOT NULL,
    observed_deviations TEXT,
    primary_outcome outcome_classification DEFAULT 'INCONCLUSIVE' NOT NULL,
    engineer_notes TEXT,
    failure_symptoms TEXT,
    is_locked BOOLEAN DEFAULT FALSE NOT NULL,
    embedding vector(1536), -- Vector representation for semantic search over observations & failure symptoms
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    conducted_by UUID -- Supabase auth.users reference
);

-- 10. Scientific Measurements Table
CREATE TABLE IF NOT EXISTS measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    parameter_name VARCHAR(128) NOT NULL,
    measured_value NUMERIC(14,6),
    uncertainty_margin NUMERIC(10,6),
    unit VARCHAR(32) NOT NULL,
    base_si_value NUMERIC(18,8), -- normalized SI unit value for unified indexing/queries
    run_index INT DEFAULT 1 NOT NULL,
    sample_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_outlier BOOLEAN DEFAULT FALSE NOT NULL,
    omission_reason TEXT
);

-- 11. Experiment Attachments Table
CREATE TABLE IF NOT EXISTS experiment_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(128) NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. AI Analyses Table
CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    model_identifier VARCHAR(128) NOT NULL,
    outcome_summary TEXT NOT NULL,
    performance_gap_analysis TEXT NOT NULL,
    ranked_causes JSONB DEFAULT '[]'::jsonb NOT NULL,
    safety_verification TEXT NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    reviewed_by_engineer BOOLEAN DEFAULT FALSE NOT NULL
);

-- 13. Improvement Hypotheses Table
CREATE TABLE IF NOT EXISTS improvement_hypotheses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_analysis_id UUID NOT NULL REFERENCES ai_analyses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    rationale TEXT NOT NULL,
    expected_benefit TEXT NOT NULL,
    potential_risks TEXT NOT NULL,
    evidential_support_score INT CHECK (evidential_support_score BETWEEN 1 AND 5),
    approval_status hypothesis_status DEFAULT 'PROPOSED' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. Proposed Changes Table
CREATE TABLE IF NOT EXISTS proposed_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hypothesis_id UUID NOT NULL REFERENCES improvement_hypotheses(id) ON DELETE CASCADE,
    change_type VARCHAR(64) NOT NULL, -- e.g., 'PARAM_MOD', 'COMPONENT_REPLACE', 'DIMENSION_TOLERANCE'
    target_component VARCHAR(255) NOT NULL,
    before_spec JSONB NOT NULL,
    after_spec JSONB NOT NULL,
    promoted_to_version_id UUID REFERENCES apparatus_versions(id) ON DELETE SET NULL
);

-- 15. Reproducibility Records Table
CREATE TABLE IF NOT EXISTS reproducibility_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apparatus_version_id UUID NOT NULL REFERENCES apparatus_versions(id) ON DELETE CASCADE,
    validated_run_count INT DEFAULT 1 NOT NULL,
    standard_deviation NUMERIC(10,6),
    repeatability_verdict TEXT NOT NULL,
    certified_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    certified_by UUID
);

-- 16. Audit Events Table
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    entity_name VARCHAR(64) NOT NULL,
    entity_id UUID NOT NULL,
    action_type audit_action_type NOT NULL,
    delta JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- IMMUTABILITY ENFORCEMENT & TRIGGERS
-- ==============================================================================

CREATE OR REPLACE FUNCTION enforce_apparatus_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'SUCCESSFUL' AND OLD.is_immutable = TRUE THEN
        -- Prevent updating configuration parameters or relations on frozen successful versions
        IF (TG_OP = 'UPDATE' AND (
            OLD.operating_parameters != NEW.operating_parameters OR 
            OLD.apparatus_id != NEW.apparatus_id OR
            OLD.version_number != NEW.version_number
        )) THEN
            RAISE EXCEPTION 'Configuration % is immutable and cannot be altered. Branch into a new version.', OLD.version_tag;
        END IF;
        
        -- Prevent deleting immutable records
        IF (TG_OP = 'DELETE') THEN
            RAISE EXCEPTION 'Configuration % is frozen as an immutable historical record and cannot be deleted.', OLD.version_tag;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_successful_versions ON apparatus_versions;
CREATE TRIGGER trg_protect_successful_versions
BEFORE UPDATE OR DELETE ON apparatus_versions
FOR EACH ROW EXECUTE FUNCTION enforce_apparatus_immutability();

-- Prevent modification of BOM items if parent apparatus version is immutable
CREATE OR REPLACE FUNCTION enforce_bom_immutability()
RETURNS TRIGGER AS $$
DECLARE
    parent_is_immutable BOOLEAN;
BEGIN
    SELECT is_immutable INTO parent_is_immutable
    FROM apparatus_versions
    WHERE id = COALESCE(OLD.apparatus_version_id, NEW.apparatus_version_id);

    IF parent_is_immutable = TRUE THEN
        RAISE EXCEPTION 'Cannot modify or delete Bill of Materials items on an immutable apparatus configuration.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_bom_items ON bom_items;
CREATE TRIGGER trg_protect_bom_items
BEFORE INSERT OR UPDATE OR DELETE ON bom_items
FOR EACH ROW EXECUTE FUNCTION enforce_bom_immutability();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) ACTIVATION
-- ==============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE acceptance_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE apparatus ENABLE ROW LEVEL SECURITY;
ALTER TABLE apparatus_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_hypotheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposed_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproducibility_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Base RLS Policy: Authenticated users have read and write permissions in single-tenant/team workspace
CREATE POLICY "Allow authenticated read on projects" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert/update on projects" ON projects FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated access on apparatus" ON apparatus FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access on apparatus_versions" ON apparatus_versions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access on bom_items" ON bom_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access on experiments" ON experiments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access on measurements" ON measurements FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access on ai_analyses" ON ai_analyses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access on audit_events" ON audit_events FOR SELECT TO authenticated USING (true);

-- Indexes for performant search & retrieval
CREATE INDEX IF NOT EXISTS idx_experiments_apparatus_version ON experiments(apparatus_version_id);
CREATE INDEX IF NOT EXISTS idx_experiments_outcome ON experiments(primary_outcome);
CREATE INDEX IF NOT EXISTS idx_measurements_experiment ON measurements(experiment_id);
CREATE INDEX IF NOT EXISTS idx_bom_apparatus_version ON bom_items(apparatus_version_id);
CREATE INDEX IF NOT EXISTS idx_apparatus_versions_parent ON apparatus_versions(parent_version_id);
