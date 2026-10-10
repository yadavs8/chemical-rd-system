# Private AI-Powered Chemical R&D Experiment and Apparatus Management System

A private, intelligent, and secure software system for chemical engineers to design apparatus configurations, track experimental outcomes, protect intellectual property, and accelerate iterative physical R&D through AI-assisted root-cause diagnosis.

---

## Key Capabilities

- **Strict Temporal Immutability:** Successful and validated apparatus configurations are cryptographically protected and frozen in PostgreSQL. Any modifications branch into traceable descendants ($V_1 \rightarrow V_2 \rightarrow V_3$).
- **Objective Acceptance Criteria:** Experiments are evaluated against quantitative thresholds with unit validation and uncertainty bounds ($\pm \sigma$).
- **AI Diagnostics with Zero Data Leakage:** AI analyses are generated via commercial APIs with zero retention or offline local LLMs. AI outputs are advisory and require explicit human-in-the-loop (HITL) approval to spawn new versions.
- **Dedicated Environment Isolation:** Designed to run with an isolated dedicated GitHub repository and a standalone, single-tenant Supabase project.

---

## Directory Structure

```text
├── .github/                      # CI/CD workflows, gitleaks, branch protection
├── src/                          # Next.js 15 Web Application
│   ├── app/                      # App router (Dashboard, Apparatus, Experiments, Reports)
│   ├── components/               # shadcn/ui and custom scientific visualization widgets
│   ├── lib/                      # Supabase client, Pint unit converters, audit loggers
│   └── types/                    # TypeScript interfaces matching PostgreSQL schema
├── sidecar_service/              # Python FastAPI Scientific & AI Engine
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint
│   │   ├── ai_orchestrator.py    # Claude 3.5 structured diagnostics pipeline
│   │   ├── unit_validator.py     # Pint dimensional analysis & SI normalization
│   │   └── rag_engine.py         # pgvector similarity matching against past failures
│   └── requirements.txt
├── supabase/
│   ├── migrations/               # PostgreSQL DDL migrations with triggers and RLS
│   └── seed.sql                  # Fictional non-sensitive sandbox chemical apparatus seed data
├── .env.example                  # Environment configuration template
└── README.md
```

---

## Setup & Local Development

### 1. Prerequisites
- Node.js 20+ and `npm`
- Python 3.12+ and `uv` or `venv`
- Supabase CLI or access to a dedicated Supabase Project

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and provide your dedicated Supabase credentials:
```bash
cp .env.example .env.local
```

### 3. Run Database Migrations
Deploy the schema to your isolated Supabase instance:
```bash
supabase db push
# or run supabase/migrations/001_initial_schema.sql in the Supabase SQL Editor
```

### 4. Start the Application
Install dependencies and run the Next.js frontend:
```bash
npm install
npm run dev
```

Run the Python Scientific Sidecar:
```bash
cd sidecar_service
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
