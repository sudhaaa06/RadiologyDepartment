# Scenario Definition & Clinical Specification

## 1. Problem Statement & Operational Scope
Radiology departments process incoming scans from internal wards, emergency departments, outpatient clinics, and external imaging facilities. Finding comparable prior examinations is hindered by fragmented systems, terminology variations (`"CT thorax"` vs `"Chest CT"`), missing metadata, and lack of context ranking.

Radiologists waste 1–3 minutes per scan manually searching PACS archives. The **Prior-Study Matching Assistant** automatically retrieves, normalizes, and ranks candidate prior studies using explainable multi-factor scoring.

---

## 2. User Roles & RBAC Matrix

| Role | User Account | Display Name | Permissions & Clinical Boundary |
|---|---|---|---|
| **Radiologist (Primary)** | `radiologist` / `Demo@123` | Dr. Demo | Full workstation access, view evidence, confirm comparison, override recommendation with mandatory reason. |
| **Technician (Secondary)** | `technician` / `Demo@123` | Demo Technician | Pre-fetch worklist view, inspect metadata, view suggested priors & rules. Cannot submit clinical comparisons (Restricted by API & UI). |
| **System Admin** | `admin` / `Admin@123` | System Admin | Access Dashboard, Audit Trail, Pilot Evaluation, System Config, and Stakeholder Survey summaries. Cannot make diagnostic decisions. |

---

## 3. Operational Workflow (Part A)

```
[ Unauthenticated User ]
           │
           ▼
[ Login Screen / Demo Accounts ]
           │
           ▼
[ Authenticated Session & Role Badge ]
           │
           ▼
[ Select Active Study (STAT / URGENT / ROUTINE) ]
           │
           ▼
[ Matching Engine Ranks Candidate Priors (0-100 Score + Breakdown) ]
           │
           ▼
[ Radiologist Inspects Positive (✓) & Negative (⚠) Evidence Signals ]
           │
   ┌───────┴─────────────────────────────────────────┐
   ▼                                                 ▼
[ Confirm Comparison ]                       [ Override Recommendation ]
   │                                                 │
[ Safety Disclaimer Dialog ]                 [ Mandatory Reason Modal ]
   │                                                 │
   └───────┬─────────────────────────────────────────┘
           ▼
[ Immutable Audit Trail Event Logged ]
           │
           ▼
[ Pilot Evaluation Data Updated ]
```

---

## 4. Urgency Priority Model (STAT / URGENT / ROUTINE)

- **STAT**: Urgent acute studies (e.g. STAT CT Brain stroke follow-up). Prioritized top recommendation display and immediate timeline execution.
- **URGENT**: Priority outpatient or inpatient follow-ups requiring expedited pre-fetching.
- **ROUTINE**: Standard longitudinal surveillance scans allowing broader candidate inspection.

*Note: Urgency influences pre-fetching priority and UI sorting, NOT diagnostic logic.*
