"use client";

import { useEffect, useState } from "react";
import { dataService } from "@/lib/dataService";
import { sidecarClient } from "@/lib/sidecarClient";
import { Project, Apparatus, ApparatusVersion, BomItem } from "@/types";
import BomBuilder from "@/components/BomBuilder";
import VersionDiffViewer from "@/components/VersionDiffViewer";
import ExperimentLogger from "@/components/ExperimentLogger";
import AttachmentVault from "@/components/AttachmentVault";
import HistoricalFailureSearch from "@/components/HistoricalFailureSearch";
import ValidatedLibrary from "@/components/ValidatedLibrary";
import ResearchDossier from "@/components/ResearchDossier";
import DedicatedLabReport from "@/components/DedicatedLabReport";
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
  Award, 
  BookOpen,
  FileSpreadsheet,
  Database
} from "lucide-react";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [apparatusList, setApparatusList] = useState<Apparatus[]>([]);
  const [versions, setVersions] = useState<ApparatusVersion[]>([]);
  const [selectedApparatus, setSelectedApparatus] = useState<Apparatus | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<ApparatusVersion | null>(null);
  const [bomItems, setBomItems] = useState<BomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageMode, setStorageMode] = useState<"remote" | "local">("local");
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"apparatus" | "bom" | "experiments" | "failures" | "library" | "research" | "report" | "diff" | "vault" | "diagnostics">("apparatus");

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
      const pData = await dataService.getProjects();
      const aData = await dataService.getApparatusList();
      const vData = await dataService.getVersions();
      setStorageMode(dataService.getStorageMode());

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
    const bData = await dataService.getBomItems(versionId);
    setBomItems(bData || []);
  }

  function handleSelectVersion(ver: ApparatusVersion) {
    setSelectedVersion(ver);
    loadBomForVersion(ver.id);
  }

  async function handleSaveBom(items: BomItem[]) {
    if (!selectedVersion) return;
    try {
      const saved = await dataService.saveBomItems(selectedVersion.id, items);
      setBomItems(saved);
      alert("Bill of Materials specifications updated and saved successfully.");
    } catch (err: any) {
      alert("Error saving BOM: " + err.message);
    }
  }

  async function handleBranchVersion(parentVersion: ApparatusVersion) {
    if (!selectedApparatus) return;
    try {
      const newVer = await dataService.branchVersion(parentVersion, selectedApparatus);
      await fetchWorkspaceData();
      setSelectedVersion(newVer);
      await loadBomForVersion(newVer.id);
      setActiveTab("bom");
      alert(`Successfully branched ${parentVersion.version_tag} into new revision: ${newVer.version_tag}`);
    } catch (err: any) {
      alert("Error branching configuration: " + err.message);
    }
  }

  async function handleSaveExperiment(expData: any) {
    if (!selectedApparatus) return;
    try {
      await dataService.saveExperiment({
        project_id: selectedApparatus.project_id,
        apparatus_version_id: expData.apparatus_version_id,
        experiment_code: expData.experiment_code,
        procedure_steps: expData.procedure_steps,
        observed_deviations: expData.observed_deviations,
        primary_outcome: expData.primary_outcome,
        engineer_notes: expData.engineer_notes,
        failure_symptoms: expData.failure_symptoms,
        measurements: expData.measurements
      });

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
      await dataService.markVersionSuccessful(version.id);
      await fetchWorkspaceData();
      alert(`${version.version_tag} certified and locked as an Immutable Successful Record.`);
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  }

  async function openDiffViewer(vA: ApparatusVersion, vB: ApparatusVersion) {
    setDiffVersionA(vA);
    setDiffVersionB(vB);

    const bA = await dataService.getBomItems(vA.id);
    const bB = await dataService.getBomItems(vB.id);

    setDiffBomA(bA || []);
    setDiffBomB(bB || []);
    setActiveTab("diff");
  }

  async function handleResetData() {
    if (confirm("Reset chemical pilot plant dataset to default initial state?")) {
      await dataService.resetToDefaultData();
      await fetchWorkspaceData();
      alert("Data reset to initial state.");
    }
  }

  async function runAiDiagnostics() {
    setDiagLoading(true);
    setDiagResult(null);
    try {
      const data = await sidecarClient.diagnoseExperiment({
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
      });
      setDiagResult(data);
    } catch (err: any) {
      console.error("AI diagnostics error:", err);
      alert("Error invoking scientific diagnostics: " + (err.message || String(err)));
    } finally {
      setDiagLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Workspace Header (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 print:hidden">
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
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${storageMode === "remote" ? "bg-emerald-400 animate-pulse" : "bg-cyan-400"}`} />
            <span className={storageMode === "remote" ? "text-emerald-400" : "text-cyan-400"}>
              {storageMode === "remote" ? "Supabase Live" : "Resilient Offline"}
            </span>
          </div>
          <button
            onClick={() => setActiveTab("report")}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition flex items-center gap-2 text-xs font-mono"
            title="View Official Lab Report"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            Formal Report View
          </button>
          <button 
            onClick={fetchWorkspaceData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetData}
            className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition text-[11px] font-mono"
            title="Reset dataset to initial state"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Executive 2-Column Dashboard Layout: Left List-View Sidebar + Right Operations Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT NAVIGATION LIST VIEW SIDEBAR (Sticky on Desktop) */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-4 print:hidden lg:sticky lg:top-24">
          {/* Active Rig Context Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-semibold">Selected Apparatus</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {selectedApparatus?.apparatus_code || "RIG"}
              </span>
            </div>

            {apparatusList.length > 0 && (
              <div className="space-y-1">
                <select
                  value={selectedApparatus?.id || ""}
                  onChange={(e) => {
                    const found = apparatusList.find((a) => a.id === e.target.value);
                    if (found) {
                      setSelectedApparatus(found);
                      const appVers = versions.filter((v) => v.apparatus_id === found.id);
                      if (appVers[0]) handleSelectVersion(appVers[0]);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                >
                  {apparatusList.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.apparatus_code} · {app.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 line-clamp-1 px-1">
                  {selectedApparatus?.apparatus_type}
                </p>
              </div>
            )}

            <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Target Lineage:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                selectedVersion?.is_immutable 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              }`}>
                {selectedVersion?.version_tag || "V1.0"} {selectedVersion?.is_immutable ? "● FROZEN" : "● ACTIVE"}
              </span>
            </div>
          </div>

          {/* Module Navigation List Panel */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            {/* GROUP 1: HARDWARE & METALLURGY */}
            <div>
              <div className="px-3 pb-1.5 text-[10px] font-mono tracking-wider text-slate-500 uppercase font-semibold">
                Hardware & Metallurgy
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("apparatus")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition text-left ${
                    activeTab === "apparatus"
                      ? "bg-slate-800 text-white shadow-sm border border-slate-700 font-semibold ring-1 ring-emerald-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FlaskConical className={`w-4 h-4 ${activeTab === "apparatus" ? "text-emerald-400" : "text-slate-500"}`} />
                    <span>Apparatus & Versions</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    {versions.filter((v) => v.apparatus_id === selectedApparatus?.id).length || versions.length} V
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("bom")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition text-left ${
                    activeTab === "bom"
                      ? "bg-slate-800 text-white shadow-sm border border-slate-700 font-semibold ring-1 ring-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sliders className={`w-4 h-4 ${activeTab === "bom" ? "text-cyan-400" : "text-slate-500"}`} />
                    <span>BOM Metallurgy</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold">
                    {bomItems.length} items
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("diff")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition text-left ${
                    activeTab === "diff"
                      ? "bg-slate-800 text-white shadow-sm border border-slate-700 font-semibold ring-1 ring-purple-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <GitCompare className={`w-4 h-4 ${activeTab === "diff" ? "text-purple-400" : "text-slate-500"}`} />
                    <span>Lineage Diff Engine</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400/80">Δ Matrix</span>
                </button>
              </div>
            </div>

            {/* GROUP 2: TESTING & SAFETY */}
            <div className="pt-2 border-t border-slate-800/70">
              <div className="px-3 pb-1.5 text-[10px] font-mono tracking-wider text-slate-500 uppercase font-semibold">
                Testing & Safety
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("experiments")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition text-left ${
                    activeTab === "experiments"
                      ? "bg-slate-800 text-white shadow-sm border border-slate-700 font-semibold ring-1 ring-amber-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck2 className={`w-4 h-4 ${activeTab === "experiments" ? "text-amber-400" : "text-slate-500"}`} />
                    <span>Test Run Logger</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    SOP ±σ
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("failures")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition text-left ${
                    activeTab === "failures"
                      ? "bg-slate-800 text-white shadow-sm border border-slate-700 font-semibold ring-1 ring-rose-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className={`w-4 h-4 ${activeTab === "failures" ? "text-rose-400" : "text-slate-500"}`} />
                    <span>Past Failure Guardian</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold">
                    Shield
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("library")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition text-left ${
                    activeTab === "library"
                      ? "bg-slate-800 text-white shadow-sm border border-slate-700 font-semibold ring-1 ring-emerald-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Award className={`w-4 h-4 ${activeTab === "library" ? "text-emerald-400" : "text-slate-500"}`} />
                    <span>Validated Library</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Cert 5/5</span>
                </button>
              </div>
            </div>

            {/* GROUP 3: SCIENTIFIC INTELLIGENCE & AUDIT */}
            <div className="pt-2 border-t border-slate-800/70">
              <div className="px-3 pb-1.5 text-[10px] font-mono tracking-wider text-slate-500 uppercase font-semibold">
                Intelligence & Audit
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("diagnostics")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition text-left ${
                    activeTab === "diagnostics"
                      ? "bg-slate-800 text-white shadow-sm border border-slate-700 font-semibold ring-1 ring-rose-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Cpu className={`w-4 h-4 ${activeTab === "diagnostics" ? "text-rose-400" : "text-slate-500"}`} />
                    <span>AI Diagnostics</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    HITL
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("research")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition text-left ${
                    activeTab === "research"
                      ? "bg-slate-800 text-white shadow-sm border border-slate-700 font-semibold ring-1 ring-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className={`w-4 h-4 ${activeTab === "research" ? "text-cyan-400" : "text-slate-500"}`} />
                    <span>Research & Patents</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Dossier</span>
                </button>

                <button
                  onClick={() => setActiveTab("vault")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition text-left ${
                    activeTab === "vault"
                      ? "bg-slate-800 text-white shadow-sm border border-slate-700 font-semibold ring-1 ring-teal-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Paperclip className={`w-4 h-4 ${activeTab === "vault" ? "text-teal-400" : "text-slate-500"}`} />
                    <span>Laboratory Vault</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">P&ID</span>
                </button>

                <button
                  onClick={() => setActiveTab("report")}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition text-left mt-2 ${
                    activeTab === "report"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/50 border border-emerald-500"
                      : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Printer className="w-4 h-4" />
                    <span>Formal Lab Report</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    PDF · SHA256
                  </span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN OPERATIONS CANVAS */}
        <section className="lg:col-span-8 xl:col-span-9 min-w-0">
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

      {/* TAB 6: SCIENTIFIC RESEARCH & PATENTS */}
      {activeTab === "research" && (
        <ResearchDossier />
      )}

      {/* TAB 7: DEDICATED LAB REPORT VIEW */}
      {activeTab === "report" && (
        <DedicatedLabReport
          apparatus={selectedApparatus}
          version={selectedVersion}
          bomItems={bomItems}
        />
      )}

      {/* TAB 8: SIDE-BY-SIDE DIFF ENGINE */}
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

      {/* TAB 9: ATTACHMENT VAULT */}
      {activeTab === "vault" && (
        <AttachmentVault />
      )}

      {/* TAB 10: AI ROOT-CAUSE DIAGNOSTICS */}
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

                {diagResult.safety_verification && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-amber-400 mb-0.5">Chemical Safety Constraint Verification</span>
                      <p className="text-slate-300 leading-relaxed">{diagResult.safety_verification}</p>
                    </div>
                  </div>
                )}

                {diagResult.missing_data_requests?.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-300 block">Missing Empirical Feeds (Recommended to Confirm Cause)</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      {diagResult.missing_data_requests.map((reqStr: string, rIdx: number) => (
                        <li key={reqStr}>{reqStr}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
        </section>
      </div>
    </div>
  );
}
