import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chemical R&D Experiment & Apparatus Platform",
  description: "Private AI-Powered Apparatus Management & Reproducibility System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-emerald-400">
              ⚗
            </div>
            <div>
              <h1 className="font-semibold text-sm tracking-wide text-white">CHEM·RD EXPERIMENTAL PLATFORM</h1>
              <p className="text-xs text-slate-400">Isolated Workspace · Zero Retention AI Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
              ● Rigorous Traceability
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              ISO 17025 / ILAC-G8 Guard-Banding
            </span>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
