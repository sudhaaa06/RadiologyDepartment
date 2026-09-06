# API Documentation: FastAPI REST Endpoints

This document describes the RESTful API endpoints for the Prior Study Matching Assistant.

Base URL: `http://localhost:8000/api`

---

## 1. Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | API health check and operational status |
| `GET` | `/studies` | List all synthetic radiology studies with optional filtering |
| `GET` | `/studies/{study_id}` | Retrieve details for a specific study |
| `POST` | `/studies` | Ingest a new de-identified study record |
| `POST` | `/match` | Retrieve ranked prior studies for a query study using baseline and explainable engine |
| `POST` | `/feedback` | Submit radiologist confirmation or override decision with mandatory reason |
| `GET` | `/audit-log` | Retrieve auditable history of recommendations and human decisions |
| `GET` | `/metrics` | Retrieve pilot evaluation metrics comparing baseline vs assistant |

---

## 2. Sample Payloads & Schemas

### `POST /api/match`
**Request Body**:
```json
{
  "study_id": "ST1001",
  "patient_id_hash": "PAT_8921A",
  "study_date": "2025-11-14",
  "department": "Oncology",
  "source_centre": "Main PACS",
  "modality": "CT thorax",
  "body_region": "Chest",
  "anatomy": "Lung",
  "laterality": "Right",
  "clinical_indication": "F/u pulmonary nodule RUL",
  "condition_concept": "Pulmonary Nodule",
  "report_summary": "7mm subpleural RUL nodule.",
  "report_concepts": ["RUL nodule", "subpleural"],
  "exam_type": "CT Chest without contrast",
  "contrast_used": false
}
```

**Response Body**:
```json
{
  "current_study_id": "ST1001",
  "patient_id_hash": "PAT_8921A",
  "low_confidence_warning": false,
  "recommendations": [
    {
      "study_id": "ST0811",
      "rank": 1,
      "score": 0.91,
      "study_date": "2025-03-10",
      "modality": "CT",
      "body_region": "Chest",
      "anatomy": "Lung",
      "condition_concept": "Pulmonary Nodule",
      "evidence": [
        "✓ Same patient identifier (PAT_8921A)",
        "✓ Matching anatomy: Chest (normalized from 'CT thorax')",
        "✓ Matching modality: CT",
        "✓ Matching clinical concept: Pulmonary Nodule",
        "✓ Overlapping report concepts: ['RUL nodule', 'subpleural']",
        "✓ Time interval: 8 months prior (2025-03-10)"
      ]
    }
  ]
}
```

---

### `POST /api/feedback`
**Request Body**:
```json
{
  "study_id": "ST1001",
  "recommended_prior_id": "ST0811",
  "human_decision": "OVERRIDDEN",
  "override_reason": "Wrong condition",
  "comments": "Selected older scan due to contrast protocol mismatch",
  "user_role": "Radiologist"
}
```

**Response Body**:
```json
{
  "status": "success",
  "audit_id": "AUD_90412",
  "message": "Feedback state recorded: OVERRIDDEN"
}
```
