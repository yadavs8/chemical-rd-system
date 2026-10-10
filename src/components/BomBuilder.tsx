"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Layers, 
  CheckCircle, 
  AlertCircle, 
  Tag, 
  Maximize2,
  Sparkles,
  ShieldAlert
} from "lucide-react";
import { BomItem } from "@/types";

interface BomBuilderProps {
  items: BomItem[];
  isImmutable: boolean;
  onSaveItems: (items: BomItem[]) => Promise<void>;
}

const COMMON_COMPONENTS = [
  { name: "Tubular Flow Reactor Core", type: "Reactor Column", material: "SS 316L", dimensions: "25mm ID x 500mm L", unit: "pcs" },
  { name: "Cobalt Hydrogenation Catalyst", type: "Active Catalyst", material: "Co/Al2O3 Pellets (2mm)", dimensions: "150g bed", unit: "g" },
  { name: "High-Pressure Jacketed Sleeve", type: "Heat Exchanger", material: "Hastelloy C-276", dimensions: "50mm OD x 450mm L", unit: "pcs" },
  { name: "K-Type Multi-Junction Thermocouple", type: "Sensor / Probe", material: "Inconel 600 Sheath", dimensions: "1.5mm probe x 600mm", unit: "pcs" },
  { name: "Backpressure Regulating Valve", type: "Pressure Control", material: "Monel 400", dimensions: "1/4 in NPT, 0-100 bar", unit: "pcs" },
  { name: "High-Pressure Rupture Disk", type: "Safety Relief", material: "Nickel 200", dimensions: "Burst rating 40 bar @ 250°C", unit: "pcs" }
];

export default function BomBuilder({ items: initialItems, isImmutable, onSaveItems }: BomBuilderProps) {
  const [items, setItems] = useState<BomItem[]>(initialItems);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState<Partial<BomItem>>({
    component_name: "",
    component_type: "Mechanical / Vessel",
    material: "SS 316L",
    dimensions: "",
    quantity: 1,
    unit: "pcs",
    part_number_or_supplier: ""
  });

  const handleAddItem = () => {
    if (!newItem.component_name) return;
    const item: BomItem = {
      id: "temp-" + Date.now(),
      apparatus_version_id: "",
      component_name: newItem.component_name || "New Component",
      component_type: newItem.component_type || "Mechanical",
      material: newItem.material || "SS 316L",
      dimensions: newItem.dimensions || null,
      quantity: newItem.quantity || 1,
      unit: newItem.unit || "pcs",
      part_number_or_supplier: newItem.part_number_or_supplier || null,
      custom_specs: {}
    };
    const updated = [...items, item];
    setItems(updated);
    setNewItem({
      component_name: "",
      component_type: "Mechanical / Vessel",
      material: "SS 316L",
      dimensions: "",
      quantity: 1,
      unit: "pcs",
      part_number_or_supplier: ""
    });
  };

  const handleQuickAdd = (template: typeof COMMON_COMPONENTS[0]) => {
    if (isImmutable) return;
    const item: BomItem = {
      id: "temp-" + Date.now() + Math.random(),
      apparatus_version_id: "",
      component_name: template.name,
      component_type: template.type,
      material: template.material,
      dimensions: template.dimensions,
      quantity: 1,
      unit: template.unit,
      part_number_or_supplier: "Certified Chemical Standard",
      custom_specs: {}
    };
    setItems((prev) => [...prev, item]);
  };

  const handleDeleteItem = (index: number) => {
    if (isImmutable) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveItems(items);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm text-white">Bill of Materials (BOM) & Metallurgy</h3>
            {isImmutable && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400">
                LOCKED / IMMUTABLE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Preserve exact hardware metallurgy, tolerances, catalyst formulations, and dimensions for strict reproducibility.
          </p>
        </div>

        {!isImmutable && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition shadow-sm flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {saving ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Save BOM Specification ({items.length} Items)
          </button>
        )}
      </div>

      {/* Quick Add Presets */}
      {!isImmutable && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
            Standard Laboratory Pre-Sets (1-Click Insert)
          </span>
          <div className="flex flex-wrap gap-2">
            {COMMON_COMPONENTS.map((comp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickAdd(comp)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span>{comp.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">({comp.material})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table of BOM items */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-mono border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Component Name</th>
              <th className="py-3 px-3">Classification</th>
              <th className="py-3 px-3">Material / Alloy</th>
              <th className="py-3 px-3">Dimensions / Spec</th>
              <th className="py-3 px-3">Qty</th>
              <th className="py-3 px-3">Supplier / Part #</th>
              {!isImmutable && <th className="py-3 px-3 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {items.length === 0 ? (
              <tr>
                <td colSpan={isImmutable ? 6 : 7} className="py-8 text-center text-slate-500">
                  No components registered in this configuration. Add components or select a pre-set above.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-800/20 transition">
                  <td className="py-3 px-4 font-medium text-slate-200">
                    {item.component_name}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/50 text-[11px] font-mono">
                      {item.component_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-400 font-semibold">
                    {item.material}
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono">
                    {item.dimensions || "—"}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-200">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {item.part_number_or_supplier || "—"}
                  </td>
                  {!isImmutable && (
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete component"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Component Entry Form */}
      {!isImmutable && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            Add Custom Laboratory Component
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Component Name</label>
              <input
                type="text"
                placeholder="e.g. Condenser Coil"
                value={newItem.component_name || ""}
                onChange={(e) => setNewItem({ ...newItem, component_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Classification</label>
              <select
                value={newItem.component_type || "Mechanical"}
                onChange={(e) => setNewItem({ ...newItem, component_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
              >
                <option value="Mechanical / Vessel">Mechanical / Vessel</option>
                <option value="Catalyst / Chemistry">Catalyst / Chemistry</option>
                <option value="Sensor / Probe">Sensor / Probe</option>
                <option value="Valving / Manifold">Valving / Manifold</option>
                <option value="Thermal / Heat Exchanger">Thermal / Heat Exchanger</option>
                <option value="Safety / Rupture Disk">Safety / Rupture Disk</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Material / Alloy</label>
              <input
                type="text"
                placeholder="e.g. Hastelloy C-276, PTFE"
                value={newItem.material || ""}
                onChange={(e) => setNewItem({ ...newItem, material: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Dimensions / Spec</label>
              <input
                type="text"
                placeholder="e.g. 10mm OD x 2m"
                value={newItem.dimensions || ""}
                onChange={(e) => setNewItem({ ...newItem, dimensions: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Quantity & Unit</label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={newItem.quantity || 1}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 1 })}
                  className="w-20 bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
                <input
                  type="text"
                  value={newItem.unit || "pcs"}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="w-16 bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-white transition text-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Insert Part
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
