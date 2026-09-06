# Prior-Study Matching Assistant for Radiology

[![Phase 1 & 2 Prototype](https://img.shields.io/badge/Project%20Status-100%25%20Complete-brightgreen.svg)](#)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](#)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](#)
[![Tests Passed](https://img.shields.io/badge/Pytest-33%2F33%20Passed-success.svg)](#)

A decision-support system designed to reduce radiologist search latency by automatically retrieving and ranking the most clinically relevant prior imaging studies using explainable multi-factor scoring (0–100 scale), role-based access control (RBAC), and human-in-the-loop auditability.

---

> [!IMPORTANT]
> **SAFETY CONSTRAINT & CLINICAL SCOPE BOUNDARY**  
> The system **MUST NOT** make autonomous diagnostic, treatment, or clinical-management decisions. It functions strictly as a retrieval and ranking assistant. Every recommendation includes transparent positive (✓) and negative (⚠) evidence rules, a 0–100 score breakdown, and requires explicit human radiologist confirmation or override before taking high-impact action.

---

## 🔑 Demo Accounts (Quick Access)

For evaluation and testing, use the following pre-configured demo credentials:

| Role | Username | Password | Display Name | Permissions |
|---|---|---|---|---|
| **Radiologist (Primary)** | `radiologist` | `Demo@123` | Dr. Demo | Full access (View worklist, match priors, confirm comparisons, submit overrides with mandatory reasons, view audit trail & metrics). |
| **Radiology Technician** | `technician` | `Demo@123` | Demo Technician | Worklist & candidate prior viewing only. **Restricted from submitting clinical comparison decisions** (Enforced by UI & API 403 Forbidden). |
| **System Admin** | `admin` | `Admin@123` | System Admin | Access Dashboard, Audit Trail, Pilot Evaluation, System Config, and Stakeholder Survey summaries. |

---

## ⚡ Quick Start

### 1. Launch Dev Servers from Root Directory
```powershell
# Install dependencies from root directory
npm install

# Launch React UI dev server (Port 5173)
npm run dev

# Run FastAPI Backend (Port 8000)
.\venv\Scripts\uvicorn backend.app.main:app --reload --port 8000
```

### 2. Run Automated Pytest Suite & Pilot Benchmark
```powershell
# Run full 33-test acceptance suite
.\venv\Scripts\pytest backend/tests -v

# Run pilot benchmark evaluation
.\venv\Scripts\python scripts/run_benchmark.py
```

Visit the workstation UI at `http://localhost:5173`.

---

## 📊 Measured Pilot Experiment Results

- **Primary KPI (Search Time Reduction)**: **56.0% Reduction in Search Time** (Baseline Median: `42.0s` $\rightarrow$ Assistant Median: `18.5s`).
- **Top-1 Relevance Accuracy**: `100.0%`
- **Top-3 Relevance Recall**: `100.0%`
- **Pytest Acceptance Tests**: `33 / 33 Passed`

---

## 📚 Complete Project Documentation
All documentation files are available in [`docs/`](./docs):
- 📄 [SCENARIO_DEFINITION.md](./docs/SCENARIO_DEFINITION.md) — Problem statement, user roles, workflow, urgency model.
- 📊 [DATA_DICTIONARY.md](./docs/DATA_DICTIONARY.md) — Synthetic data schema and allowed values.
- 🧮 [MATCHING_RULES.md](./docs/MATCHING_RULES.md) — 0-100 scoring formulas, weights, and evidence formatting.
- 📉 [BASELINE.md](./docs/BASELINE.md) — Baseline retrieval method & deficiency analysis.
- 🧪 [EVALUATION_PLAN.md](./docs/EVALUATION_PLAN.md) — Benchmark experiment specification and metrics.
- 📈 [EVALUATION_RESULTS.md](./docs/EVALUATION_RESULTS.md) — Measured KPI results report.
- 🔍 [ERROR_ANALYSIS.md](./docs/ERROR_ANALYSIS.md) — Failure mode classification matrix.
- 🧩 [EDGE_CASES.md](./docs/EDGE_CASES.md) — Comprehensive edge case test matrix.
- 👥 [HUMAN_REVIEW_POINTS.md](./docs/HUMAN_REVIEW_POINTS.md) — The 6 explicit human review points.
- 🥼 [USABILITY_WALKTHROUGH.md](./docs/USABILITY_WALKTHROUGH.md) — Step-by-step evaluator walkthrough guide.
- 🛡️ [ETHICS_AND_SAFETY.md](./docs/ETHICS_AND_SAFETY.md) — Clinical safety boundaries and risk mitigation.
- 📋 [DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md) — Enterprise PACS deployment checklist.
- 📡 [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) — REST API endpoints and schema.
- ✅ [TEST_RESULTS.md](./docs/TEST_RESULTS.md) — Pytest test execution report.

---

## 🛡️ License & Disclaimer
This repository is developed for educational and research demonstration purposes. All patient metadata and study reports are 100% synthetic and de-identified.
