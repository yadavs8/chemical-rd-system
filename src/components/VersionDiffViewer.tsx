"use client";

import React from "react";
import { GitCompare, ArrowRight, CheckCircle2, AlertTriangle, Layers, Activity } from "lucide-react";
import { ApparatusVersion, BomItem } from "@/types";

interface VersionDiffViewerProps {
  versionA: ApparatusVersion;
  versionB: ApparatusVersion;
  bomA: BomItem[];
  bomB: BomItem[];
  onClose?: () => void;
}

export default function VersionDiffViewer({
  versionA,
  versionB,
  bomA,
  bomB,
  onClose
}: VersionDiffViewerProps) {
  // Compute operating parameter deltas
  const paramsA = versionA.operating_parameters || {};
  const paramsB = versionB.operating_parameters || {};
  const allParamKeys = Array.from(new Set([...Object.keys(paramsA), ...Object.keys(paramsB)]));

  // Compute BOM deltas
  const bomNamesA = new Set(bomA.map((i) => i.component_name));
  const bomNamesB = new Set(bomB.map((i) => i.component_name));
  const allBomNames = Array.from(new Set([...bomNamesA, ...bomNamesB]));

  return (
    <div className="space-y-6 p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Side-by-Side Configuration Diff</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comparing provenance and modifications between apparatus iterations.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
            Baseline: <strong className="text-cyan-400">{versionA.version_tag}</strong> ({versionA.status})
          </span>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
            Iterated: <strong className="text-emerald-400">{versionB.version_tag}</strong> ({versionB.status})
          </span>
        </div>
      </div>

      {/* Operating Parameters Comparison */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Operating Parameters Delta</span>
        </div>

        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Parameter Name</th>
                <th className="py-2.5 px-4">{versionA.version_tag} (Previous)</th>
                <th className="py-2.5 px-4">{versionB.version_tag} (Current)</th>
                <th className="py-2.5 px-4">Delta / Shift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {allParamKeys.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500 font-sans">
                    No operating parameters recorded.
                  </td>
                </tr>
              ) : (
                allParamKeys.map((key) => {
                  const valA = paramsA[key];
                  const valB = paramsB[key];
                  const isModified = valA !== valB;
                  const isNumber = typeof valA === "number" && typeof valB === "number";
                  const delta = isNumber ? valB - valA : null;

                  return (
                    <tr
                      key={key}
                      className={isModified ? "bg-cyan-950/20 text-slate-200" : "text-slate-400 hover:bg-slate-900/30"}
                    >
                      <td className="py-2.5 px-4 font-semibold text-slate-300">{key}</td>
                      <td className="py-2.5 px-4">{valA !== undefined ? String(valA) : "—"}</td>
                      <td className="py-2.5 px-4">
                        <span className={isModified ? "text-cyan-300 font-bold" : ""}>
                          {valB !== undefined ? String(valB) : "—"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        {isModified ? (
                          delta !== null ? (
                            <span className={delta > 0 ? "text-emerald-400" : "text-rose-400"}>
                              {delta > 0 ? `+${delta}` : delta}
                            </span>
                          ) : (
                            <span className="text-amber-400 text-[11px]">Changed</span>
                          )
                        ) : (
                          <span className="text-slate-600">Identical</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill of Materials Hardware Diff */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Bill of Materials (BOM) Lineage Diff</span>
        </div>

        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Component</th>
                <th className="py-2.5 px-4">Baseline Material ({versionA.version_tag})</th>
                <th className="py-2.5 px-4">Iterated Material ({versionB.version_tag})</th>
                <th className="py-2.5 px-4">Modification State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allBomNames.map((name) => {
                const itemA = bomA.find((i) => i.component_name === name);
                const itemB = bomB.find((i) => i.component_name === name);

                const isAdded = !itemA && !!itemB;
                const isRemoved = !!itemA && !itemB;
                const isModified = itemA && itemB && (itemA.material !== itemB.material || itemA.dimensions !== itemB.dimensions || itemA.quantity !== itemB.quantity);

                return (
                  <tr
                    key={name}
                    className={`transition ${
                      isAdded
                        ? "bg-emerald-950/20 text-emerald-200"
                        : isRemoved
                        ? "bg-rose-950/20 text-rose-200"
                        : isModified
                        ? "bg-amber-950/20 text-amber-200"
                        : "text-slate-400"
                    }`}
                  >
                    <td className="py-2.5 px-4 font-medium text-slate-200">{name}</td>
                    <td className="py-2.5 px-4 font-mono">
                      {itemA ? `${itemA.material} (${itemA.dimensions || "std"})` : "—"}
                    </td>
                    <td className="py-2.5 px-4 font-mono">
                      {itemB ? `${itemB.material} (${itemB.dimensions || "std"})` : "—"}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px]">
                      {isAdded && <span className="text-emerald-400 font-bold">+ Newly Introduced Part</span>}
                      {isRemoved && <span className="text-rose-400 font-bold">- Omitted Component</span>}
                      {isModified && <span className="text-amber-400 font-bold">✎ Specification Modified</span>}
                      {!isAdded && !isRemoved && !isModified && <span className="text-slate-600">Unchanged</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
