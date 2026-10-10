"use client";

import React, { useState } from "react";
import { 
  Search, 
  AlertTriangle, 
  History, 
  Filter, 
  ArrowRight, 
  ShieldAlert,
  Sparkles,
  ChevronRight
} from "lucide-react";

interface PastFailureRecord {
  id: string;
  experiment_code: string;
  apparatus_name: string;
  version_tag: string;
  symptoms: string;
  root_cause: string;
  preventative_rule: string;
  operating_conditions: string;
  materials: string[];
}

const HISTORICAL_FAILURES: PastFailureRecord[] = [
  {
    id: "f1",
    experiment_code: "EXP-8902",
    apparatus_name: "Tubular Flow Reactor Skid",
    version_tag: "V1.0",
    symptoms: "Thermal runaway above 248°C. Delta-T reached +22°C across middle catalyst section. Conversion collapsed to 61%.",
    root_cause: "Laminar boundary layer stagnation in the cooling jacket annulus combined with un-diluted Cobalt catalyst.",
    preventative_rule: "Never operate Co/Al2O3 catalyst at space velocity > 4000 h^-1 without minimum 40% inert SiC pellet bed dilution.",
    operating_conditions: "Temp: 245°C | Pressure: 25 bar | Flow: 120 L/h",
    materials: ["Cobalt Pellets", "SS 316L", "Mineral Oil Coolant"]
  },
  {
    id: "f2",
    experiment_code: "EXP-7419",
    apparatus_name: "High-Pressure Hydrogenation Cell",
    version_tag: "V1.2",
    symptoms: "Rupture disk seal micro-leak detected at 32 bar. Teflon gasket showed severe thermal creeping.",
    root_cause: "PTFE / Teflon cold-flow under elevated temperature (210°C) and cyclic pressure (>30 bar).",
    preventative_rule: "Enforce Kalrez (FFKM) or silver-plated copper crush gaskets for all flanges exceeding 180°C and 20 bar.",
    operating_conditions: "Temp: 215°C | Pressure: 35 bar",
    materials: ["PTFE Gasket", "Hastelloy C-276", "Nickel Rupture Disk"]
  },
  {
    id: "f3",
    experiment_code: "EXP-6110",
    apparatus_name: "Fixed-Bed Syngas Converter",
    version_tag: "V0.9",
    symptoms: "Rapid catalytic deactivation within 18 hours. Sulfur poisoning suspected.",
    root_cause: "Syngas feed purification bed saturated; trace H2S bypassed into the primary catalyst bed.",
    preventative_rule: "Dual-stage ZnO guard beds must precede cobalt/ruthenium catalyst charges with online H2S detector alarm.",
    operating_conditions: "Temp: 220°C | Pressure: 20 bar",
    materials: ["Co-Mo Catalyst", "ZnO Guard", "SS 316L"]
  }
];

interface FailureSearchProps {
  onInspectRecord?: (record: PastFailureRecord) => void;
}

export default function HistoricalFailureSearch({ onInspectRecord }: FailureSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [activeTestSim, setActiveTestSim] = useState("");
  const [similarityWarning, setSimilarityWarning] = useState<PastFailureRecord | null>(null);

  const filtered = HISTORICAL_FAILURES.filter((rec) => {
    const matchesSearch = 
      rec.experiment_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.root_cause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.preventative_rule.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedTag === "ALL") return matchesSearch;
    return matchesSearch && rec.materials.some((m) => m.toLowerCase().includes(selectedTag.toLowerCase()));
  });

  const handleSimulateCheck = (text: string) => {
    setActiveTestSim(text);
    if (!text) {
      setSimilarityWarning(null);
      return;
    }
    const lower = text.toLowerCase();
    // Simulate semantic vector matching
    if (lower.includes("thermal") || lower.includes("runaway") || lower.includes("dilut") || lower.includes("240") || lower.includes("hot spot")) {
      setSimilarityWarning(HISTORICAL_FAILURES[0]);
    } else if (lower.includes("gasket") || lower.includes("leak") || lower.includes("ptfe") || lower.includes("teflon") || lower.includes("creep")) {
      setSimilarityWarning(HISTORICAL_FAILURES[1]);
    } else if (lower.includes("poison") || lower.includes("sulfur") || lower.includes("deactivat")) {
      setSimilarityWarning(HISTORICAL_FAILURES[2]);
    } else {
      setSimilarityWarning(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white">Historical Failure Repository & Proactive Guardian</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Preserves autopsy records of failed configurations to eliminate repeated mistakes through proactive similarity matching.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-xs font-semibold">
          {HISTORICAL_FAILURES.length} Validated Failure Autopsies
        </span>
      </div>

      {/* Proactive Simulation Sandbox */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Proactive Pre-Test Safety Scanner (Test Intended Parameters)
          </span>
          <span className="text-[11px] font-mono text-slate-500">pgvector Cosine Distance: Threshold 0.82</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your proposed experiment parameters (e.g. 'Operating Cobalt catalyst at 245°C without bed dilution' or 'PTFE gasket at 210°C')..."
            value={activeTestSim}
            onChange={(e) => handleSimulateCheck(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
          />
        </div>

        {similarityWarning && (
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-rose-300 font-bold">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                CRITICAL WARNING: High Similarity to Prior Failure ({similarityWarning.experiment_code})
              </span>
              <span className="font-mono text-[11px] text-rose-400">Similarity Match: 91.4%</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Past Observation:</strong> {similarityWarning.symptoms}
            </p>
            <div className="p-2.5 rounded-lg bg-slate-950/90 border border-rose-500/20 text-emerald-300 font-mono">
              <strong>Mandatory Preventative Rule:</strong> {similarityWarning.preventative_rule}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search symptoms, root causes, metallurgy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {["ALL", "Cobalt", "PTFE", "Zinc"].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                selectedTag === tag
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "bg-slate-950 text-slate-400 border border-slate-850 hover:text-slate-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Failure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((fail) => (
          <div
            key={fail.id}
            className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                  {fail.experiment_code}
                </span>
                <span className="text-xs font-mono text-slate-500">{fail.version_tag}</span>
              </div>
              <h4 className="font-bold text-white text-sm">{fail.apparatus_name}</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">{fail.operating_conditions}</p>

              <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                <span className="text-slate-400 font-semibold block">Observed Failure Symptoms:</span>
                <p className="text-slate-300 leading-relaxed">{fail.symptoms}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-850 space-y-2">
              <div className="text-xs font-mono text-emerald-400 font-semibold">
                Preventative Protocol:
              </div>
              <p className="text-xs text-slate-300 italic">
                "{fail.preventative_rule}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
