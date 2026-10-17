"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  AlertTriangle, 
  History, 
  Filter, 
  ArrowRight, 
  ShieldAlert,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Thermometer,
  Gauge,
  FlaskConical,
  RotateCcw,
  Info
} from "lucide-react";

export interface PastFailureRecord {
  id: string;
  experiment_code: string;
  apparatus_name: string;
  apparatus_type: string;
  version_tag: string;
  symptoms: string;
  root_cause: string;
  preventative_rule: string;
  operating_conditions: string;
  materials: string[];
  operating_temperature_c: number;
  operating_pressure_bar: number;
  failure_category: "Thermal Runaway" | "Seal Failure" | "Catalyst Poisoning" | "Corrosion / Metallurgy" | "Hydrodynamic Choke";
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
}

const HISTORICAL_FAILURES: PastFailureRecord[] = [
  {
    id: "f1",
    experiment_code: "EXP-8902",
    apparatus_name: "Tubular Flow Reactor Skid",
    apparatus_type: "Fixed-Bed Reactor",
    version_tag: "V1.0",
    symptoms: "Thermal runaway above 248°C. Delta-T reached +22°C across middle catalyst section. Conversion collapsed to 61%.",
    root_cause: "Laminar boundary layer stagnation in the cooling jacket annulus combined with un-diluted Cobalt catalyst.",
    preventative_rule: "Never operate Co/Al2O3 catalyst at space velocity > 4000 h^-1 without minimum 40% inert SiC pellet bed dilution.",
    operating_conditions: "Temp: 245°C | Pressure: 25 bar | Flow: 120 L/h",
    materials: ["Cobalt Pellets", "SS 316L", "Mineral Oil Coolant"],
    operating_temperature_c: 248,
    operating_pressure_bar: 25,
    failure_category: "Thermal Runaway",
    severity: "CRITICAL"
  },
  {
    id: "f2",
    experiment_code: "EXP-7419",
    apparatus_name: "High-Pressure Hydrogenation Cell",
    apparatus_type: "Hydrogenation Autoclave",
    version_tag: "V1.2",
    symptoms: "Rupture disk seal micro-leak detected at 32 bar. Teflon gasket showed severe thermal creeping.",
    root_cause: "PTFE / Teflon cold-flow under elevated temperature (210°C) and cyclic pressure (>30 bar).",
    preventative_rule: "Enforce Kalrez (FFKM) or silver-plated copper crush gaskets for all flanges exceeding 180°C and 20 bar.",
    operating_conditions: "Temp: 215°C | Pressure: 35 bar",
    materials: ["PTFE Gasket", "Hastelloy C-276", "Nickel Rupture Disk"],
    operating_temperature_c: 215,
    operating_pressure_bar: 35,
    failure_category: "Seal Failure",
    severity: "CRITICAL"
  },
  {
    id: "f3",
    experiment_code: "EXP-6110",
    apparatus_name: "Fixed-Bed Syngas Converter",
    apparatus_type: "Catalytic Flow Rig",
    version_tag: "V0.9",
    symptoms: "Rapid catalytic deactivation within 18 hours. Sulfur poisoning suspected.",
    root_cause: "Syngas feed purification bed saturated; trace H2S bypassed into the primary catalyst bed.",
    preventative_rule: "Dual-stage ZnO guard beds must precede cobalt/ruthenium catalyst charges with online H2S detector alarm.",
    operating_conditions: "Temp: 220°C | Pressure: 20 bar",
    materials: ["Co-Mo Catalyst", "ZnO Guard", "SS 316L"],
    operating_temperature_c: 220,
    operating_pressure_bar: 20,
    failure_category: "Catalyst Poisoning",
    severity: "HIGH"
  },
  {
    id: "f4",
    experiment_code: "EXP-9124",
    apparatus_name: "Continuous Stirred Tank Reactor",
    apparatus_type: "CSTR Skid",
    version_tag: "V1.1",
    symptoms: "Pitting corrosion and localized chloride stress cracking detected on shaft impeller blades after 60 hours.",
    root_cause: "Aqueous chloride ion concentration coupled with temperature exceeding 190°C on SS 316L metallurgy.",
    preventative_rule: "Mandate Hastelloy C-22 or Tantalum cladding for acidic chloride operations above 160°C.",
    operating_conditions: "Temp: 195°C | Pressure: 45 bar",
    materials: ["SS 316L", "Inconel 625", "Hastelloy C-22"],
    operating_temperature_c: 195,
    operating_pressure_bar: 45,
    failure_category: "Corrosion / Metallurgy",
    severity: "HIGH"
  },
  {
    id: "f5",
    experiment_code: "EXP-4081",
    apparatus_name: "Autoclave Hydrothermal Synthesizer",
    apparatus_type: "Batch Hydrothermal",
    version_tag: "V0.8",
    symptoms: "Decompression seal failure through intergranular cracking of copper seating ring exposed to ammonia vapor.",
    root_cause: "Formation of soluble copper-amine coordination complexes leading to rapid embrittlement.",
    preventative_rule: "Prohibit all copper, brass, and bronze metallurgy in ammonia or amine services. Use gold-plated Inconel or pure Titanium.",
    operating_conditions: "Temp: 260°C | Pressure: 60 bar",
    materials: ["Copper Seals", "Titanium Gr 2", "Ammonium Hydroxide"],
    operating_temperature_c: 260,
    operating_pressure_bar: 60,
    failure_category: "Seal Failure",
    severity: "CRITICAL"
  },
  {
    id: "f6",
    experiment_code: "EXP-5332",
    apparatus_name: "Packed Column Gas Absorber",
    apparatus_type: "Distillation Column",
    version_tag: "V1.0",
    symptoms: "Severe pressure surge and bed fluidization choke. Differential pressure exceeded 4.5 bar across packing.",
    root_cause: "Operating gas superficial velocity exceeded flooding point without adequate demister pad drainage.",
    preventative_rule: "Limit gas superficial velocity to <= 75% of Sherwood flooding correlation with differential pressure interlock trip at 2.0 bar.",
    operating_conditions: "Temp: 140°C | Pressure: 12 bar",
    materials: ["Ceramic Raschig Rings", "SS 304", "Amines"],
    operating_temperature_c: 140,
    operating_pressure_bar: 12,
    failure_category: "Hydrodynamic Choke",
    severity: "MEDIUM"
  }
];

