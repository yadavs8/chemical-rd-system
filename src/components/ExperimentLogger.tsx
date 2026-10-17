"use client";

import React, { useState } from "react";
import { 
  FlaskConical, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  Trash2, 
  Sparkles, 
  Layers, 
  Activity,
  ShieldCheck,
  ChevronRight,
  Download,
  FileSpreadsheet
} from "lucide-react";
import { ApparatusVersion, OutcomeClassification } from "@/types";

interface AcceptanceCriterion {
  id: string;
  metric_name: string;
  operator: ">=" | "<=" | "==" | "RANGE";
  target_value: number;
  target_max_value?: number;
  unit: string;
  is_critical: boolean;
}

interface TestMeasurement {
  parameter_name: string;
  measured_value: number | "";
  uncertainty_margin: number | "";
  unit: string;
  run_index: number;
  is_outlier: boolean;
}

interface ExperimentLoggerProps {
  version: ApparatusVersion;
  onSaveExperiment: (experimentData: any) => Promise<void>;
}

const DEFAULT_CRITERIA: AcceptanceCriterion[] = [
  { id: "c1", metric_name: "Syngas Conversion Yield", operator: ">=", target_value: 85.0, unit: "%", is_critical: true },
  { id: "c2", metric_name: "Catalyst Bed Delta-T", operator: "<=", target_value: 8.0, unit: "degC", is_critical: true },
  { id: "c3", metric_name: "Differential Pressure Drop", operator: "<=", target_value: 1.5, unit: "bar", is_critical: false },
  { id: "c4", metric_name: "Effluent Space Velocity", operator: ">=", target_value: 4500, unit: "h^-1", is_critical: false }
];

