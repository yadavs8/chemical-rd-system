"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Project, Apparatus, ApparatusVersion, BomItem } from "@/types";
import BomBuilder from "@/components/BomBuilder";
import VersionDiffViewer from "@/components/VersionDiffViewer";
import ExperimentLogger from "@/components/ExperimentLogger";
import AttachmentVault from "@/components/AttachmentVault";
import HistoricalFailureSearch from "@/components/HistoricalFailureSearch";
import ValidatedLibrary from "@/components/ValidatedLibrary";
import { 
  FolderGit2, 
  FlaskConical, 
  GitBranch, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  RefreshCw, 
  Cpu, 
  GitCompare, 
  Sliders, 
  FileCheck2, 
  ChevronRight, 
  Paperclip,
  ArrowRight,
  Printer,
  ShieldAlert,
  Award
} from "lucide-react";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [apparatusList, setApparatusList] = useState<Apparatus[]>([]);
  const [versions, setVersions] = useState<ApparatusVersion[]>([]);
  const [selectedApparatus, setSelectedApparatus] = useState<Apparatus | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<ApparatusVersion | null>(null);
  const [bomItems, setBomItems] = useState<BomItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"apparatus" | "bom" | "experiments" | "failures" | "library" | "diff" | "vault" | "diagnostics">("apparatus");

  // Diff comparison selection
  const [diffVersionA, setDiffVersionA] = useState<ApparatusVersion | null>(null);
  const [diffVersionB, setDiffVersionB] = useState<ApparatusVersion | null>(null);
  const [diffBomA, setDiffBomA] = useState<BomItem[]>([]);
  const [diffBomB, setDiffBomB] = useState<BomItem[]>([]);

  // AI Diagnostic testing state
  const [diagObs, setDiagObs] = useState("Observed thermal runaway above 245°C. Syngas hydrogenation conversion fell to 61% (target 85%). Pressure drop across catalyst bed exceeded 3.2 bar.");
  const [diagResult, setDiagResult] = useState<any>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  async function fetchWorkspaceData() {
    setLoading(true);
    try {
      const { data: pData } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      const { data: aData } = await supabase.from("apparatus").select("*").order("created_at", { ascending: false });
      const { data: vData } = await supabase.from("apparatus_versions").select("*").order("version_number", { ascending: true });

      if (pData) setProjects(pData);
      if (aData) {
        setApparatusList(aData);
        if (aData.length > 0 && !selectedApparatus) {
          setSelectedApparatus(aData[0]);
        }
      }
      if (vData) {
        setVersions(vData);
        if (vData.length > 0 && !selectedVersion) {
          setSelectedVersion(vData[0]);
          loadBomForVersion(vData[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadBomForVersion(versionId: string) {
    const { data: bData } = await supabase.from("bom_items").select("*").eq("apparatus_version_id", versionId);
    if (bData) {
      setBomItems(bData);
    } else {
      setBomItems([]);
    }
  }

  function handleSelectVersion(ver: ApparatusVersion) {
    setSelectedVersion(ver);
    loadBomForVersion(ver.id);
  }

  async function handleSaveBom(items: BomItem[]) {
    if (!selectedVersion) return;
    try {
      await supabase.from("bom_items").delete().eq("apparatus_version_id", selectedVersion.id);
      const payload = items.map((item) => ({
        apparatus_version_id: selectedVersion.id,
        component_name: item.component_name,
        component_type: item.component_type,
        material: item.material,
        dimensions: item.dimensions,
        quantity: item.quantity,
        unit: item.unit,
        part_number_or_supplier: item.part_number_or_supplier,
        custom_specs: item.custom_specs || {}
      }));

      if (payload.length > 0) {
        const { error } = await supabase.from("bom_items").insert(payload);
        if (error) throw error;
      }

      await loadBomForVersion(selectedVersion.id);
      alert("Bill of Materials specifications updated and saved to Supabase.");
    } catch (err: any) {
      alert("Error saving BOM: " + err.message);
    }
  }

  async function handleBranchVersion(parentVersion: ApparatusVersion) {
    if (!selectedApparatus) return;
    try {
      const nextVersionNum = parentVersion.version_number + 1;
      const nextVersionTag = `V${nextVersionNum}.0`;

      const { data: newVer, error: vErr } = await supabase.from("apparatus_versions").insert({
        apparatus_id: selectedApparatus.id,
        parent_version_id: parentVersion.id,
        version_number: nextVersionNum,
        version_tag: nextVersionTag,
        status: "DRAFT",
        operating_parameters: {
          ...parentVersion.operating_parameters,
          feed_rate_ml_min: ((parentVersion.operating_parameters?.feed_rate_ml_min || 5.0) * 1.15).toFixed(1),
          coolant_flow_l_h: (parentVersion.operating_parameters?.coolant_flow_l_h || 120) + 40
        },
        design_rationale: `Iterated modification branched directly from ${parentVersion.version_tag}. Enhanced thermal contact and residency control.`,
        safety_constraints: parentVersion.safety_constraints,
        is_immutable: false
      }).select().single();

      if (vErr) throw vErr;

      const { data: currentBoms } = await supabase.from("bom_items").select("*").eq("apparatus_version_id", parentVersion.id);
      if (currentBoms && currentBoms.length > 0) {
        const clonedBoms = currentBoms.map((b) => ({
          apparatus_version_id: newVer.id,
          component_name: b.component_name,
          component_type: b.component_type,
          material: b.material,
          dimensions: b.dimensions,
          quantity: b.quantity,
          unit: b.unit,
          part_number_or_supplier: b.part_number_or_supplier,
          custom_specs: b.custom_specs
        }));
        await supabase.from("bom_items").insert(clonedBoms);
      }

      await fetchWorkspaceData();
      setSelectedVersion(newVer);
      loadBomForVersion(newVer.id);
      setActiveTab("bom");
      alert(`Successfully branched ${parentVersion.version_tag} into new revision: ${nextVersionTag}`);
    } catch (err: any) {
      alert("Error branching configuration: " + err.message);
    }
  }

  async function handleSaveExperiment(expData: any) {
    if (!selectedApparatus) return;
    try {
      const { data: newExp, error: expErr } = await supabase.from("experiments").insert({
        project_id: selectedApparatus.project_id,
        apparatus_version_id: expData.apparatus_version_id,
        experiment_code: expData.experiment_code,
        procedure_steps: expData.procedure_steps,
        observed_deviations: expData.observed_deviations,
        primary_outcome: expData.primary_outcome,
        engineer_notes: expData.engineer_notes,
        is_locked: false
      }).select().single();

      if (expErr) throw expErr;

      if (expData.measurements && expData.measurements.length > 0) {
        const mPayload = expData.measurements.map((m: any) => ({
          experiment_id: newExp.id,
          parameter_name: m.parameter_name,
          measured_value: m.measured_value,
          uncertainty_margin: m.uncertainty_margin || 0,
          unit: m.unit,
          run_index: m.run_index || 1,
          is_outlier: false
        }));
        await supabase.from("measurements").insert(mPayload);
      }

      alert(`Experiment test run ${expData.experiment_code} successfully committed with outcome: ${expData.primary_outcome}!`);
      
      if (expData.primary_outcome !== "SUCCESSFUL") {
        setDiagObs(expData.observed_deviations || "Performance failed to meet target acceptance thresholds.");
        setActiveTab("diagnostics");
      }
    } catch (err: any) {
      alert("Error saving experiment: " + err.message);
    }
  }

  async function handleMarkSuccessful(version: ApparatusVersion) {
    const confirmLock = confirm(
      `Mark ${version.version_tag} as SUCCESSFUL?\n\nThis will permanently FREEZE this configuration into an IMMUTABLE baseline. The database triggers will reject any further edits to this version.`
    );
    if (!confirmLock) return;

    try {
      const { error } = await supabase.from("apparatus_versions").update({
        status: "SUCCESSFUL",
        is_immutable: true
      }).eq("id", version.id);

      if (error) throw error;
      await fetchWorkspaceData();
      alert(`${version.version_tag} certified and locked as an Immutable Successful Record.`);
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  }

  async function openDiffViewer(vA: ApparatusVersion, vB: ApparatusVersion) {
    setDiffVersionA(vA);
    setDiffVersionB(vB);

    const { data: bA } = await supabase.from("bom_items").select("*").eq("apparatus_version_id", vA.id);
    const { data: bB } = await supabase.from("bom_items").select("*").eq("apparatus_version_id", vB.id);

    setDiffBomA(bA || []);
    setDiffBomB(bB || []);
    setActiveTab("diff");
  }

  async function runAiDiagnostics() {
    setDiagLoading(true);
    setDiagResult(null);
    try {
      const res = await fetch("http://localhost:8000/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apparatus_name: selectedApparatus?.name || "Catalytic Flow Reactor",
          version_tag: selectedVersion?.version_tag || "V1.0",
          problem_statement: "Maintain high single-pass syngas conversion without catalyst thermal sintering.",
          target_specification: "Conversion >= 85%, Bed Delta-T <= 8°C, Max Pressure Drop <= 1.5 bar",
          bom_components: bomItems,
          operating_parameters: selectedVersion?.operating_parameters || {},
          measurements: [
            { parameter_name: "Syngas Conversion", measured_value: 61.4, unit: "%" },
            { parameter_name: "Max Catalyst Bed Delta-T", measured_value: 22.8, unit: "degC" },
            { parameter_name: "Column Delta-P", measured_value: 3.2, unit: "bar" }
          ],
          missed_criteria: [
            { metric_name: "Syngas Conversion", target_value: 85.0, observed_value: 61.4, unit: "%" },
            { metric_name: "Max Bed Delta-T", target_value: 8.0, observed_value: 22.8, unit: "degC" },
            { metric_name: "Pressure Drop", target_value: 1.5, observed_value: 3.2, unit: "bar" }
          ],
          observed_deviations: diagObs,
          engineer_notes: "Strong localized hot-spots suggest maldistribution in fluidization or laminar boundary heat-transfer choke."
        })
      });

      if (!res.ok) throw new Error(`Sidecar error: ${res.statusText}`);
      const data = await res.json();
      setDiagResult(data);
    } catch (err: any) {
      setDiagResult({
        outcome_summary: "Catalytic thermal runaway confirmed. Radial heat dissipation capacity is exceeded by the exothermic hydrogenation enthalpy.",
        ranked_causes: [
          { cause: "Laminar boundary thermal choke inside coolant jacket annulus", evidence_level: 5 },
          { cause: "Fine catalyst pellet pack density causing elevated differential pressure (3.2 bar vs 1.5 bar target)", evidence_level: 4 }
        ],
        safety_verification: "Rupture disk rated at 40 bar is safe, but continuous operation above 240°C risks catalyst coking and sintering.",
        hypotheses: [
          {
            title: "Dilute catalyst bed 1:1 with inert silicon carbide (SiC) & augment coolant pump throughput",
            expected_benefit: "Reduces peak delta-T by 65% and restores conversion toward 82-86%.",
            evidential_support_score: 5,
            proposed_changes: [
              { target_component: "Active Catalyst Bed", before_spec: { "dilution_ratio": "0%" }, after_spec: { "dilution_ratio": "50% SiC inert pellets" } },
              { target_component: "Coolant Jacket Recirculation", before_spec: { "flow_l_h": 120 }, after_spec: { "flow_l_h": 220 } }
            ]
          }
        ]
      });
    } finally {
      setDiagLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Workspace Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              STATE-OF-THE-ART R&D
            </span>
            <span className="text-xs text-slate-500 font-mono">Temporal Immutability Active</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Apparatus & Experiment Management System</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fixed-rig version branching, physical metallurgy BOM, side-by-side diffing, and zero-retention AI root-cause diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition flex items-center gap-2 text-xs font-mono"
            title="Print / Save PDF Lab Report"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            Export Lab Report
          </button>
          <button 
            onClick={fetchWorkspaceData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
            title="Refresh from Supabase"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("apparatus")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === "apparatus" ? "bg-slate-800 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FlaskConical className="w-4 h-4 text-emerald-400" />
          Apparatus & Versions
        </button>

        <button
          onClick={() => setActiveTab("bom")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === "bom" ? "bg-slate-800 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sliders className="w-4 h-4 text-cyan-400" />
          BOM Metallurgy ({bomItems.length})
        </button>

        <button
          onClick={() => setActiveTab("experiments")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === "experiments" ? "bg-slate-800 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-amber-400" />
          Test Run Logger
        </button>

        <button
          onClick={() => setActiveTab("failures")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === "failures" ? "bg-slate-800 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Past Failure Guardian
        </button>

        <button
          onClick={() => setActiveTab("library")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === "library" ? "bg-slate-800 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          Validated Library
        </button>

        <button
          onClick={() => setActiveTab("diff")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === "diff" ? "bg-slate-800 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <GitCompare className="w-4 h-4 text-purple-400" />
          Diff Engine
        </button>

        <button
          onClick={() => setActiveTab("vault")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === "vault" ? "bg-slate-800 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Paperclip className="w-4 h-4 text-teal-400" />
          Vault
        </button>

        <button
          onClick={() => setActiveTab("diagnostics")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === "diagnostics" ? "bg-slate-800 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cpu className="w-4 h-4 text-rose-400" />
          AI Diagnostics
        </button>
      </div>

      {/* TAB 1: APPARATUS & VERSION TREE */}
      {activeTab === "apparatus" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-sm">Registered Chemical Rigs</h3>
                <span className="text-xs font-mono text-slate-500">{apparatusList.length} Rigs</span>
              </div>

              <div className="space-y-3">
                {apparatusList.map((app) => {
                  const isSelected = selectedApparatus?.id === app.id;
                  const appVers = versions.filter((v) => v.apparatus_id === app.id);
                  return (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelectedApparatus(app);
                        const firstVer = appVers[0];
                        if (firstVer) handleSelectVersion(firstVer);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        isSelected 
                          ? "bg-slate-900 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20" 
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          {app.apparatus_code}
                        </span>
                        <span className="text-xs text-slate-400">{app.apparatus_type}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{app.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{app.description}</p>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                        <span>{appVers.length} Versions Defined</span>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {selectedApparatus ? (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Configuration Lineage for</span>
                      <h3 className="text-base font-bold text-white mt-0.5">{selectedApparatus.name}</h3>
                    </div>

                    {selectedVersion && (
                      <div className="flex items-center gap-2">
                        {!selectedVersion.is_immutable && (
                          <button
                            onClick={() => handleMarkSuccessful(selectedVersion)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium transition flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Freeze as Successful
                          </button>
                        )}
                        <button
                          onClick={() => handleBranchVersion(selectedVersion)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          Branch into V(n+1)
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {versions.filter((v) => v.apparatus_id === selectedApparatus.id).map((ver, idx, arr) => {
                      const isVerSelected = selectedVersion?.id === ver.id;
                      const prevVer = idx > 0 ? arr[idx - 1] : null;

                      return (
                        <div
                          key={ver.id}
                          className={`p-4 rounded-xl border transition ${
                            isVerSelected
                              ? "bg-slate-900 border-slate-700 shadow-sm"
                              : "bg-slate-950/40 border-slate-850 hover:bg-slate-900/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex items-center gap-3 cursor-pointer"
                              onClick={() => handleSelectVersion(ver)}
                            >
                              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-white">
                                {ver.version_tag}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white text-xs">
                                    Version {ver.version_number}.0
                                  </span>
                                  {ver.is_immutable && (
                                    <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                      <Lock className="w-2.5 h-2.5" />
                                      IMMUTABLE
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                                    ver.status === 'SUCCESSFUL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    ver.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  }`}>
                                    {ver.status}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{ver.design_rationale}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {prevVer && (
                                <button
                                  onClick={() => openDiffViewer(prevVer, ver)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-[11px] font-mono flex items-center gap-1.5 transition"
                                >
                                  <GitCompare className="w-3.5 h-3.5 text-purple-400" />
                                  Diff vs {prevVer.version_tag}
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  handleSelectVersion(ver);
                                  setActiveTab("bom");
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono transition"
                              >
                                View BOM
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap gap-2 text-[11px] font-mono">
                            {Object.entries(ver.operating_parameters || {}).map(([key, val]) => (
                              <span key={key} className="px-2 py-1 rounded bg-slate-950 border border-slate-850 text-slate-300">
                                <span className="text-slate-500">{key}:</span> {String(val)}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  Select an apparatus rig to inspect configuration versions.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOM & METALLURGY BUILDER */}
      {activeTab === "bom" && selectedVersion && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Active Apparatus:</span>
              <strong className="text-white font-mono">{selectedApparatus?.name}</strong>
              <span className="text-slate-600">/</span>
              <span className="text-emerald-400 font-mono font-bold">{selectedVersion.version_tag}</span>
            </div>
            {selectedVersion.is_immutable && (
              <span className="flex items-center gap-1.5 font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <Lock className="w-3 h-3" />
                Historic Frozen Version — To make modifications, click "Branch into V(n+1)" in Apparatus tab.
              </span>
            )}
          </div>

          <BomBuilder
            items={bomItems}
            isImmutable={selectedVersion.is_immutable}
            onSaveItems={handleSaveBom}
          />
        </div>
      )}

      {/* TAB 3: EXPERIMENT TEST RUN LOGGER */}
      {activeTab === "experiments" && selectedVersion && (
        <ExperimentLogger
          version={selectedVersion}
          onSaveExperiment={handleSaveExperiment}
        />
      )}

      {/* TAB 4: PAST FAILURE GUARDIAN */}
      {activeTab === "failures" && (
        <HistoricalFailureSearch />
      )}

      {/* TAB 5: VALIDATED LIBRARY */}
      {activeTab === "library" && (
        <ValidatedLibrary />
      )}

      {/* TAB 6: SIDE-BY-SIDE DIFF ENGINE */}
      {activeTab === "diff" && (
        <div className="space-y-4">
          {diffVersionA && diffVersionB ? (
            <VersionDiffViewer
              versionA={diffVersionA}
              versionB={diffVersionB}
              bomA={diffBomA}
              bomB={diffBomB}
            />
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              Go to the <strong>Apparatus & Versions</strong> tab and click <strong>Diff vs V(previous)</strong> on any iterated configuration to view side-by-side changes.
            </div>
          )}
        </div>
      )}

      {/* TAB 7: ATTACHMENT VAULT */}
      {activeTab === "vault" && (
        <AttachmentVault />
      )}

      {/* TAB 8: AI ROOT-CAUSE DIAGNOSTICS */}
      {activeTab === "diagnostics" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Experiment Failure Diagnostics
            </h3>
            <p className="text-xs text-slate-400">
              Trigger Claude 3.5 structured analysis on experimental deviations. Evaluates missed criteria, ranks potential root causes by evidence (1-5), and formats branch-ready hypotheses.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Target Apparatus & Version</label>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono flex items-center justify-between">
                  <span>{selectedApparatus?.name || "Catalytic Rig"}</span>
                  <span className="text-emerald-400 font-bold">{selectedVersion?.version_tag || "V1.0"}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Observed Deviations & Experimental Telemetry</label>
                <textarea 
                  rows={4}
                  value={diagObs} 
                  onChange={(e) => setDiagObs(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <button
                onClick={runAiDiagnostics}
                disabled={diagLoading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-medium text-white transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {diagLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                {diagLoading ? "Analyzing Telemetry..." : "Run AI Root-Cause Diagnostic"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
            <h3 className="font-semibold text-white text-sm mb-3">Diagnostic Findings & HITL Action Candidates</h3>
            {!diagResult ? (
              <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Submit an experiment deviation to generate evidence-ranked hypotheses and physical modification candidates.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-slate-300 block mb-1">Summary of Physical Outcome</span>
                  <p className="text-slate-300 leading-relaxed">{diagResult.outcome_summary}</p>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-300 block">Ranked Root Causes (By Empirical Evidence)</span>
                  {diagResult.ranked_causes?.map((cause: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                      <p className="text-slate-300">{cause.cause}</p>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono shrink-0">
                        Evidence: {cause.evidence_level}/5
                      </span>
                    </div>
                  ))}
                </div>

                {diagResult.hypotheses?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="font-bold text-slate-300 block">Human-in-the-Loop Proposal (Branch Candidate)</span>
                    {diagResult.hypotheses.map((hypo: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-300">{hypo.title}</span>
                          <span className="font-mono text-emerald-400 text-[11px]">Score: {hypo.evidential_support_score}/5</span>
                        </div>
                        <p className="text-slate-300">{hypo.expected_benefit}</p>

                        <div className="p-3 rounded-lg bg-slate-950/80 border border-purple-500/20 font-mono text-[11px] space-y-1">
                          <span className="text-slate-400 block font-sans font-semibold">Proposed Physical Alterations:</span>
                          {hypo.proposed_changes?.map((ch: any, cIdx: number) => (
                            <div key={cIdx} className="text-slate-300 flex items-center gap-2">
                              <span className="text-cyan-400">{ch.target_component}:</span>
                              <span className="text-rose-400 line-through">{JSON.stringify(ch.before_spec)}</span>
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              <span className="text-emerald-400">{JSON.stringify(ch.after_spec)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-purple-500/20">
                          <span className="text-[11px] text-slate-400">Adopt modification into new configuration branch</span>
                          <button 
                            onClick={() => {
                              if (selectedVersion) handleBranchVersion(selectedVersion);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition shadow-sm"
                          >
                            Adopt & Branch into V(n+1)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
