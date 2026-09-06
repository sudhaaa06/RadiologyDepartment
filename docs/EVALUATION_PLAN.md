# Evaluation Plan & Benchmark Specification

This document details the evaluation protocol for comparing the Baseline Retrieval Method against the Explainable Matching Assistant using synthetic benchmark scenarios.

---

## 1. Experiment Setup

- **Benchmark Dataset**: 200 synthetic radiology studies grouped into 35 patient histories.
- **Evaluation Subset**: 50 designated query cases with ground-truth target prior annotations (`prior_study_ids`).
- **Environment**: Local standardized execution via `scripts/run_benchmark.py`.

---

## 2. Metrics & Key Performance Indicators (KPIs)

| Metric | Target Goal | Method of Measurement |
|---|---|---|
| **Median Time to Locate Relevant Prior** | **< 30 seconds** (vs ~90s baseline) | Simulated interaction timer based on rank position & candidate complexity |
| **Top-1 Relevance Accuracy** | **> 85%** | % of cases where true ground-truth prior is ranked #1 |
| **Top-3 Recall** | **> 95%** | % of cases where true ground-truth prior is in top 3 |
| **Mean Candidates Reviewed** | **< 1.3 candidates** | Sum of candidates evaluated before reaching true match |
| **Override Rate** | **< 10%** | % of cases where radiologist manually overrides rank #1 |
| **False-Match Rate** | **< 5%** | % of non-relevant priors receiving score > 0.70 |

---

## 3. Evaluation Benchmark Data Structure

Every test case evaluation record in `scripts/run_benchmark.py` produces:

```json
{
  "case_id": "CASE_104",
  "query_study_id": "ST1042",
  "patient_id_hash": "PAT_8921A",
  "correct_prior_id": "ST0811",
  "baseline_top1": "ST0900",
  "assistant_top1": "ST0811",
  "baseline_rank": 4,
  "assistant_rank": 1,
  "baseline_time_seconds": 78.5,
  "assistant_time_seconds": 18.2,
  "assistant_score": 0.91,
  "human_decision": "CONFIRMED",
  "error_category": null
}
```

---

## 4. Error Categories for Failure Analysis

When the assistant fails to rank the ground-truth prior at #1 (`assistant_rank > 1`), it is categorized into one of five standard error buckets:

1. **`TERMINOLOGY_UNHANDLED`**: Synonyms or acronyms absent from normalization dictionary.
2. **`TEMPORAL_DECAY_OVERPENALTY`**: Highly relevant prior penalized too heavily due to age (> 3 years).
3. **`CROSS_MODALITY_WEIGHT_LOW`**: CT vs MRI or CT vs X-Ray match score penalized excessively.
4. **`REPORT_CONTEXT_MISSING`**: Free-text report contained non-standard phrasing.
5. **`AMBIGUOUS_PATIENT_HISTORY`**: Multiple near-identical priors exist for the same condition.
