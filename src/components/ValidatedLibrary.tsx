"use client";

import React, { useState } from "react";
import { 
  Award, 
  CheckCircle2, 
  Copy, 
  Sparkles, 
  Layers, 
  Calendar, 
  Activity,
  ShieldCheck,
  ExternalLink
} from "lucide-react";

interface ValidatedLibraryItem {
  id: string;
  apparatus_code: string;
  name: string;
  apparatus_type: string;
  version_tag: string;
  repeatability_score: string;
  validated_run_count: number;
  standard_deviation: string;
  key_metrics: { name: string; value: string }[];
  metallurgy_summary: string;
  reproducibility_verdict: string;
  certified_date: string;
}

const VALIDATED_CONFIGURATIONS: ValidatedLibraryItem[] = [
  {
    id: "lib-1",
    apparatus_code: "RIG-CAT-FLOW",
    name: "Tubular Flow Reactor Core (Diluted Bed)",
    apparatus_type: "Fixed-Bed Catalytic Hydrogenation",
    version_tag: "V3.0",
    repeatability_score: "HIGH (5/5)",
    validated_run_count: 4,
    standard_deviation: "σ = ±0.42%",
    key_metrics: [
      { name: "Conversion Yield", value: "87.2% ± 0.4%" },
      { name: "Max Bed Delta-T", value: "5.8°C" },
      { name: "Space Velocity", value: "4800 h^-1" }
    ],
    metallurgy_summary: "Hastelloy C-276 sleeve, Inconel thermocouple, 50% SiC-diluted Cobalt catalyst.",
    reproducibility_verdict: "Demonstrated 100% repeatability across 4 independent test batches without thermal excursion.",
    certified_date: "Certified 2026-10-09"
  },
  {
    id: "lib-2",
    apparatus_code: "RIG-EXTRACT-04",
    name: "Supercritical CO2 Countercurrent Extraction Column",
    apparatus_type: "High-Pressure Supercritical Extraction",
    version_tag: "V2.1",
    repeatability_score: "HIGH (5/5)",
    validated_run_count: 5,
    standard_deviation: "σ = ±0.18 bar",
    key_metrics: [
      { name: "Extraction Recovery", value: "94.6% ± 0.3%" },
      { name: "Operating Pressure", value: "280 bar" },
      { name: "Solvent Ratio", value: "18.5 kg CO2/kg" }
    ],
    metallurgy_summary: "SS 316Ti forged column, Kalrez 6375 O-rings, Monel micro-metering valves.",
    reproducibility_verdict: "Purity target met in 5/5 replicates with negligible seal degradation.",
    certified_date: "Certified 2026-09-28"
  }
];

export default function ValidatedLibrary() {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Validated Successful Configuration Library</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically frozen, immutable apparatus baselines proven through $\ge 3$ independent test runs. Ready to clone as blueprints into new R&D projects.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          Certified Reproducibility Standard
        </span>
      </div>

      {/* Grid of Validated Configurations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {VALIDATED_CONFIGURATIONS.map((cfg) => (
          <div
            key={cfg.id}
            className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-5"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {cfg.apparatus_code}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {cfg.certified_date}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <h4 className="font-bold text-white text-base">{cfg.name}</h4>
                <span className="font-mono text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded">
                  {cfg.version_tag} (Frozen)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{cfg.apparatus_type}</p>

              {/* Statistical Reproducibility Badge */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block font-mono">Statistical Stability</span>
                  <strong className="text-emerald-300 font-bold">{cfg.repeatability_score}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-mono">Independent Replicates</span>
                  <strong className="text-white font-mono">{cfg.validated_run_count} Successful Runs</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-mono">Dispersion</span>
                  <strong className="text-cyan-400 font-mono">{cfg.standard_deviation}</strong>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                {cfg.key_metrics.map((km, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-850 text-center">
                    <span className="text-[10px] text-slate-400 block truncate">{km.name}</span>
                    <strong className="text-slate-200 font-mono text-xs">{km.value}</strong>
                  </div>
                ))}
              </div>

              {/* Metallurgy Summary */}
              <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-850 text-xs">
                <span className="text-slate-400 block font-semibold mb-0.5">Approved Metallurgy & Packing:</span>
                <p className="text-slate-300 font-mono text-[11px]">{cfg.metallurgy_summary}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-850 flex items-center justify-between">
              <span className="text-xs text-slate-500 italic max-w-xs truncate" title={cfg.reproducibility_verdict}>
                {cfg.reproducibility_verdict}
              </span>

              <button
                onClick={() => alert(`Cloning verified template "${cfg.name} (${cfg.version_tag})" into your active project workspace...`)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                Clone as Blueprint
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
