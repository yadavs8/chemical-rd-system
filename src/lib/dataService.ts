import { 
  Project, 
  Apparatus, 
  ApparatusVersion, 
  BomItem, 
  Experiment, 
  Measurement, 
  OutcomeClassification 
} from "@/types";
import { supabase, isSupabaseConfigured } from "./supabase";
import { 
  INITIAL_PROJECTS, 
  INITIAL_APPARATUS, 
  INITIAL_VERSIONS, 
  INITIAL_BOM_ITEMS, 
  INITIAL_EXPERIMENTS, 
  INITIAL_MEASUREMENTS 
} from "./initialData";

const STORAGE_KEYS = {
  PROJECTS: "chem_rd_projects_v1",
  APPARATUS: "chem_rd_apparatus_v1",
  VERSIONS: "chem_rd_versions_v1",
  BOM_ITEMS: "chem_rd_bom_items_v1",
  EXPERIMENTS: "chem_rd_experiments_v1",
  MEASUREMENTS: "chem_rd_measurements_v1"
};

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class LocalStorageProvider {
  private inMemoryCache: Record<string, any> = {};

  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  getItem<T>(key: string, defaultValue: T): T {
    if (this.isBrowser()) {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          return JSON.parse(item) as T;
        }
      } catch (e) {
        console.warn(`Error reading ${key} from localStorage:`, e);
      }
    }
    if (this.inMemoryCache[key] !== undefined) {
      return this.inMemoryCache[key] as T;
    }
    // Initialize with default
    this.setItem(key, defaultValue);
    return defaultValue;
  }

  setItem<T>(key: string, value: T): void {
    this.inMemoryCache[key] = value;
    if (this.isBrowser()) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn(`Error writing ${key} to localStorage:`, e);
      }
    }
  }

  clearAll(): void {
    this.inMemoryCache = {};
    if (this.isBrowser()) {
      try {
        Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
      } catch (e) {
        console.warn("Error clearing localStorage:", e);
      }
    }
  }
}

const localStore = new LocalStorageProvider();

export class DataService {
  private activeMode: "remote" | "local" = "local";

  constructor() {
    this.activeMode = isSupabaseConfigured() ? "remote" : "local";
  }

  getStorageMode(): "remote" | "local" {
    return this.activeMode;
  }

  isRemoteActive(): boolean {
    return this.activeMode === "remote";
  }

