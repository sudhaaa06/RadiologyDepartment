# Error Analysis & Classification Matrix

This document provides the error classification framework and failure analysis for low-confidence or mismatched candidates.

---

## 1. Error Categories Matrix

| Error Category | Description | Root Cause | Proposed Mitigation |
|---|---|---|---|
| **`TERMINOLOGY_MISMATCH`** | Synonyms absent from dictionary (e.g. `"RUL opacity"` vs `"Pulmonary nodule"`) | Terminology Normalizer missing localized acronym variant | Expand concept synonym lookup table in `normalization.py`. |
| **`RECENCY_BIAS`** | Recent scan for different condition ranked above older scan for same condition | Recency weight over-penalized older relevant scan | Engine detects condition match and applies clinical relevance tag override. |
| **`MISSING_METADATA`** | Mandatory anatomy or indication field set to `null` | Incomplete DICOM tag extraction from external PACS | Fallback parser extracts terms from `exam_type` and free-text summary. |
| **`LATERALITY_MISMATCH`** | Comparing Left Knee MRI with Right Knee MRI | DICOM laterality tag missing or conflicting | Engine flags negative signal: `"⚠️ Laterality conflict: Left vs Right"`. |
| **`POOR_REPORT_CONTEXT`** | Report concept overlap Jaccard score $< 0.1$ | Short report impression text | Weight fallback shifts to anatomy and condition match scores. |
| **`NO_VALID_PRIOR`** | Patient has zero historical prior studies in archive | New patient or first-time imaging | System displays safe amber warning: *"Limited retrieval evidence"*. |

---

## 2. Sample Failure Log Analysis

```json
{
  "case_id": "CASE-014",
  "query_study": "ST1042",
  "expected_prior": "ST0811",
  "assistant_rank": 2,
  "failure_type": "Terminology mismatch",
  "why_it_happened": "Unnormalized acronym 'SPN' in clinical indication not mapped to Pulmonary Nodule",
  "potential_improvement": "Add 'SPN' -> 'Pulmonary Nodule' to TerminologyNormalizer"
}
```
