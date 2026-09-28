# Current Implementation Status (Phase 1 Baseline -> Phase 2 Target 70%)

**System:** Prior Study Matching Assistant for Radiology  
**Inspection Date:** 2026-09-09  
**Current Phase:** Transitioning from Phase 1 (35%) to Phase 2 (70%)  

---

## 1. Already Implemented (Preserved Core Functionality)

### Frontend (React 18 + Vite)
- **Authentication & RBAC UI:** 
  - Login and Registration interfaces supporting `Radiologist`, `Technician`, and `Admin` roles.
  - Role-dependent permission badges and buttons (e.g., Radiologist-only confirmation/override buttons; Technician restriction warnings).
- **Matching Workstation:**
  - 3-column layout: Incoming Scans worklist, Current Active Study inspector, Suggested Prior Studies ranking panel.
  - Worklist search filter (Study ID, Patient hash, Modality, Urgency).
  - Urgency indicators (`STAT`, `URGENT`, `ROUTINE`).
- **Interactive Modals:**
  - `ConfirmModal`: Human confirmation dialog with safety boundary disclaimer.
  - `OverrideModal`: Override dialog with reason selection dropdown and custom rationale input.
- **Audit & Analytics UI:**
  - `AuditLogTable`: Displays audit events, decisions, roles, and timestamps.
  - `EvaluationPanel`: Displays baseline vs. assistant retrieval metrics.
  - `DashboardView`: High-level metrics, scan gallery, and hospital network strip.
  - `DemoModeSelector`: Quick selection of test journeys (STAT CT Brain, ROUTINE MRI Knee, etc.).

### Backend (FastAPI + Python 3.11)
- **Authentication & RBAC:**
  - Token-based session management in `auth_service.py`.
  - Backend enforcement of permissions (Technicians receive HTTP 403 when attempting to confirm or override clinical decisions).
- **Study & Data Endpoints:**
  - `GET /api/health`: Health status and loaded study count.
  - `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/register`.
  - `GET /api/studies`, `GET /api/studies/{study_id}`, `POST /api/studies`.
  - `POST /api/match`: Computes candidate ranking, scores, evidence, and warnings.
  - `POST /api/feedback`: Records confirmation or override decisions with mandatory override reason validation.
  - `GET /api/audit-log`: Retrieves audit entries.
  - `GET /api/metrics`: Calculates benchmark metrics across patient study groups.
  - `GET /api/validation`, `POST /api/validation`: Stakeholder evaluation tracking.
- **Terminology Normalization:**
  - `TerminologyNormalizer`: Maps raw modality aliases, body regions, and clinical conditions to canonical concepts.
- **Scoring & Matching Engine:**
  - Multi-factor scoring (anatomy, modality, condition, report context Jaccard overlap, recency decay, laterality).
  - Generates positive evidence (`✓`) and negative/missing signals (`⚠️`).
- **Automated Tests:**
  - 33 passing pytest tests covering auth, RBAC, journeys, edge cases, baseline, and normalization.

---

## 2. Partially Implemented (Requires Enhancement in Phase 2)

- **Pilot Dataset Size:**
  - Currently contains 176 synthetic studies across 32 patients.
  - **Phase 2 Target:** Expand to 300–500 studies with realistic data imperfections (missing fields, terminology variations, external centre naming, multiple prior exams per patient).
- **Scoring Dimension Weights & Breakdown:**
  - Currently uses 6 dimensions totaling 100 points without an explicit separate `exam_type` score (Laterality was 5, Exam type was 0).
  - **Phase 2 Target:** Implement exact prototype weights: Anatomy (25), Modality (20), Condition (20), Report context (20), Recency (10), Laterality (3), Exam type (2) = 100 points total.
  - Provide individual named scores for all 7 dimensions in the response (`anatomy_score`, `modality_score`, `condition_score`, `report_context_score`, `recency_score`, `laterality_score`, `exam_type_score`).
- **Ranking Transparency & Evidence Detail:**
  - Evidence strings are generated, but users cannot expand a "How was this ranked?" detail view showing the exact rule, observed attributes, and point contribution per dimension (e.g. `Rule: Same anatomy | Observed: Chest = Chest | Contribution: +25`).
- **Audit Log Persistence & Event Breadth:**
  - Currently stored in-memory (`db._audit_logs`).
  - Lacks full event coverage: `STUDY_OPENED`, `RECOMMENDATION_VIEWED`, `EVIDENCE_VIEWED`, `MANUAL_PRIOR_SELECTED`.
  - Lacks UI filtering by user, action, date, and study.
- **Baseline vs. Assistant Benchmark Execution:**
  - Benchmark script currently uses fixed estimated timing approximations rather than dynamic measured execution times from real evaluation runs.
  - Needs structured evaluation dataset with at least 50 formal evaluation cases and ground-truth comparison labels.

---

## 3. Missing (To Be Implemented in Phase 2)

- **Ground-Truth Evaluation Cases (50+ cases):**
  - Formal evaluation dataset with `case_id`, `current_study`, `ground_truth_prior`, `difficulty`, `urgency`, `expected_reason`.
  - Stored strictly for evaluation and never exposed in clinical UI recommendations.
- **Persistent Audit Storage:**
  - File-backed audit persistence so audit entries survive backend restarts.
- **Audit Screen Filtering:**
  - Frontend controls to filter audit logs by user, action, date, and study.
- **Interactive "How Was This Ranked?" Rule Breakdown:**
  - Collapsible/expandable view for each candidate prior explaining the exact observation and point contribution.
- **Error Analysis Module & Matrix:**
  - Categorization of errors (Anatomy mismatch, Modality mismatch, Condition mismatch, Report-context mismatch, Terminology mismatch, Laterality mismatch, Recency bias, Missing metadata, Duplicate record, No relevant prior).
  - Generation of `ERROR_ANALYSIS.md`.
- **API Performance / Response Time Telemetry:**
  - Measure and display API response time in the workstation UI (e.g., `< 45ms`).
- **Documentation Deliverables:**
  - `MATCHING_ENGINE.md`
  - `PILOT_EXPERIMENT.md`
  - `ERROR_ANALYSIS.md`
  - `HUMAN_REVIEW_WORKFLOW.md`

---

## 4. Needs Improvement

- **Candidate Retrieval Input Flexibility:**
  - Support passing either `current_study_id` string or full `RadiologyStudy` payload to `POST /api/match`.
- **Low-Evidence State Explanation:**
  - Clarify explicit reasons when low confidence is triggered (missing anatomy, condition unavailable, modality mismatch, low report overlap).
- **Recency Dominance Guard:**
  - Explicit tests demonstrating older clinically relevant studies ranking higher than newer irrelevant studies.