  // --- PROJECTS ---
  async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          this.activeMode = "remote";
          localStore.setItem(STORAGE_KEYS.PROJECTS, data);
          return data;
        }
        console.warn("Supabase returned empty or error for projects, falling back to local store.", error);
      } catch (err) {
        console.warn("Remote Supabase unreachable for projects, using resilient local store.", err);
      }
    }
    this.activeMode = "local";
    return localStore.getItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  }

  // --- APPARATUS ---
  async getApparatusList(): Promise<Apparatus[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("apparatus")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          this.activeMode = "remote";
          localStore.setItem(STORAGE_KEYS.APPARATUS, data);
          return data;
        }
        console.warn("Supabase returned empty or error for apparatus, falling back to local store.", error);
      } catch (err) {
        console.warn("Remote Supabase unreachable for apparatus, using resilient local store.", err);
      }
    }
    this.activeMode = "local";
    return localStore.getItem<Apparatus[]>(STORAGE_KEYS.APPARATUS, INITIAL_APPARATUS);
  }

  // --- APPARATUS VERSIONS ---
  async getVersions(apparatusId?: string): Promise<ApparatusVersion[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from("apparatus_versions")
          .select("*")
          .order("version_number", { ascending: true });

        if (apparatusId) {
          query = query.eq("apparatus_id", apparatusId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          this.activeMode = "remote";
          // Update local cache
          const existing = localStore.getItem<ApparatusVersion[]>(STORAGE_KEYS.VERSIONS, INITIAL_VERSIONS);
          const merged = [...existing.filter(e => !data.some(d => d.id === e.id)), ...data];
          localStore.setItem(STORAGE_KEYS.VERSIONS, merged);
          return data;
        }
        console.warn("Supabase returned empty or error for versions, falling back to local store.", error);
      } catch (err) {
        console.warn("Remote Supabase unreachable for versions, using resilient local store.", err);
      }
    }
    this.activeMode = "local";
    const allVersions = localStore.getItem<ApparatusVersion[]>(STORAGE_KEYS.VERSIONS, INITIAL_VERSIONS);
    return apparatusId ? allVersions.filter((v) => v.apparatus_id === apparatusId) : allVersions;
  }

  // --- BILL OF MATERIALS ---
  async getBomItems(versionId?: string): Promise<BomItem[]> {
    if (isSupabaseConfigured() && versionId) {
      try {
        const { data, error } = await supabase
          .from("bom_items")
          .select("*")
          .eq("apparatus_version_id", versionId);

        if (!error && data) {
          this.activeMode = "remote";
          // Sync items for this version into local store
          const currentAll = localStore.getItem<BomItem[]>(STORAGE_KEYS.BOM_ITEMS, INITIAL_BOM_ITEMS);
          const filteredOut = currentAll.filter((b) => b.apparatus_version_id !== versionId);
          localStore.setItem(STORAGE_KEYS.BOM_ITEMS, [...filteredOut, ...data]);
          return data;
        }
        console.warn("Supabase returned empty or error for bom_items, falling back to local store.", error);
      } catch (err) {
        console.warn("Remote Supabase unreachable for bom_items, using resilient local store.", err);
      }
    }
    this.activeMode = "local";
    const allBoms = localStore.getItem<BomItem[]>(STORAGE_KEYS.BOM_ITEMS, INITIAL_BOM_ITEMS);
    return versionId ? allBoms.filter((b) => b.apparatus_version_id === versionId) : allBoms;
  }

  async saveBomItems(versionId: string, items: Array<Partial<BomItem>>): Promise<BomItem[]> {
    // 1. Prepare sanitized items with IDs
    const preparedItems: BomItem[] = items.map((item) => ({
      id: item.id || generateUUID(),
      apparatus_version_id: versionId,
      component_name: item.component_name || "New Component",
      component_type: item.component_type || "Mechanical Component",
      material: item.material || "Stainless Steel 316L",
      dimensions: item.dimensions || null,
      quantity: Number(item.quantity) || 1,
      unit: item.unit || "pcs",
      part_number_or_supplier: item.part_number_or_supplier || null,
      custom_specs: item.custom_specs || {}
    }));

    // 2. Always persist to localStore for instant offline resilience
    const currentAll = localStore.getItem<BomItem[]>(STORAGE_KEYS.BOM_ITEMS, INITIAL_BOM_ITEMS);
    const remaining = currentAll.filter((b) => b.apparatus_version_id !== versionId);
    localStore.setItem(STORAGE_KEYS.BOM_ITEMS, [...remaining, ...preparedItems]);

    // 3. Sync to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("bom_items").delete().eq("apparatus_version_id", versionId);
        if (preparedItems.length > 0) {
          const { error } = await supabase.from("bom_items").insert(
            preparedItems.map((b) => ({
              id: b.id,
              apparatus_version_id: b.apparatus_version_id,
              component_name: b.component_name,
              component_type: b.component_type,
              material: b.material,
              dimensions: b.dimensions,
              quantity: b.quantity,
              unit: b.unit,
              part_number_or_supplier: b.part_number_or_supplier,
              custom_specs: b.custom_specs
            }))
          );
          if (error) {
            console.warn("Supabase error during saveBomItems:", error);
          }
        }
      } catch (err) {
        console.warn("Remote Supabase unreachable during saveBomItems, saved to local store:", err);
      }
    }

    return preparedItems;
  }

  // --- VERSION BRANCHING ---
  async branchVersion(parentVersion: ApparatusVersion, currentApparatus: Apparatus): Promise<ApparatusVersion> {
    const nextVersionNum = parentVersion.version_number + 1;
    const nextVersionTag = `V${nextVersionNum}.0`;

    const newVersion: ApparatusVersion = {
      id: generateUUID(),
      apparatus_id: currentApparatus.id,
      parent_version_id: parentVersion.id,
      version_number: nextVersionNum,
      version_tag: nextVersionTag,
      status: "DRAFT",
      operating_parameters: {
        ...parentVersion.operating_parameters,
        feed_rate_ml_min: Number(((Number(parentVersion.operating_parameters?.feed_rate_ml_min) || 5.0) * 1.15).toFixed(1)),
        coolant_flow_l_h: (Number(parentVersion.operating_parameters?.coolant_flow_l_h) || 120) + 40
      },
      design_rationale: `Iterated modification branched directly from ${parentVersion.version_tag}. Enhanced thermal contact and residency control.`,
      safety_constraints: parentVersion.safety_constraints,
      is_immutable: false,
      created_at: new Date().toISOString(),
      created_by: null,
      branch_label: "main",
      version_seq: nextVersionNum
    };

    // 1. Save new version to localStore
    const allVersions = localStore.getItem<ApparatusVersion[]>(STORAGE_KEYS.VERSIONS, INITIAL_VERSIONS);
    localStore.setItem(STORAGE_KEYS.VERSIONS, [...allVersions, newVersion]);

    // 2. Clone BOM items from parent version
    const allBoms = localStore.getItem<BomItem[]>(STORAGE_KEYS.BOM_ITEMS, INITIAL_BOM_ITEMS);
    const parentBoms = allBoms.filter((b) => b.apparatus_version_id === parentVersion.id);
    const clonedBoms: BomItem[] = parentBoms.map((b) => ({
      ...b,
      id: generateUUID(),
      apparatus_version_id: newVersion.id
    }));
    localStore.setItem(STORAGE_KEYS.BOM_ITEMS, [...allBoms, ...clonedBoms]);

    // 3. Attempt sync to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { data: remoteVer, error: vErr } = await supabase
          .from("apparatus_versions")
          .insert({
            id: newVersion.id,
            apparatus_id: newVersion.apparatus_id,
            parent_version_id: newVersion.parent_version_id,
            version_number: newVersion.version_number,
            version_tag: newVersion.version_tag,
            status: newVersion.status,
            operating_parameters: newVersion.operating_parameters,
            design_rationale: newVersion.design_rationale,
            safety_constraints: newVersion.safety_constraints,
            is_immutable: false
          })
          .select()
          .single();

        if (!vErr && remoteVer && clonedBoms.length > 0) {
          await supabase.from("bom_items").insert(clonedBoms);
        }
      } catch (err) {
        console.warn("Remote Supabase unreachable during branchVersion, branched in local store:", err);
      }
    }

    return newVersion;
  }

  // --- MARK SUCCESSFUL / FREEZE IMMUTABLE ---
  async markVersionSuccessful(versionId: string): Promise<ApparatusVersion | null> {
    const allVersions = localStore.getItem<ApparatusVersion[]>(STORAGE_KEYS.VERSIONS, INITIAL_VERSIONS);
    const index = allVersions.findIndex((v) => v.id === versionId);
    if (index === -1) return null;

    const updated: ApparatusVersion = {
      ...allVersions[index],
      status: "SUCCESSFUL",
      is_immutable: true
    };
    allVersions[index] = updated;
    localStore.setItem(STORAGE_KEYS.VERSIONS, allVersions);

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from("apparatus_versions")
          .update({
            status: "SUCCESSFUL",
            is_immutable: true
          })
          .eq("id", versionId);
      } catch (err) {
        console.warn("Remote Supabase unreachable during markVersionSuccessful, updated in local store:", err);
      }
    }

    return updated;
  }

  // --- EXPERIMENTS & MEASUREMENTS ---
  async getExperiments(apparatusVersionId?: string): Promise<Experiment[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from("experiments")
          .select("*")
          .order("conducted_at", { ascending: false });

        if (apparatusVersionId) {
          query = query.eq("apparatus_version_id", apparatusVersionId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          this.activeMode = "remote";
          const current = localStore.getItem<Experiment[]>(STORAGE_KEYS.EXPERIMENTS, INITIAL_EXPERIMENTS);
          const merged = [...current.filter((c) => !data.some((d) => d.id === c.id)), ...data];
          localStore.setItem(STORAGE_KEYS.EXPERIMENTS, merged);
          return data;
        }
      } catch (err) {
        console.warn("Remote Supabase unreachable for experiments, using local store:", err);
      }
    }
    this.activeMode = "local";
    const allExps = localStore.getItem<Experiment[]>(STORAGE_KEYS.EXPERIMENTS, INITIAL_EXPERIMENTS);
    return apparatusVersionId ? allExps.filter((e) => e.apparatus_version_id === apparatusVersionId) : allExps;
  }

  async saveExperiment(expData: {
    project_id?: string;
    apparatus_version_id: string;
    experiment_code: string;
    procedure_steps: string;
    observed_deviations?: string | null;
    primary_outcome: OutcomeClassification;
    engineer_notes?: string | null;
    failure_symptoms?: string | null;
    measurements?: Array<{
      parameter_name: string;
      measured_value: number;
      uncertainty_margin?: number;
      unit: string;
      run_index?: number;
    }>;
  }): Promise<Experiment> {
    const newExp: Experiment = {
      id: generateUUID(),
      project_id: expData.project_id || "a0000000-0000-0000-0000-000000000001",
      apparatus_version_id: expData.apparatus_version_id,
      experiment_code: expData.experiment_code,
      conducted_at: new Date().toISOString(),
      procedure_steps: expData.procedure_steps,
      observed_deviations: expData.observed_deviations || null,
      primary_outcome: expData.primary_outcome,
      engineer_notes: expData.engineer_notes || null,
      failure_symptoms: expData.failure_symptoms || null,
      is_locked: false,
      created_at: new Date().toISOString()
    };

    // 1. Save experiment to local store
    const allExps = localStore.getItem<Experiment[]>(STORAGE_KEYS.EXPERIMENTS, INITIAL_EXPERIMENTS);
    localStore.setItem(STORAGE_KEYS.EXPERIMENTS, [newExp, ...allExps]);

    // 2. Save measurements to local store
    let preparedMeasurements: Measurement[] = [];
    if (expData.measurements && expData.measurements.length > 0) {
      preparedMeasurements = expData.measurements.map((m) => ({
        id: generateUUID(),
        experiment_id: newExp.id,
        parameter_name: m.parameter_name,
        measured_value: Number(m.measured_value),
        uncertainty_margin: Number(m.uncertainty_margin || 0),
        unit: m.unit,
        run_index: m.run_index || 1,
        is_outlier: false
      }));

      const allMeasurements = localStore.getItem<Measurement[]>(STORAGE_KEYS.MEASUREMENTS, INITIAL_MEASUREMENTS);
      localStore.setItem(STORAGE_KEYS.MEASUREMENTS, [...allMeasurements, ...preparedMeasurements]);
    }

    // 3. Attempt sync to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { error: expErr } = await supabase.from("experiments").insert({
          id: newExp.id,
          project_id: newExp.project_id,
          apparatus_version_id: newExp.apparatus_version_id,
          experiment_code: newExp.experiment_code,
          procedure_steps: newExp.procedure_steps,
          observed_deviations: newExp.observed_deviations,
          primary_outcome: newExp.primary_outcome,
          engineer_notes: newExp.engineer_notes,
          failure_symptoms: newExp.failure_symptoms,
          is_locked: false
        });

        if (!expErr && preparedMeasurements.length > 0) {
          await supabase.from("measurements").insert(preparedMeasurements);
        }
      } catch (err) {
        console.warn("Remote Supabase unreachable during saveExperiment, saved to local store:", err);
      }
    }

    return newExp;
  }

  // --- RESET / PURGE TO DEFAULTS ---
  async resetToDefaultData(): Promise<void> {
    localStore.clearAll();
    localStore.setItem(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    localStore.setItem(STORAGE_KEYS.APPARATUS, INITIAL_APPARATUS);
    localStore.setItem(STORAGE_KEYS.VERSIONS, INITIAL_VERSIONS);
    localStore.setItem(STORAGE_KEYS.BOM_ITEMS, INITIAL_BOM_ITEMS);
    localStore.setItem(STORAGE_KEYS.EXPERIMENTS, INITIAL_EXPERIMENTS);
    localStore.setItem(STORAGE_KEYS.MEASUREMENTS, INITIAL_MEASUREMENTS);
  }
}

export const dataService = new DataService();