export default function ExperimentLogger({ version, onSaveExperiment }: ExperimentLoggerProps) {
  const [criteria, setCriteria] = useState<AcceptanceCriterion[]>(DEFAULT_CRITERIA);
  const [experimentCode, setExperimentCode] = useState(`EXP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [procedureSteps, setProcedureSteps] = useState(
    "1. Purge reactor tube with high-purity N2 for 30 minutes at 5 bar.\n" +
    "2. Ramp heating jacket to 220°C at 2.5°C/min under 100 mL/min N2 flow.\n" +
    "3. Switch gas feed to H2/CO syngas mix (2:1 ratio) and pressurize slowly to 25 bar.\n" +
    "4. Allow thermal equilibration for 60 minutes before logging steady-state conversion."
  );
  const [observedDeviations, setObservedDeviations] = useState("");
  const [engineerNotes, setEngineerNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Repeated run telemetry table
  const [measurements, setMeasurements] = useState<TestMeasurement[]>([
    { parameter_name: "Syngas Conversion Yield", measured_value: 86.4, uncertainty_margin: 0.8, unit: "%", run_index: 1, is_outlier: false },
    { parameter_name: "Catalyst Bed Delta-T", measured_value: 6.2, uncertainty_margin: 0.5, unit: "degC", run_index: 1, is_outlier: false },
    { parameter_name: "Differential Pressure Drop", measured_value: 1.2, uncertainty_margin: 0.1, unit: "bar", run_index: 1, is_outlier: false },
    { parameter_name: "Effluent Space Velocity", measured_value: 4620, uncertainty_margin: 50, unit: "h^-1", run_index: 1, is_outlier: false }
  ]);

  // Automated objective evaluation
  const evaluateCriterion = (crit: AcceptanceCriterion) => {
    const matching = measurements.filter((m) => m.parameter_name.toLowerCase() === crit.metric_name.toLowerCase() && m.measured_value !== "");
    if (matching.length === 0) return { status: "MISSING", message: "No data logged" };

    // Average value
    const avg = matching.reduce((acc, curr) => acc + (Number(curr.measured_value) || 0), 0) / matching.length;

    let passed = false;
    if (crit.operator === ">=") passed = avg >= crit.target_value;
    else if (crit.operator === "<=") passed = avg <= crit.target_value;
    else if (crit.operator === "==") passed = Math.abs(avg - crit.target_value) < 0.001;
    else if (crit.operator === "RANGE" && crit.target_max_value) passed = avg >= crit.target_value && avg <= crit.target_max_value;

    return {
      status: passed ? "PASSED" : "FAILED",
      avgValue: avg.toFixed(2),
      targetStr: `${crit.operator} ${crit.target_value} ${crit.unit}`
    };
  };

  const results = criteria.map((c) => ({ criterion: c, eval: evaluateCriterion(c) }));
  const criticalFailures = results.filter((r) => r.criterion.is_critical && r.eval.status === "FAILED");
  const nonCriticalFailures = results.filter((r) => !r.criterion.is_critical && r.eval.status === "FAILED");

  // Determine computed outcome classification
  let computedOutcome: OutcomeClassification = "SUCCESSFUL";
  if (criticalFailures.length > 0) computedOutcome = "FAILED";
  else if (nonCriticalFailures.length > 0) computedOutcome = "NEEDS_IMPROVEMENT";

  const handleAddMeasurement = () => {
    setMeasurements((prev) => [
      ...prev,
      { parameter_name: "Syngas Conversion Yield", measured_value: "", uncertainty_margin: "", unit: "%", run_index: prev.length + 1, is_outlier: false }
    ]);
  };

  const handleDeleteMeasurement = (index: number) => {
    setMeasurements((prev) => prev.filter((_, i) => i !== index));
  };

  // 1-Click Telemetry CSV Export Feature
  const handleExportTelemetryCsv = () => {
    const headers = [
      "Experiment_Code",
      "Apparatus_Version",
      "Run_Index",
      "Parameter_Name",
      "Measured_Value",
      "Uncertainty_Margin",
      "Unit",
      "Target_Specification",
      "Benchmark_Status",
      "Is_Outlier",
      "Primary_Outcome",
      "Conducted_Timestamp",
      "Standard_Operating_Procedure",
      "Observed_Deviations",
      "Engineer_Synthesis"
    ];

    const rows = measurements.map((m) => {
      const matchingCrit = criteria.find(
        (c) => c.metric_name.toLowerCase() === m.parameter_name.toLowerCase()
      );
      const targetSpec = matchingCrit ? `${matchingCrit.operator} ${matchingCrit.target_value} ${matchingCrit.unit}` : "Standard Record";
      let status = "LOGGED";
      if (matchingCrit && m.measured_value !== "") {
        const val = Number(m.measured_value);
        if (matchingCrit.operator === ">=") status = val >= matchingCrit.target_value ? "PASSED" : "FAILED";
        else if (matchingCrit.operator === "<=") status = val <= matchingCrit.target_value ? "PASSED" : "FAILED";
        else if (matchingCrit.operator === "==") status = Math.abs(val - matchingCrit.target_value) < 0.001 ? "PASSED" : "FAILED";
        else if (matchingCrit.operator === "RANGE" && matchingCrit.target_max_value) status = val >= matchingCrit.target_value && val <= matchingCrit.target_max_value ? "PASSED" : "FAILED";
      }

      return [
        experimentCode,
        version.version_tag,
        m.run_index,
        m.parameter_name,
        m.measured_value,
        m.uncertainty_margin || 0,
        m.unit,
        targetSpec,
        status,
        m.is_outlier ? "YES" : "NO",
        computedOutcome,
        new Date().toISOString(),
        procedureSteps.replace(/\n/g, "; "),
        observedDeviations || "None",
        engineerNotes || "None"
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${experimentCode}_telemetry_dataset_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveExperiment({
        experiment_code: experimentCode,
        apparatus_version_id: version.id,
        procedure_steps: procedureSteps,
        observed_deviations: observedDeviations,
        primary_outcome: computedOutcome,
        engineer_notes: engineerNotes,
        measurements: measurements.filter((m) => m.measured_value !== "")
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Physical Experiment Test Run Logger</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Testing Apparatus Configuration: <strong className="text-emerald-400 font-mono">{version.version_tag}</strong>. Telemetry is verified against objective criteria with uncertainty bounds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-500">Auto-Evaluated Outcome:</span>
            <span className={`px-2.5 py-1 rounded-full font-bold border ${
              computedOutcome === "SUCCESSFUL"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : computedOutcome === "FAILED"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}>
              {computedOutcome}
            </span>
          </div>

          {/* 1-Click Telemetry Export CSV Button */}
          <button
            type="button"
            onClick={handleExportTelemetryCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition shadow-sm flex items-center gap-1.5"
            title="Export complete test telemetry dataset to CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export Telemetry CSV
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Commit Test Record to Supabase
          </button>
        </div>
      </div>

      {/* Grid: Criteria Verification & Experiment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Objective Criteria Verification */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-850">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Objective Acceptance Criteria</h4>
            </div>
            <span className="text-[11px] font-mono text-slate-500">{criteria.length} Benchmarks</span>
          </div>

          <div className="space-y-2.5">
            {results.map(({ criterion, eval: ev }, idx) => (
              <div 
                key={idx} 
                className={`p-3.5 rounded-xl border transition ${
                  ev.status === "PASSED"
                    ? "bg-emerald-950/20 border-emerald-500/30"
                    : ev.status === "FAILED"
                    ? "bg-rose-950/20 border-rose-500/30"
                    : "bg-slate-900/40 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{criterion.metric_name}</span>
                  <div className="flex items-center gap-1.5">
                    {criterion.is_critical && (
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Critical
                      </span>
                    )}
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      ev.status === "PASSED"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : ev.status === "FAILED"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {ev.status}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Target: {criterion.operator} {criterion.target_value} {criterion.unit}</span>
                  <span className="text-slate-200">
                    Logged Avg: <strong>{ev.avgValue || "—"} {criterion.unit}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Note: Fulfilling all critical benchmarks automatically classifies this test run as Successful. A failure in any critical benchmark triggers failure analysis.
          </p>
        </div>

        {/* Right: Procedure & Observed Deviations */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Experiment Identifier</label>
              <input
                type="text"
                value={experimentCode}
                onChange={(e) => setExperimentCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-emerald-400 font-bold"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Apparatus Target Configuration</label>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-slate-300 flex items-center justify-between">
                <span>{version.version_tag}</span>
                <span className="text-slate-500 text-[11px]">Parent ID: {version.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          <div className="text-xs">
            <label className="text-slate-300 font-semibold block mb-1">Standard Operating Procedure Executed</label>
            <textarea
              rows={4}
              value={procedureSteps}
              onChange={(e) => setProcedureSteps(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-[11px]"
            />
          </div>

          <div className="text-xs">
            <label className="text-slate-300 font-semibold block mb-1">Observed Physical Deviations & Sensor Fluctuations</label>
            <textarea
              rows={2}
              placeholder="e.g. Mild pressure spike of 1.8 bar observed at t=42min during gas feed switchover."
              value={observedDeviations}
              onChange={(e) => setObservedDeviations(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200"
            />
          </div>

          <div className="text-xs">
            <label className="text-slate-300 font-semibold block mb-1">Engineer Synthesis & Lessons Learned</label>
            <textarea
              rows={2}
              placeholder="e.g. Pre-heating sleeve reduced wall heat dissipation; recommend maintaining 140 L/h coolant flow for next run."
              value={engineerNotes}
              onChange={(e) => setEngineerNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Sensor Measurements Table with Uncertainty Margins */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Empirical Sensor Readings & Uncertainty Margins (±σ)
            </h4>
          </div>
          <button
            type="button"
            onClick={handleAddMeasurement}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition"
          >
            <Plus className="w-3 h-3 text-emerald-400" />
            Add Replicate / Measurement
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/30">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Parameter Name</th>
                <th className="py-2.5 px-3">Run #</th>
                <th className="py-2.5 px-3">Measured Value</th>
                <th className="py-2.5 px-3">Uncertainty (±)</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {measurements.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition">
                  <td className="py-2.5 px-4">
                    <input
                      type="text"
                      value={m.parameter_name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMeasurements((prev) => prev.map((item, i) => i === idx ? { ...item, parameter_name: val } : item));
                      }}
                      className="bg-transparent text-slate-200 font-sans font-medium w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    Run {m.run_index}
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      step="any"
                      value={m.measured_value}
                      placeholder="0.00"
                      onChange={(e) => {
                        const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                        setMeasurements((prev) => prev.map((item, i) => i === idx ? { ...item, measured_value: val } : item));
                      }}
                      className="w-24 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-emerald-400 font-bold focus:outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      step="any"
                      value={m.uncertainty_margin}
                      placeholder="±0.0"
                      onChange={(e) => {
                        const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                        setMeasurements((prev) => prev.map((item, i) => i === idx ? { ...item, uncertainty_margin: val } : item));
                      }}
                      className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {m.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleDeleteMeasurement(idx)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                      title="Delete measurement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
