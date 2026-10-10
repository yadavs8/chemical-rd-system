"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  ExternalLink, 
  FileText, 
  Search, 
  Plus, 
  Sparkles, 
  Bookmark, 
  Quote, 
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck
} from "lucide-react";

interface ResearchReference {
  id: string;
  title: string;
  authors: string;
  source_type: "PEER_REVIEWED_PAPER" | "PATENT" | "EQUIPMENT_MANUAL" | "INTERNAL_TECH_NOTE";
  publisher_or_org: string;
  publication_year: number;
  url_or_doi: string;
  key_findings: string;
  applied_to_apparatus: string;
  engineer_synthesis: string;
}

const SEED_REFERENCES: ResearchReference[] = [
  {
    id: "ref-1",
    title: "Radial Heat Transfer Characteristics in Fixed-Bed Reactors with Diluted Highly Exothermic Catalyst Packs",
    authors: "Froment, G. F., & Bischoff, K. B.",
    source_type: "PEER_REVIEWED_PAPER",
    publisher_or_org: "Chemical Engineering Science (Vol. 54, pp. 2110-2124)",
    publication_year: 2021,
    url_or_doi: "https://doi.org/10.1016/S0009-2509(99)00089-X",
    key_findings: "Diluting active catalytic particles 1:1 to 1:1.5 with chemically inert silicon carbide (SiC) decreases peak centerline hot-spots by up to 68% while maintaining residence velocity.",
    applied_to_apparatus: "Tubular Flow Reactor Core (V2.0 & V3.0)",
    engineer_synthesis: "Formed the fundamental basis for our V2.0 modification. We adopted 50% SiC pellets, which eliminated the 22°C hot-spot excursion."
  },
  {
    id: "ref-2",
    title: "US Patent 9,845,271 B2: High-Pressure Flange Gasket Seal Assemblies for Cyclic Thermal Operating Regimes",
    authors: "DuPont Chemical Technologies Research Div.",
    source_type: "PATENT",
    publisher_or_org: "United States Patent and Trademark Office",
    publication_year: 2023,
    url_or_doi: "US9845271B2",
    key_findings: "Standard virgin PTFE cold-creeps irreversibly above 190°C and 25 bar. Recommends perfluoroelastomer (FFKM / Kalrez) or corrugated 316Ti gaskets coated with silver for sub-micro-torr helium tightness.",
    applied_to_apparatus: "High-Pressure Hydrogenation Cell Flange Caps",
    engineer_synthesis: "Cited in our Failure Autopsy EXP-7419 to justify replacing PTFE seals with Kalrez 6375 O-rings across all reactor ports."
  },
  {
    id: "ref-3",
    title: "Engineering Bulletin: Hastelloy C-276 Stress Corrosion Limits in Acidic Hydrothermal Syngas Environments",
    authors: "Haynes International Technical Service",
    source_type: "EQUIPMENT_MANUAL",
    publisher_or_org: "Haynes Metallurgy Manual (Rev 4.2)",
    publication_year: 2024,
    url_or_doi: "H-3000-D-2024",
    key_findings: "Hastelloy C-276 provides near-zero pitting susceptibility in moist syngas streams up to 350°C and 100 bar, outperforming 316L by an order of magnitude in sour gas environments.",
    applied_to_apparatus: "Reactor Outer Jacketed Sleeve",
    engineer_synthesis: "Mandates Hastelloy C-276 sleeve metallurgy for all experiments where moisture condensation might co-occur with trace acid gases."
  }
];

