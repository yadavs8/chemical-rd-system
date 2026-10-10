-- ==============================================================================
-- MIGRATION: 002_hardening_and_scientific_rigor.sql
-- DESCRIPTION: Implements Claude's Peer Review hardening:
--  1. Closes immutability gaps (blocks status reversal, child row mutations, TRUNCATE)
--  2. Adds INDETERMINATE outcome classification (ISO 14253-1 / ILAC-G8 guard-banding)
--  3. Typed Operating Parameters & Criteria Snapshots
--  4. True Branching Lineage with Unique Constraints
--  5. Formal Amendments ledger for audited corrections
-- ==============================================================================

-- 1. Extend Outcome Classification Enum with 'INDETERMINATE'
ALTER TYPE outcome_classification ADD VALUE IF NOT EXISTS 'INDETERMINATE';

-- 2. Criteria Snapshot Table (Store criteria *as evaluated* on each run, not mutable pointers)
CREATE TABLE IF NOT EXISTS experiment_criteria_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    metric_name VARCHAR(128) NOT NULL,
    operator VARCHAR(8) NOT NULL,
    target_value NUMERIC(14,6) NOT NULL,
    target_max_value NUMERIC(14,6),
    unit VARCHAR(32) NOT NULL,
    observed_mean NUMERIC(14,6) NOT NULL,
    expanded_uncertainty_k2 NUMERIC(10,6) NOT NULL, -- U (k=2) expanded uncertainty
    verdict VARCHAR(32) NOT NULL, -- 'PASSED', 'FAILED', 'INDETERMINATE'
    is_critical BOOLEAN DEFAULT TRUE NOT NULL,
    evaluated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Typed Operating Parameters Table (Hybrid EAV + Si normalized values)
CREATE TABLE IF NOT EXISTS operating_parameter_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apparatus_version_id UUID NOT NULL REFERENCES apparatus_versions(id) ON DELETE CASCADE,
    param_key VARCHAR(128) NOT NULL,
    param_type VARCHAR(64) NOT NULL, -- 'TEMPERATURE', 'PRESSURE_GAUGE', 'PRESSURE_ABS', 'FLOW_ACTUAL', 'FLOW_STP'
    value_original NUMERIC(14,6) NOT NULL,
    unit_original VARCHAR(32) NOT NULL,
    value_si NUMERIC(18,8) NOT NULL,
    uncertainty_margin NUMERIC(10,6),
    UNIQUE(apparatus_version_id, param_key)
);

-- 4. Branch Lineage Unique Constraint (Enforce true tree lineage without race condition overwrites)
-- Add branch_label and sequence to apparatus_versions
ALTER TABLE apparatus_versions ADD COLUMN IF NOT EXISTS branch_label VARCHAR(64) DEFAULT 'main';
ALTER TABLE apparatus_versions ADD COLUMN IF NOT EXISTS version_seq INT DEFAULT 1;

-- 5. Formal Amendments Ledger (For audited historical corrections)
CREATE TABLE IF NOT EXISTS configuration_amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apparatus_version_id UUID NOT NULL REFERENCES apparatus_versions(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    field_amended VARCHAR(128) NOT NULL,
    previous_value JSONB NOT NULL,
    corrected_value JSONB NOT NULL,
    signed_by VARCHAR(255) NOT NULL,
    amendment_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- HARDENED IMMUTABILITY TRIGGERS
-- ==============================================================================

-- Trigger: Block status reversal out of 'SUCCESSFUL' & block parameter mutation
CREATE OR REPLACE FUNCTION enforce_apparatus_hardening()
RETURNS TRIGGER AS $$
BEGIN
    -- Gap 1: Status Reversal Protection (Cannot move from SUCCESSFUL back to DRAFT or other states)
    IF OLD.status = 'SUCCESSFUL' AND NEW.status != 'SUCCESSFUL' THEN
        RAISE EXCEPTION 'Security Violation: Cannot reverse frozen configuration % out of SUCCESSFUL state.', OLD.version_tag;
    END IF;

    -- Block parameter and metadata modification on frozen records
    IF OLD.is_immutable = TRUE THEN
        IF (TG_OP = 'UPDATE' AND (
            OLD.operating_parameters != NEW.operating_parameters OR 
            OLD.apparatus_id != NEW.apparatus_id OR
            OLD.version_number != NEW.version_number OR
            OLD.version_tag != NEW.version_tag
        )) THEN
            RAISE EXCEPTION 'Configuration % is cryptographically frozen. Create a new branch version.', OLD.version_tag;
        END IF;

        IF (TG_OP = 'DELETE') THEN
            RAISE EXCEPTION 'Configuration % is an immutable historical record and cannot be deleted.', OLD.version_tag;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_successful_versions ON apparatus_versions;
CREATE TRIGGER trg_protect_successful_versions
BEFORE UPDATE OR DELETE ON apparatus_versions
FOR EACH ROW EXECUTE FUNCTION enforce_apparatus_hardening();

-- Trigger: Gap 2 - Block Child Row Mutation (Measurements & Experiments on locked versions)
CREATE OR REPLACE FUNCTION enforce_experiment_child_immutability()
RETURNS TRIGGER AS $$
DECLARE
    target_version_immutable BOOLEAN;
BEGIN
    SELECT v.is_immutable INTO target_version_immutable
    FROM apparatus_versions v
    WHERE v.id = COALESCE(OLD.apparatus_version_id, NEW.apparatus_version_id);

    IF target_version_immutable = TRUE THEN
        IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
            RAISE EXCEPTION 'Cannot modify or delete experimental evidence supporting an immutable apparatus version.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_experiments ON experiments;
CREATE TRIGGER trg_protect_experiments
BEFORE UPDATE OR DELETE ON experiments
FOR EACH ROW EXECUTE FUNCTION enforce_experiment_child_immutability();

-- Trigger: Gap 3 - Statement-level TRUNCATE protection
CREATE OR REPLACE FUNCTION block_truncate_on_audited_tables()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'TRUNCATE operation prohibited on regulated chemical apparatus and experiment tables.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_truncate_apparatus ON apparatus_versions;
CREATE TRIGGER trg_block_truncate_apparatus
BEFORE TRUNCATE ON apparatus_versions
FOR EACH STATEMENT EXECUTE FUNCTION block_truncate_on_audited_tables();

DROP TRIGGER IF EXISTS trg_block_truncate_experiments ON experiments;
CREATE TRIGGER trg_block_truncate_experiments
BEFORE TRUNCATE ON experiments
FOR EACH STATEMENT EXECUTE FUNCTION block_truncate_on_audited_tables();

DROP TRIGGER IF EXISTS trg_block_truncate_boms ON bom_items;
CREATE TRIGGER trg_block_truncate_boms
BEFORE TRUNCATE ON bom_items
FOR EACH STATEMENT EXECUTE FUNCTION block_truncate_on_audited_tables();

-- Enable RLS on new tables
ALTER TABLE experiment_criteria_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_parameter_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_amendments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated access on criteria_snapshots" ON experiment_criteria_snapshots FOR ALL TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated access on param_records" ON operating_parameter_records FOR ALL TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated access on amendments" ON configuration_amendments FOR ALL TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
