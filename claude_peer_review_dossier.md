# Chemical R&D Apparatus & Experiment Management System
## Complete System Architecture & Peer-Review Dossier for Claude

> **Prepared For:** Peer Review & Technical Audit by Claude  
> **System Status:** Fully Implemented, Tested, Live & Synchronized to GitHub  
> **Repository:** [https://github.com/aakashbatra2812-oss/chemical-rd-system](https://github.com/aakashbatra2812-oss/chemical-rd-system)  
> **Local Live Application:** `http://localhost:3001`  

---

## 1. Project Infrastructure & Environment Isolation

### 1.1 Dedicated GitHub Repository
* **Repository URL:** [https://github.com/aakashbatra2812-oss/chemical-rd-system](https://github.com/aakashbatra2812-oss/chemical-rd-system)
* **Branch:** `main` (clean working tree, all features committed)
* **Local Workspace Path:** `C:\Users\dell\.gemini\antigravity\scratch\chemical-rd-system`
* **Confidentiality Measures:**
  * Strict `.gitignore` protecting against `.env`, certificates, secrets, and generated laboratory reports.
  * Secrets injected via environment variables only.

### 1.2 Dedicated Supabase Project
* **Project Reference ID:** `ytmgwbwnmiriltjmxyrl`
* **Dashboard URL:** `https://supabase.com/dashboard/project/ytmgwbwnmiriltjmxyrl`
* **API URL:** `https://ytmgwbwnmiriltjmxyrl.supabase.co`
* **Public Anon Key:**
  ```text
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0bWd3YndubWlyaWx0am14eXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MTEwNDIsImV4cCI6MjEwNzE4NzA0Mn0.6A1PxUTRWxncj71rWpd3LOg1W0Ud-NWjsephscpSTF0
  ```
* **Service Role Secret Key:**
  ```text
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0bWd3YndubWlyaWx0am14eXJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTYxMTA0MiwiZXhwIjoyMTA3MTg3MDQyfQ.VWVvCnsCpgjDcOjFrXc7SgpXIxp24qSbqBbSBo_3bdQ
  ```
* **Database State:** PostgreSQL 16 with `pgvector`, Row-Level Security (RLS) active on all 16 tables, and database immutability triggers installed.

---

## 2. Implemented Modules & Architecture Overview

The system is architected as a high-performance **modular monolithic web application** backed by a **scientific Python sidecar**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│  Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS, Lucide)   │
│  Port: http://localhost:3001                                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST
┌───────────────────────────────────▼────────────────────────────────────┐
│                       APPLICATION & DATA LAYER                         │
│  Supabase Client (Browser/Server) + PostgreSQL 16 + pgvector           │
│  - 16 Relational Tables with RLS & Immutability Enforcement            │
│  - Private Storage Bucket for P&ID Schematics & Sensor CSV Logs        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Internal Secret Auth
┌───────────────────────────────────▼────────────────────────────────────┐
│                    SCIENTIFIC & AI SIDECAR SERVICE                     │
│  Python 3.12 (FastAPI, Pint, Anthropic Claude 3.5 Sonnet)              │
│  Port: http://localhost:8000                                           │
│  - Pint Physical Unit Validator & SI Normalization                     │
│  - Zero-Retention AI Diagnostic Engine (Ranked Causes 1-5 & Hypotheses)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Breakdown

### 3.1 Database & Immutability Triggers (`supabase/migrations/001_initial_schema.sql`)
1. **The 16 Core Entities:**
   * `projects`: R&D project workspaces.
   * `research_objectives`: High-level chemical targets.
   * `acceptance_criteria`: Quantitative benchmarks with units and operators (`>=`, `<=`, `RANGE`).
   * `apparatus`: Physical chemical apparatus parent entity.
   * `apparatus_versions`: Complete hardware snapshots, operating conditions JSONB, design rationale, and immutability flags.
   * `bom_items`: Bill of Materials parts with metallurgy, dimensions, and quantities.
   * `experiments`: Physical test run logs with lifecycle states and `vector(1536)` embedding columns.
   * `measurements`: Replicate sensor readings with physical units, SI base values, and uncertainty margins ($\pm \sigma$).
   * `experiment_attachments`: Private file references with SHA-256 hashes.
   * `ai_analyses`: Diagnostic records containing gap analyses, safety checks, and ranked causes.
   * `improvement_hypotheses`: Structured HITL modification proposals.
   * `proposed_changes`: Concrete before/after parameter deltas.
   * `reproducibility_records`: Repeatability certifications across $\ge 3$ runs.
   * `audit_events`: Full tamper-evident audit logs.
2. **PostgreSQL Immutability Trigger:**
   * Prevents any `UPDATE` or `DELETE` on apparatus configurations or BOM items once their status is marked `SUCCESSFUL`.
   * Requires branching into $V(n+1)$ for iterative improvements.

### 3.2 Bill of Materials (BOM) & Metallurgy Builder (`src/components/BomBuilder.tsx`)
* **Certified 1-Click Pre-Sets:** Instant insertion of standard laboratory components (Hastelloy C-276 sleeves, Inconel thermocouples, Cobalt pellets, Monel valves, Nickel rupture disks).
* **Live Supabase Sync:** Edits persist directly to the PostgreSQL `bom_items` table.
* **Freeze State:** Turns read-only automatically when inspecting a frozen version.

### 3.3 Configuration Branching & Side-by-Side Diff (`src/components/VersionDiffViewer.tsx`)
* **Branch Action:** One-click branch into $V(n+1)$, automatically inheriting and cloning hardware BOM specs.
* **Diff Matrix:**
  * **Operating Parameters:** Displays baseline vs. iterated values and calculates physical $\Delta$ shifts (e.g. pressure, temperature, space velocity).
  * **Metallurgy Lineage:** Color-coded modifications highlighting newly introduced components (green), omitted components (rose), and altered specifications (amber).

### 3.4 Physical Experiment Logger & Acceptance Criteria Evaluator (`src/components/ExperimentLogger.tsx`)
* **Real-Time Objective Evaluation:** Compares logged sensor readings against quantitative thresholds:
  * *Syngas Conversion Yield ($\ge 85.0\%$)*
  * *Catalyst Bed $\Delta T$ ($\le 8.0^\circ\text{C}$)*
  * *Pressure Drop ($\le 1.5\ \text{bar}$)*
* **Automated Outcome Verdict:** Computes `SUCCESSFUL`, `NEEDS_IMPROVEMENT`, or `FAILED`.
* **Measurement Uncertainty Table:** Captures multi-run replicates, measured values, uncertainty bounds ($\pm \sigma$), and units.

### 3.5 Past Failure Guardian (`src/components/HistoricalFailureSearch.tsx`)
* **Pre-Test Safety Scanner:** Allows the chemical engineer to type intended test parameters into a live scanner.
* **Proactive Similarity Matching:** If proposed conditions match a prior failure autopsy (e.g. operating Cobalt catalyst $>240^\circ\text{C}$ without SiC bed dilution), the system raises an immediate warning detailing the past observation and the mandatory preventative rule.

### 3.6 Certified Validated Configuration Library (`src/components/ValidatedLibrary.tsx`)
* **Reproducibility Badges:** Configurations tested successfully $\ge 3$ times receive statistical stability ratings and sample standard deviation scores ($\sigma$).
* **Blueprint Cloning:** 1-click duplication of proven setups into new projects without modifying historical provenance.

### 3.7 Scientific Research & Patent Knowledge Dossier (`src/components/ResearchDossier.tsx`)
* **Strict Fact vs. Synthesis Segregation:** Clearly separates external peer-reviewed findings and patent claims from the engineer's internal R&D synthesis.
* **Literature Grounding:** Binds each external citation directly to the apparatus version it informed.

### 3.8 Private Laboratory Attachment Vault (`src/components/AttachmentVault.tsx`)
* Secure interface for P&ID schematics, CAD drawings, and raw telemetry CSV files with cryptographic hashes and 15-minute expiring download URLs.

### 3.9 Human-in-the-Loop AI Diagnostics (`sidecar_service/app/ai_orchestrator.py` & `src/app/page.tsx`)
* Powered by Claude 3.5 Sonnet (with commercial zero-retention parameters).
* Analyzes experimental gaps and outputs ranked failure causes (evidence score 1–5).
* Proposes concrete parameter changes with an **"Adopt & Branch into V(n+1)"** button that requires explicit engineer approval.

### 3.10 Formal Lab Report PDF Export (`src/components/DedicatedLabReport.tsx`)
* Formatted printable dossier with cryptographic verification hashes, operating conditions, BOM metallurgy tables, empirical stability verdicts, and digital sign-off blocks.

---

## 4. Key Questions to Ask Claude During Peer Review

When you share this dossier with Claude, consider asking:

1. **Schema & Normalization Architecture:**
   * *"Is the balance between relational tables (for queryable BOM/measurements) and JSONB (for dynamic operating parameters) optimal for long-term scalability and query performance?"*
2. **Immutability & Provenance Enforcement:**
   * *"Does the PostgreSQL trigger mechanism for locking successful configurations adequately protect against silent regression, and are there edge cases in branching lineage we should account for?"*
3. **Scientific Measurement Rigor:**
   * *"How can we further enhance the uncertainty tracking ($\pm \sigma$) and Pint unit conversion pipeline for continuous telemetry feeds and gas chromatography curves?"*
4. **Air-Gapped / Offline Portability:**
   * *"If the system needs to run in a 100% air-gapped facility in the future, what modifications would be recommended to package the Next.js app, Supabase local container, and an offline Ollama LLM into a single Docker Compose deployment?"*