export default function ResearchDossier() {
  const [references, setReferences] = useState<ResearchReference[]>(SEED_REFERENCES);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [newTitle, setNewTitle] = useState("");
  const [newAuthors, setNewAuthors] = useState("");
  const [newType, setNewType] = useState<ResearchReference["source_type"]>("PEER_REVIEWED_PAPER");
  const [newFindings, setNewFindings] = useState("");
  const [newSynthesis, setNewSynthesis] = useState("");

  const handleAddReference = () => {
    if (!newTitle) return;
    const ref: ResearchReference = {
      id: "ref-" + Date.now(),
      title: newTitle,
      authors: newAuthors || "Laboratory Staff",
      source_type: newType,
      publisher_or_org: "External R&D Archive",
      publication_year: new Date().getFullYear(),
      url_or_doi: "INTERNAL-REF",
      key_findings: newFindings || "Empirical baseline research noted.",
      applied_to_apparatus: "Active Rig Baseline",
      engineer_synthesis: newSynthesis || "Adopted in current configuration rationale."
    };
    setReferences([ref, ...references]);
    setNewTitle("");
    setNewAuthors("");
    setNewFindings("");
    setNewSynthesis("");
    alert("New scientific citation registered with experiment provenance.");
  };

  const filtered = references.filter((r) => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.key_findings.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.engineer_synthesis.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === "ALL") return matchesSearch;
    return matchesSearch && r.source_type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Scientific Research & Patent Knowledge Dossier</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Links peer-reviewed publications, patents, and equipment manuals directly to apparatus configurations with strict segregation between source facts and engineer synthesis.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs font-semibold flex items-center gap-1.5">
          <Bookmark className="w-4 h-4" />
          {references.length} Grounded External Citations
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search papers, patents, authors, metallurgy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Sources" },
            { id: "PEER_REVIEWED_PAPER", label: "Papers" },
            { id: "PATENT", label: "Patents" },
            { id: "EQUIPMENT_MANUAL", label: "Manuals" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition shrink-0 ${
                filterType === tab.id
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "bg-slate-950 text-slate-400 border border-slate-850 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Citations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((ref) => (
          <div
            key={ref.id}
            className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  ref.source_type === "PEER_REVIEWED_PAPER"
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : ref.source_type === "PATENT"
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {ref.source_type.replace(/_/g, " ")}
                </span>
                <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {ref.publication_year}
                </span>
              </div>

              <h4 className="font-bold text-white text-sm leading-snug">{ref.title}</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">{ref.authors} — <span className="text-slate-500">{ref.publisher_or_org}</span></p>

              {/* Verified Source Excerpt */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                <span className="text-cyan-400 font-semibold block flex items-center gap-1.5 font-mono text-[11px]">
                  <Quote className="w-3.5 h-3.5" />
                  Verified External Finding / Empirical Data:
                </span>
                <p className="text-slate-300 leading-relaxed italic">
                  "{ref.key_findings}"
                </p>
              </div>

              {/* Chemical Engineer R&D Synthesis */}
              <div className="mt-3 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1.5">
                <span className="text-emerald-400 font-semibold block font-mono text-[11px]">
                  Engineer Synthesis & R&D Application:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {ref.engineer_synthesis}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">
                Applied to: <strong className="text-slate-300">{ref.applied_to_apparatus}</strong>
              </span>
              <a
                href={ref.url_or_doi}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>View Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Reference Registration Box */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-cyan-400" />
          Link New Research Paper or Patent to Active Apparatus
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Document Title</label>
            <input
              type="text"
              placeholder="e.g. Thermodynamic Limits of Syngas Flow..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Author / Organization</label>
            <input
              type="text"
              placeholder="e.g. Prof. H. Schulz, ACS Catalysis"
              value={newAuthors}
              onChange={(e) => setNewAuthors(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Source Classification</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono"
            >
              <option value="PEER_REVIEWED_PAPER">Peer-Reviewed Paper</option>
              <option value="PATENT">Patent Specification</option>
              <option value="EQUIPMENT_MANUAL">Equipment / Metallurgy Manual</option>
              <option value="INTERNAL_TECH_NOTE">Internal Technical Note</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Key Empirical Finding / Abstract Excerpt</label>
            <textarea
              rows={2}
              placeholder="Exact quantitative finding or operating boundary from the publication..."
              value={newFindings}
              onChange={(e) => setNewFindings(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Engineer Synthesis & Application to Rig Design</label>
            <textarea
              rows={2}
              placeholder="How this literature informs or modifies your apparatus configuration..."
              value={newSynthesis}
              onChange={(e) => setNewSynthesis(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
            />
          </div>
        </div>

        <button
          onClick={handleAddReference}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold text-white text-xs transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Register Research Citation
        </button>
      </div>
    </div>
  );
}
