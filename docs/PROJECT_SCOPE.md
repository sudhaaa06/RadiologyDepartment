# Project Scope & Specification: Prior Study Matching Assistant

## 1. Problem Statement
Radiologists reviewing incoming imaging studies face delays when manually retrieving past comparable studies across fragmented Hospital Information Systems (HIS), Picture Archiving and Communication Systems (PACS), and external imaging centers. 

Differences in terminology (e.g., "CT thorax" vs "Chest CT"), modality variations (e.g., comparing CT nodule with CXR), missing metadata, and lack of context ranking force radiologists to spend 1–3 minutes per case locating the most clinically relevant comparison study. This manual search increases diagnostic fatigue and lengthens overall turnaround time (TAT).

---

## 2. Stakeholders & Target Users

| Stakeholder Role | System Interaction | Primary Value Derived |
|---|---|---|
| **Radiologist (Primary User)** | Reviews ranked recommendations, inspects evidence, confirms or overrides match | Saves retrieval time, improves longitudinal tracking, reduces reporting friction |
| **Radiology Technician** | Pre-fetches prior studies during acquisition | Ensures correct priors are staged before radiologist reading |
| **Referring Clinician** | Receives timely report comparing relevant priors | Faster diagnostic clarity and clinical decision-making |
| **PACS / RIS Administrator** | Manages metadata synchronization and integration endpoints | Standardized retrieval API with full audit compliance |
| **Clinical Operations Manager**| Monitors pilot metrics (turnaround time, override rates) | Empirical data on operational efficiency gains |

---

## 3. End-to-End Operational Workflow

```
[ New Scan Arrives at PACS ]
            │
            ▼
[ Assistant Receives De-Identified Metadata ]
            │
            ▼
[ Retrieve All Historical Studies for Patient ]
            │
            ▼
[ Execute Terminology Normalization & Ranking Engine ]
            │
            ▼
[ Present Top Ranked Candidates + Evidence Bullets on Workstation UI ]
            │
            ▼
[ Radiologist Reviews Evidence & Ranks ]
       ├── Confirm -> System records CONFIRMED state & audit log
       └── Override -> Radiologist selects required Override Reason -> System records OVERRIDDEN state & audit log
            │
            ▼
[ Output Recorded for Evaluation & Metric Tracking ]
```

---

## 4. Constraints & Non-Goals

### Strict Non-Goals:
- **No Diagnostic Inference**: The system NEVER infers pathology severity, malignancy risk, or differential diagnoses.
- **No Treatment Guidance**: The system NEVER recommends clinical interventions, drug dosing, or surgical procedures.
- **No Automated Execution without Human Review**: Prior selection is purely advisory until confirmed or overridden by a licensed radiologist.

### Technical Constraints:
- **De-identified Data Only**: Zero PII/PHI (hashed patient IDs, relative dates).
- **Explainable Rules Engine**: Core matching relies on deterministic scoring and dictionary normalization, not opaque black-box deep learning.
- **Response Latency**: Matching endpoint response must complete in `< 200 ms`.

---

## 5. Success Metrics

- **Primary Metric**: Median time (seconds) to locate the most clinically relevant prior study.
- **Top-1 Relevance Accuracy**: % of cases where the top-ranked recommendation is confirmed by radiologist.
- **Top-3 Recall**: % of cases where the true clinically relevant prior is within the top-3 candidates.
- **Mean Candidates Reviewed**: Average number of candidate priors inspected before selection (Target: < 1.5).
- **Override Rate**: % of recommendations overridden by radiologists (monitored for model drift and edge cases).
