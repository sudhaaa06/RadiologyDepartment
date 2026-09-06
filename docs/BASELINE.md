# Baseline Retrieval Method & Deficiency Analysis

This document describes the simple deterministic baseline retrieval method representing traditional PACS/RIS pre-fetching workflows.

---

## 1. Baseline Algorithm Logic

The baseline retrieval engine mimics standard legacy PACS filtering:

1. **Hard Filter**:
   - `patient_id_hash == query.patient_id_hash`
   - `modality == query.modality` (exact string match)
   - `body_region == query.body_region` (exact string match)
   - `study_date < query.study_date`

2. **Sorting**:
   - Sort by `study_date` descending (most recent first).

3. **Fallback**:
   - If exact modality + body region yields no candidates, filter by `patient_id_hash` only and sort by `study_date` descending.

---

## 2. Why the Baseline Method is Insufficient

| Scenario / Limitation | Baseline Failure Mode | Impact on Radiologist |
|---|---|---|
| **Terminology Mismatch** | Query contains `"CT thorax"`, prior contains `"Chest CT"`. Baseline exact string match fails to link them. | Relevant prior is missed or pushed down into generic patient history. |
| **Cross-Modality Relevance** | Current is CT Chest for pulmonary nodule; prior is Chest X-Ray 2 months prior. Baseline ignores X-Ray because modality differs. | Radiologist misses recent baseline radiograph. |
| **Multiple Prior Scans** | Patient has 5 chest CT scans over 4 years for different indications (e.g. trauma vs nodule follow-up). Baseline returns most recent scan even if indication was unrelated trauma. | Radiologist opens wrong prior study, inspects it, realizes mismatch, and searches again. |
| **No Indication / Report Context**| Baseline cannot read or compare report concepts (`"RUL nodule"` vs `"Rib fracture"`). | High candidate noise and wasted review time. |

---

## 3. Baseline Performance Measurement Schema

The baseline method will be evaluated alongside the Proposed Matching Assistant on the synthetic benchmark dataset across the following metrics:

- **Time to Retrieve First Candidate**: Seconds elapsed until first candidate is loaded.
- **Time to Identify Best Comparison**: Total radiologist interaction time to confirm correct prior.
- **Top-1 Relevance Accuracy**: % of cases where baseline #1 pick is clinically correct.
- **Top-3 Relevance Recall**: % of cases where true prior is within baseline top-3.
- **Number of Irrelevant Candidates Reviewed**: Count of mismatched priors opened before finding the true match.
