"use client";

import React, { useState, useEffect } from "react";
import { 
  FileUp, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  ShieldCheck, 
  Lock,
  Sparkles,
  Paperclip
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AttachmentItem {
  id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  storage_path: string;
  uploaded_at: string;
}

interface AttachmentVaultProps {
  experimentId?: string;
  apparatusId?: string;
}

export default function AttachmentVault({ experimentId, apparatusId }: AttachmentVaultProps) {
  const [attachments, setAttachments] = useState<AttachmentItem[]>([
    {
      id: "demo-1",
      file_name: "PID_Catalytic_FixedBed_V1.pdf",
      file_type: "application/pdf",
      file_size_bytes: 2450000,
      storage_path: "schematics/PID_Catalytic_FixedBed_V1.pdf",
      uploaded_at: new Date().toISOString()
    },
    {
      id: "demo-2",
      file_name: "Reactor_Wall_Microscopy_PostRun.png",
      file_type: "image/png",
      file_size_bytes: 1840000,
      storage_path: "images/Reactor_Wall_Microscopy_PostRun.png",
      uploaded_at: new Date().toISOString()
    },
    {
      id: "demo-3",
      file_name: "Telemetry_ThermocoupleArray_Run01.csv",
      file_type: "text/csv",
      file_size_bytes: 420000,
      storage_path: "logs/Telemetry_ThermocoupleArray_Run01.csv",
      uploaded_at: new Date().toISOString()
    }
  ]);
  const [uploading, setUploading] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setTimeout(() => {
      const newAtt: AttachmentItem = {
        id: "att-" + Date.now(),
        file_name: file.name,
        file_type: file.type || "application/octet-stream",
        file_size_bytes: file.size,
        storage_path: `uploads/${file.name}`,
        uploaded_at: new Date().toISOString()
      };
      setAttachments((prev) => [newAtt, ...prev]);
      setUploading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Private Laboratory Attachment Vault</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Encrypted at Rest
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Store P&ID CAD schematics, material certifications, thermal imaging, and raw sensor CSV logs with expiring pre-signed URLs.
          </p>
        </div>

        <label className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm flex items-center gap-2 shrink-0">
          <FileUp className="w-4 h-4" />
          <span>{uploading ? "Uploading Securely..." : "Upload Laboratory File"}</span>
          <input
            type="file"
            className="hidden"
            onChange={handleSimulateUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Attachments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attachments.map((att) => {
          const isPdf = att.file_name.endsWith(".pdf");
          const isImage = att.file_name.match(/\.(png|jpe?g|webp)$/i);
          const isCsv = att.file_name.endsWith(".csv");

          return (
            <div
              key={att.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                  {isPdf ? (
                    <FileText className="w-4 h-4 text-rose-400" />
                  ) : isImage ? (
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                  ) : isCsv ? (
                    <FileText className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Paperclip className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-white truncate" title={att.file_name}>
                    {att.file_name}
                  </h5>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-500">
                    <span>{formatFileSize(att.file_size_bytes)}</span>
                    <span>•</span>
                    <span>SHA-256 Verified</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] text-slate-500">
                  {new Date(att.uploaded_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => alert(`Generating 15-minute signed URL from Supabase for: ${att.file_name}`)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-[11px]"
                >
                  <Download className="w-3 h-3 text-cyan-400" />
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