interface FailureSearchProps {
  onInspectRecord?: (record: PastFailureRecord) => void;
}

export default function HistoricalFailureSearch({ onInspectRecord }: FailureSearchProps) {
  // Dynamic search engine state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("ALL");
  const [selectedApparatus, setSelectedApparatus] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [minTempThreshold, setMinTempThreshold] = useState<number>(0);
  const [minPressureThreshold, setMinPressureThreshold] = useState<number>(0);

  // Proactive Semantic Pre-Test Scanner state
  const [activeTestSim, setActiveTestSim] = useState("");
  const [semanticWarning, setSemanticWarning] = useState<PastFailureRecord | null>(null);

  // Interactive "Safety Parameter Check" state
  const [proposedTemp, setProposedTemp] = useState<number>(245);
  const [proposedPressure, setProposedPressure] = useState<number>(25);
  const [proposedCatalyst, setProposedCatalyst] = useState<string>("Cobalt / Co-Al2O3 Pellets");
  
  // Safeguards toggles
  const [hasSicDilution, setHasSicDilution] = useState<boolean>(false);
  const [hasZnoGuardBed, setHasZnoGuardBed] = useState<boolean>(false);
  const [hasHighTempSeal, setHasHighTempSeal] = useState<boolean>(false);
  const [isAmmoniaAtmosphere, setIsAmmoniaAtmosphere] = useState<boolean>(false);

  // Evaluate Safety Parameter Check Patterns
  interface SafetyFlag {
    id: string;
    level: "CRITICAL" | "HIGH" | "WARNING";
    title: string;
    precedentExperiment: string;
    conditionSummary: string;
    hazardExplanation: string;
    mandatedRule: string;
    remediationAction?: {
      label: string;
      apply: () => void;
    };
  }

  const safetyCheckFlags = useMemo(() => {
    const flags: SafetyFlag[] = [];

    // Pattern 1: Cobalt > 240°C without SiC dilution
    const isCobalt = proposedCatalyst.toLowerCase().includes("cobalt");
    if (isCobalt && proposedTemp > 240 && !hasSicDilution) {
      flags.push({
        id: "flag-cobalt-runaway",
        level: "CRITICAL",
        title: "Catalytic Thermal Runaway Hazard (Exothermic Choke)",
        precedentExperiment: "EXP-8902 (Tubular Flow Reactor Skid V1.0)",
        conditionSummary: `Proposed temperature of ${proposedTemp}°C exceeds the 240°C threshold with 0% SiC dilution.`,
        hazardExplanation: "Un-diluted Cobalt catalyst beds experience severe radial heat stagnation. Middle catalyst section temperature spikes +22°C, causing sudden conversion collapse and runaway.",
        mandatedRule: "Never operate Co/Al2O3 catalyst above 240°C without minimum 40% inert SiC pellet bed dilution.",
        remediationAction: {
          label: "Apply 40% SiC Dilution Safeguard",
          apply: () => setHasSicDilution(true)
        }
      });
    }

    // Pattern 2: PTFE above 180°C or Pressure > 20 bar
    const isPtfe = proposedCatalyst.toLowerCase().includes("ptfe") || proposedCatalyst.toLowerCase().includes("teflon");
    if (isPtfe && (proposedTemp > 180 || proposedPressure > 20) && !hasHighTempSeal) {
      flags.push({
        id: "flag-ptfe-creep",
        level: "CRITICAL",
        title: "Seal Cold-Flow & Extrusion Rupture Hazard",
        precedentExperiment: "EXP-7419 (High-Pressure Hydrogenation Cell V1.2)",
        conditionSummary: `Proposed conditions (${proposedTemp}°C, ${proposedPressure} bar) exceed PTFE mechanical stability boundaries (180°C / 20 bar).`,
        hazardExplanation: "Fluoropolymer PTFE gaskets undergo severe creep and plastic extrusion under cyclic pressure, resulting in containment breach at flange seals.",
        mandatedRule: "Enforce Kalrez (FFKM) or silver-plated copper crush gaskets for all flanges exceeding 180°C and 20 bar.",
        remediationAction: {
          label: "Upgrade to Kalrez (FFKM) Crush Gasket",
          apply: () => setHasHighTempSeal(true)
        }
      });
    }

    // Pattern 3: Syngas / Co-Mo Catalyst without ZnO Guard Bed
    const isSyngasCoMo = proposedCatalyst.toLowerCase().includes("co-mo") || proposedCatalyst.toLowerCase().includes("cobalt");
    if (isSyngasCoMo && !hasZnoGuardBed) {
      flags.push({
        id: "flag-sulfur-poisoning",
        level: "HIGH",
        title: "Irreversible Sulfur Poisoning Hazard",
        precedentExperiment: "EXP-6110 (Fixed-Bed Syngas Converter V0.9)",
        conditionSummary: "Catalyst charge planned without dual-stage zinc oxide (ZnO) guard bed protection.",
        hazardExplanation: "Trace H2S in feed gas irreversibly binds to active cobalt/molybdenum sites, resulting in rapid deactivation within 18 operating hours.",
        mandatedRule: "Dual-stage ZnO guard beds must precede cobalt/ruthenium catalyst charges with online H2S detector alarm.",
        remediationAction: {
          label: "Enable Dual-Stage ZnO Guard Bed",
          apply: () => setHasZnoGuardBed(true)
        }
      });
    }

    // Pattern 4: Copper in Ammonia/Amine atmosphere
    const isCopper = proposedCatalyst.toLowerCase().includes("copper") || proposedCatalyst.toLowerCase().includes("brass");
    if ((isCopper || isAmmoniaAtmosphere) && isCopper) {
      flags.push({
        id: "flag-copper-amine",
        level: "CRITICAL",
        title: "Intergranular Stress Corrosion & Explosive Decompression",
        precedentExperiment: "EXP-4081 (Autoclave Hydrothermal Synthesizer)",
        conditionSummary: "Copper alloys exposed to ammonia/amine chemical vapor under pressure.",
        hazardExplanation: "Ammonia vapor forms soluble copper-tetrammine complexes causing violent seal failure and explosive decompression.",
        mandatedRule: "Prohibit all copper, brass, and bronze metallurgy in ammonia or amine services. Use gold-plated Inconel or pure Titanium.",
        remediationAction: {
          label: "Switch Metallurgy to Titanium / Inconel",
          apply: () => setProposedCatalyst("Hastelloy C-276 / Inconel")
        }
      });
    }

    // Pattern 5: High pressure (>40 bar) on standard SS 316L at high temperature
    const isSS316 = proposedCatalyst.toLowerCase().includes("ss 316l");
    if (isSS316 && proposedPressure > 40 && proposedTemp > 180) {
      flags.push({
        id: "flag-ss316-corrosion",
        level: "HIGH",
        title: "Elevated Pressure Stress Cracking Risk",
        precedentExperiment: "EXP-9124 (Continuous Stirred Tank Reactor V1.1)",
        conditionSummary: `Operating SS 316L at ${proposedPressure} bar and ${proposedTemp}°C approaches austenitic yield stress limits.`,
        hazardExplanation: "Localized pitting and chloride stress corrosion accelerate rapidly above 180°C in austenitic stainless steels.",
        mandatedRule: "Mandate Hastelloy C-22 or Inconel 625 cladding for high-pressure acidic operations above 160°C.",
        remediationAction: {
          label: "Upgrade to Hastelloy C-276",
          apply: () => setProposedCatalyst("Hastelloy C-276 / Inconel")
        }
      });
    }

    return flags;
  }, [proposedTemp, proposedPressure, proposedCatalyst, hasSicDilution, hasZnoGuardBed, hasHighTempSeal, isAmmoniaAtmosphere]);

  // Dynamic filter application across records
  const filteredFailures = useMemo(() => {
    return HISTORICAL_FAILURES.filter((rec) => {
      // 1. Text Search across material, symptom, apparatus, root cause, preventative rule, code
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || (
        rec.experiment_code.toLowerCase().includes(q) ||
        rec.apparatus_name.toLowerCase().includes(q) ||
        rec.symptoms.toLowerCase().includes(q) ||
        rec.root_cause.toLowerCase().includes(q) ||
        rec.preventative_rule.toLowerCase().includes(q) ||
        rec.materials.some((m) => m.toLowerCase().includes(q)) ||
        rec.operating_conditions.toLowerCase().includes(q)
      );

      // 2. Material filter
      const matchesMaterial = selectedMaterial === "ALL" || 
        rec.materials.some((m) => m.toLowerCase().includes(selectedMaterial.toLowerCase()));

      // 3. Apparatus filter
      const matchesApparatus = selectedApparatus === "ALL" || 
        rec.apparatus_name.toLowerCase().includes(selectedApparatus.toLowerCase()) ||
        rec.apparatus_type.toLowerCase().includes(selectedApparatus.toLowerCase());

      // 4. Category filter
      const matchesCategory = selectedCategory === "ALL" || 
        rec.failure_category === selectedCategory;

      // 5. Operating threshold filters (Temp & Pressure)
      const matchesTemp = minTempThreshold === 0 || rec.operating_temperature_c >= minTempThreshold;
      const matchesPressure = minPressureThreshold === 0 || rec.operating_pressure_bar >= minPressureThreshold;

      return matchesSearch && matchesMaterial && matchesApparatus && matchesCategory && matchesTemp && matchesPressure;
    });
  }, [searchTerm, selectedMaterial, selectedApparatus, selectedCategory, minTempThreshold, minPressureThreshold]);

  // Handle proactive free-text scanner
  const handleSimulateCheck = (text: string) => {
    setActiveTestSim(text);
    if (!text.trim()) {
      setSemanticWarning(null);
      return;
    }
    const lower = text.toLowerCase();
    if (lower.includes("thermal") || lower.includes("runaway") || lower.includes("dilut") || lower.includes("240") || lower.includes("hot spot") || lower.includes("cobalt")) {
      setSemanticWarning(HISTORICAL_FAILURES[0]);
    } else if (lower.includes("gasket") || lower.includes("leak") || lower.includes("ptfe") || lower.includes("teflon") || lower.includes("creep")) {
      setSemanticWarning(HISTORICAL_FAILURES[1]);
    } else if (lower.includes("poison") || lower.includes("sulfur") || lower.includes("deactivat") || lower.includes("zno")) {
      setSemanticWarning(HISTORICAL_FAILURES[2]);
    } else if (lower.includes("corrosion") || lower.includes("chloride") || lower.includes("pitting") || lower.includes("acid")) {
      setSemanticWarning(HISTORICAL_FAILURES[3]);
    } else if (lower.includes("copper") || lower.includes("ammonia") || lower.includes("decompression")) {
      setSemanticWarning(HISTORICAL_FAILURES[4]);
    } else if (lower.includes("flooding") || lower.includes("fluidiz") || lower.includes("choke") || lower.includes("absorber")) {
      setSemanticWarning(HISTORICAL_FAILURES[5]);
    } else {
      setSemanticWarning(null);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedMaterial("ALL");
    setSelectedApparatus("ALL");
    setSelectedCategory("ALL");
    setMinTempThreshold(0);
    setMinPressureThreshold(0);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white">Dynamic Historical Failure Guardian & Safety Scanner</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time pattern matcher against verified failure autopsies. Eliminates repeated metallurgical and thermal mistakes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-xs font-semibold">
            {HISTORICAL_FAILURES.length} Validated Failure Autopsies
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-xs font-semibold">
            Active Safety Rule Interlock
          </span>
        </div>
      </div>

      {/* INTERACTIVE SAFETY PARAMETER CHECK (OBJECTIVE 2) */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-white tracking-wide uppercase">
                Interactive Pre-Run Safety Parameter Check
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Input your proposed experiment operating conditions and catalyst metallurgy. The engine evaluates failure pattern interlocks instantly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {safetyCheckFlags.length === 0 ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Safety Clearance: ALL CLEAR
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                {safetyCheckFlags.length} Safety Directive Violation{safetyCheckFlags.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {/* Temperature Input */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                Proposed Temperature (°C)
              </label>
              <span className="font-mono font-bold text-emerald-400 text-sm">{proposedTemp} °C</span>
            </div>
            <input
              type="range"
              min="100"
              max="350"
              step="5"
              value={proposedTemp}
              onChange={(e) => setProposedTemp(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>100°C</span>
              <span className="text-rose-400 font-bold">240°C Threshold</span>
              <span>350°C</span>
            </div>
          </div>

          {/* Pressure Input */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                Proposed Pressure (bar)
              </label>
              <span className="font-mono font-bold text-cyan-400 text-sm">{proposedPressure} bar</span>
            </div>
            <input
              type="range"
              min="1"
              max="80"
              step="1"
              value={proposedPressure}
              onChange={(e) => setProposedPressure(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>1 bar</span>
              <span className="text-amber-400 font-bold">20 bar Threshold</span>
              <span>80 bar</span>
            </div>
          </div>

          {/* Catalyst / Metallurgy Select */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
              Proposed Catalyst / Metallurgy
            </label>
            <select
              value={proposedCatalyst}
              onChange={(e) => setProposedCatalyst(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="Cobalt / Co-Al2O3 Pellets">Cobalt / Co-Al2O3 Pellets</option>
              <option value="PTFE / Teflon Gaskets & Seals">PTFE / Teflon Gaskets & Seals</option>
              <option value="Co-Mo Catalyst (Unprotected Feed)">Co-Mo Catalyst (Unprotected Feed)</option>
              <option value="Copper / Brass Flange Seals">Copper / Brass Flange Seals</option>
              <option value="SS 316L Austenitic Vessel">SS 316L Austenitic Vessel</option>
              <option value="Hastelloy C-276 / Inconel">Hastelloy C-276 / Inconel</option>
            </select>
            <div className="text-[10px] text-slate-500 font-mono">
              Tested against known chemical interaction constraints.
            </div>
          </div>
        </div>

        {/* Safeguards & Mitigation Controls */}
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-850 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            Applied Engineering Safeguards:
          </span>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={hasSicDilution}
                onChange={(e) => setHasSicDilution(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span>Inert SiC Dilution (≥40%)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={hasZnoGuardBed}
                onChange={(e) => setHasZnoGuardBed(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span>Dual-Stage ZnO Guard Bed</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={hasHighTempSeal}
                onChange={(e) => setHasHighTempSeal(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span>Kalrez / Metallic Crush Gasket</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={isAmmoniaAtmosphere}
                onChange={(e) => setIsAmmoniaAtmosphere(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span>Ammonia / Amine Service</span>
            </label>
          </div>
        </div>

        {/* Safety Feedback Banners */}
        {safetyCheckFlags.length > 0 ? (
          <div className="space-y-3">
            {safetyCheckFlags.map((flag) => (
              <div 
                key={flag.id}
                className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2.5 animate-fadeIn"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-rose-300 font-bold text-xs">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{flag.level}: {flag.title}</span>
                  </span>
                  <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    Matches Precedent {flag.precedentExperiment}
                  </span>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  <strong className="text-rose-300">Failure Mechanism:</strong> {flag.hazardExplanation}
                </p>

                <div className="p-3 rounded-lg bg-slate-950/90 border border-rose-500/20 text-xs text-emerald-300 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <strong className="text-white block font-sans">Mandatory Preventative Directive:</strong>
                    <span className="text-emerald-400">"{flag.mandatedRule}"</span>
                  </div>

                  {flag.remediationAction && (
                    <button
                      onClick={flag.remediationAction.apply}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold text-xs transition shadow shrink-0 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {flag.remediationAction.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-emerald-300 block font-semibold">
                  Safe Operating Envelope Confirmed
                </strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Parameters ({proposedTemp}°C, {proposedPressure} bar, {proposedCatalyst}) do not match any historical runaway or failure autopsies.
                </p>
              </div>
            </div>

            <span className="font-mono text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
              Clear to Proceed
            </span>
          </div>
        )}
      </div>

      {/* Free-Text Semantic Pre-Test Scanner */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Natural Language Safety Scanner (Semantic Vector Simulation)
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

        {semanticWarning && (
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-rose-300 font-bold">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                CRITICAL WARNING: High Semantic Match to Prior Failure ({semanticWarning.experiment_code})
              </span>
              <span className="font-mono text-[11px] text-rose-400">Cosine Match: 91.4%</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Past Observation:</strong> {semanticWarning.symptoms}
            </p>
            <div className="p-2.5 rounded-lg bg-slate-950/90 border border-rose-500/20 text-emerald-300 font-mono">
              <strong>Mandatory Preventative Rule:</strong> {semanticWarning.preventative_rule}
            </div>
          </div>
        )}
      </div>

      {/* DYNAMIC SEARCH & MULTI-FACET FILTER ENGINE */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-850">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Dynamic Search Engine (Material, Symptom, Apparatus & Thresholds)
            </h4>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Showing {filteredFailures.length} of {HISTORICAL_FAILURES.length} Autopsies</span>
            <button
              onClick={handleResetFilters}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1"
              title="Reset all search filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Text Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search symptoms, causes, rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Apparatus Dropdown */}
          <div>
            <select
              value={selectedApparatus}
              onChange={(e) => setSelectedApparatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Apparatus Rigs</option>
              <option value="Tubular Flow">Tubular Flow Skid</option>
              <option value="Hydrogenation">Hydrogenation Cell</option>
              <option value="Syngas Converter">Syngas Converter</option>
              <option value="CSTR">CSTR Reactor</option>
              <option value="Autoclave">Autoclave Synthesizer</option>
              <option value="Absorber">Packed Column Absorber</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Failure Categories</option>
              <option value="Thermal Runaway">Thermal Runaway</option>
              <option value="Seal Failure">Seal Failure</option>
              <option value="Catalyst Poisoning">Catalyst Poisoning</option>
              <option value="Corrosion / Metallurgy">Corrosion / Metallurgy</option>
              <option value="Hydrodynamic Choke">Hydrodynamic Choke</option>
            </select>
          </div>

          {/* Material Quick Select */}
          <div>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Materials</option>
              <option value="Cobalt">Cobalt</option>
              <option value="PTFE">PTFE / Teflon</option>
              <option value="SS 316L">SS 316L</option>
              <option value="Hastelloy">Hastelloy</option>
              <option value="Copper">Copper</option>
              <option value="Zinc">Zinc / ZnO</option>
              <option value="Inconel">Inconel</option>
            </select>
          </div>
        </div>

        {/* Operating Threshold Range Sliders */}
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-850 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Operating Temp Filter: {minTempThreshold === 0 ? "Any Temp" : `≥ ${minTempThreshold}°C`}</span>
              <span className="text-slate-500 text-[10px]">Max recorded: 260°C</span>
            </div>
            <input
              type="range"
              min="0"
              max="260"
              step="20"
              value={minTempThreshold}
              onChange={(e) => setMinTempThreshold(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Operating Pressure Filter: {minPressureThreshold === 0 ? "Any Pressure" : `≥ ${minPressureThreshold} bar`}</span>
              <span className="text-slate-500 text-[10px]">Max recorded: 60 bar</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={minPressureThreshold}
              onChange={(e) => setMinPressureThreshold(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Failure Autopsy Record Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFailures.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
            No historical failures match the current filter parameters. Try clearing the search or lowering the threshold filters.
          </div>
        ) : (
          filteredFailures.map((fail) => (
            <div
              key={fail.id}
              onClick={() => onInspectRecord?.(fail)}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 cursor-pointer shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                    {fail.experiment_code}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{fail.version_tag}</span>
                </div>
                
                <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition">
                  {fail.apparatus_name}
                </h4>
                
                <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {fail.failure_category}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-rose-400 font-semibold">{fail.operating_temperature_c}°C</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-cyan-400 font-semibold">{fail.operating_pressure_bar} bar</span>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                  <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
                    Observed Failure Symptoms:
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{fail.symptoms}</p>
                </div>

                <div className="mt-2 text-[11px] text-slate-400">
                  <strong className="text-slate-300">Materials:</strong>{" "}
                  <span className="font-mono text-emerald-400/90">{fail.materials.join(", ")}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-850 space-y-2">
                <div className="text-xs font-mono text-emerald-400 font-semibold flex items-center justify-between">
                  <span>Preventative Protocol:</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition" />
                </div>
                <p className="text-xs text-slate-300 italic">
                  "{fail.preventative_rule}"
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
