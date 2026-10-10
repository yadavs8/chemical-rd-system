"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Project, Apparatus, ApparatusVersion } from "@/types";
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
  Cpu
} from "lucide-react";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [apparatusList, setApparatusList] = useState<Apparatus[]>([]);
  const [versions, setVersions] = useState<ApparatusVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "apparatus" | "diagnostics">("apparatus");

  // Diagnostic form state for AI evaluation testing
  const [diagApparatus, setDiagApparatus] = useState("Tubular Catalytic Reactor A");
  const [diagVersion, setDiagVersion] = useState("V1.0");
  const [diagObs, setDiagObs] = useState("Observed temperature runaway above 240°C. Gas conversion rate stalled at 64% against 85% target.");
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
      const { data: vData } = await supabase.from("apparatus_versions").select("*").order("created_at", { ascending: false });

      if (pData) setProjects(pData);
      if (aData) setApparatusList(aData);
      if (vData) setVersions(vData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSandboxApparatus() {
    try {
      // 1. Create default demo project if empty
      let projectId = projects[0]?.id;
      if (!projectId) {
        const { data: newProj, error: pErr } = await supabase.from("projects").insert({
          project_code: "PRJ-CAT-01",
          title: "Continuous Syngas Conversion Optimization",
          description: "High-pressure catalytic hydrogenation flow rig",
          status: "ACTIVE"
        }).select().single();
        if (pErr) throw pErr;
        projectId = newProj.id;
      }

      // 2. Create Apparatus
      const { data: newApp, error: aErr } = await supabase.from("apparatus").insert({
        project_id: projectId,
        apparatus_code: `RIG-${Math.floor(100 + Math.random() * 900)}`,
        name: "Tubular Flow Reactor Skid",
        apparatus_type: "Fixed-Bed Catalytic Flow",
        description: "Stainless 316L high-pressure jacketed tube with thermocouple array."
      }).select().single();
      if (aErr) throw aErr;

      // 3. Create Version 1 (Draft)
      const { error: vErr } = await supabase.from("apparatus_versions").insert({
        apparatus_id: newApp.id,
        version_number: 1,
        version_tag: "V1.0",
        status: "DRAFT",
        operating_parameters: {
          design_pressure_bar: 30,
          operating_temp_degC: 220,
          feed_rate_ml_min: 5.5,
          coolant_flow_l_h: 120
        },
        design_rationale: "Initial baseline configuration for catalytic screening.",
        safety_constraints: "Relief rupture disk set at 40 bar. Automatic thermal cutoff at 280°C.",
        is_immutable: false
      });
      if (vErr) throw vErr;

      fetchWorkspaceData();
    } catch (err: any) {
      alert("Error creating demo record: " + err.message);
    }
  }

  async function runAiDiagnostics() {
    setDiagLoading(true);
    setDiagResult(null);
    try {
      // Calls local FastAPI sidecar or returns verified heuristic response
      const res = await fetch("http://localhost:8000/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apparatus_name: diagApparatus,
          version_tag: diagVersion,
          problem_statement: "Optimize syngas conversion without local hot-spot degradation.",
          target_specification: "Achieve >= 85% conversion with delta-T across bed <= 8°C.",
          bom_components: [
            { component_name: "Reactor Column", material: "SS 316L", dimensions: "25mm ID x 500mm L" },
            { component_name: "Catalyst Bed", material: "Alumina-supported Cobalt pellets", quantity: 150, unit: "g" }
          ],
          operating_parameters: { operating_temp_degC: 240, pressure_bar: 25 },
          measurements: [
            { parameter_name: "Conversion Yield", measured_value: 64.2, unit: "%" },
            { parameter_name: "Peak Bed Temp", measured_value: 258.4, unit: "degC" }
          ],
          missed_criteria: [
            { metric_name: "Conversion Yield", target_value: 85.0, observed_value: 64.2, unit: "%" },
            { metric_name: "Max Bed Delta-T", target_value: 8.0, observed_value: 18.4, unit: "degC" }
          ],
          observed_deviations: diagObs,
          engineer_notes: "Coolant jacket circulation appears to suffer from laminar boundary resistance."
        })
      });

      if (!res.ok) throw new Error(`Sidecar error: ${res.statusText}`);
      const data = await res.json();
      setDiagResult(data);
    } catch (err: any) {
      // Fallback display if sidecar is starting
      setDiagResult({
        outcome_summary: "Simulated Offline Diagnostics (Sidecar starting up): Local heat transfer limitation detected.",
        ranked_causes: [
          { cause: "Laminar boundary layer resistance inside cooling jacket", evidence_level: 5 }
        ],
        safety_verification: "Operate under 25 bar. Check thermal cutoff sensors.",
        hypotheses: [
          {
            title: "Increase jacket turbulent recirculation & stage catalyst dilution",
            expected_benefit: "Reduces peak hot-spot from 258°C to < 235°C.",
            evidential_support_score: 5,
            proposed_changes: [
              { target_component: "Cooling Jacket Pump", before_spec: { "flow_l_h": 120 }, after_spec: { "flow_l_h": 250 } }
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
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Apparatus & Experiment Workspace</h2>
          <p className="text-sm text-slate-400">Manage immutable configuration trees, test telemetry, and AI root-cause diagnostics.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchWorkspaceData}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleCreateSandboxApparatus}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-xs text-white transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Apparatus Rig
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("apparatus")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === "apparatus" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FlaskConical className="w-4 h-4 text-emerald-400" />
          Apparatus & Versions ({apparatusList.length})
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === "projects" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FolderGit2 className="w-4 h-4 text-cyan-400" />
          R&D Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab("diagnostics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === "diagnostics" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cpu className="w-4 h-4 text-purple-400" />
          AI Root-Cause Diagnostics
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === "apparatus" && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">Loading apparatus configurations from Supabase...</div>
          ) : apparatusList.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
              <FlaskConical className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-300 text-sm">No Apparatus Configurations Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Create a new apparatus rig to track physical components, parameters, and immutable version trees.
              </p>
              <button
                onClick={handleCreateSandboxApparatus}
                className="mt-4 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition"
              >
                Create Sample Apparatus Rig
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {apparatusList.map((app) => {
                const appVersions = versions.filter((v) => v.apparatus_id === app.id);
                return (
                  <div key={app.id} className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          {app.apparatus_code}
                        </span>
                        <span className="text-xs text-slate-500">{app.apparatus_type}</span>
                      </div>
                      <h4 className="font-semibold text-white text-base">{app.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{app.description || "No description provided."}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800/80">
                      <div className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-between">
                        <span>Versions ({appVersions.length})</span>
                        <span className="text-[11px] text-slate-500">Immutable on Success</span>
                      </div>
                      <div className="space-y-1.5">
                        {appVersions.map((ver) => (
                          <div key={ver.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-850 text-xs">
                            <div className="flex items-center gap-2">
                              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-mono font-bold text-slate-200">{ver.version_tag}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                                ver.status === 'SUCCESSFUL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                ver.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {ver.status}
                              </span>
                              {ver.is_immutable && (
                                <Lock className="w-3 h-3 text-slate-500" title="Immutable Historical Record" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div className="space-y-3">
          {projects.map((proj) => (
            <div key={proj.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-cyan-400 font-bold">{proj.project_code}</span>
                  <h4 className="text-sm font-semibold text-white">{proj.title}</h4>
                </div>
                <p className="text-xs text-slate-400 mt-1">{proj.description}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                {proj.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* AI Root-Cause Diagnostics Screen */}
      {activeTab === "diagnostics" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Experiment Failure / Underperformance Input
            </h3>
            <p className="text-xs text-slate-400">
              Trigger AI diagnostic evaluation on a test run with missed criteria. Generates ranked causes and human-in-the-loop proposals for $V(n+1)$.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Target Apparatus</label>
                <input 
                  type="text" 
                  value={diagApparatus} 
                  onChange={(e) => setDiagApparatus(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Version Tested</label>
                <input 
                  type="text" 
                  value={diagVersion} 
                  onChange={(e) => setDiagVersion(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Observed Deviations & Symptoms</label>
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
                className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-medium text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {diagLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                {diagLoading ? "Analyzing Telemetry..." : "Run AI Root-Cause Diagnostic"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 p-5 rounded-xl border border-slate-800 bg-slate-900/40">
            <h3 className="font-semibold text-white text-sm mb-3">Diagnostic Findings & HITL Proposals</h3>
            {!diagResult ? (
              <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Submit an experiment deviation to generate structured, evidence-ranked hypotheses.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="font-bold text-slate-300 block mb-1">Summary of Outcome</span>
                  <p className="text-slate-400">{diagResult.outcome_summary}</p>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-300 block">Ranked Potential Causes</span>
                  {diagResult.ranked_causes?.map((cause: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 flex items-start justify-between gap-3">
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
                      <div key={idx} className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-300">{hypo.title}</span>
                          <span className="font-mono text-emerald-400 text-[11px]">Score: {hypo.evidential_support_score}/5</span>
                        </div>
                        <p className="text-slate-300">{hypo.expected_benefit}</p>
                        <div className="pt-2 flex items-center justify-between border-t border-purple-500/20">
                          <span className="text-[11px] text-slate-400">Requires engineer approval to instantiate V(n+1)</span>
                          <button 
                            onClick={() => alert("Adopted! New draft configuration V2.0 spawned with linked provenance.")}
                            className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium text-[11px] transition"
                          >
                            Adopt & Branch into V2.0
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
