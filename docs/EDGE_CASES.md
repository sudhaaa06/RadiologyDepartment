# Edge Cases & Degradation Matrix

This document cataloging how the Prior Study Matching Assistant handles edge cases, data anomalies, and degraded states.

---

## 📋 Edge Case Matrix

| ID | Scenario Description | System Expected Behavior & Degradation Strategy | Test Implementation |
|---|---|---|---|
| **EC-01** | Same anatomy, different clinically relevant condition (e.g. Chest CT for Trauma vs Chest CT for Nodule) | Condition & Report context scores drop ($S_c=0$, $S_r<0.2$). Overall score drops. System displays clear evidence breakdown showing condition mismatch. | `test_edge_case_same_anatomy_diff_condition` |
| **EC-02** | Same condition, different modality (e.g., Pulmonary nodule on Chest X-Ray vs CT Chest) | Modality score drops to $0.6$ (cross-modality comparable). If no CT exists, CXR ranks as top available prior with cross-modality warning tag. | `test_edge_case_same_condition_diff_modality` |
| **EC-03** | Multiple highly similar prior studies with different acquisition dates (e.g., CT Chest 6 months ago vs 2 years ago vs 4 years ago) | Recency score ($S_t$) differentiates candidates. 6-month prior receives highest rank ($0.91$), followed by 2-year prior ($0.74$). Both show date deltas. | `test_edge_case_multiple_similar_priors_different_dates` |
| **EC-04** | Missing anatomy or body region in DICOM metadata | System triggers Terminology Normalizer on `exam_type` and `clinical_indication` to infer anatomy. If unresolvable, anatomy score = $0.0$, triggers low-confidence warning: *"Insufficient evidence to confidently rank."* | `test_edge_case_missing_anatomy` |
| **EC-05** | External-centre terminology mismatch (e.g. `"CT thorax"` or `"CAT Scan"`) | Terminology Normalization Layer maps `"CT thorax"` $\rightarrow$ `Chest` and `"CAT Scan"` $\rightarrow$ `CT` seamlessly before scoring. | `test_edge_case_external_centre_terminology` |
| **EC-06** | Laterality mismatch (e.g. Right Knee MRI vs Left Knee MRI) | Laterality sub-score drops to $0.0$. Evidence explicitly alerts: *"⚠️ Laterality conflict: Right vs Left"*. | `test_edge_case_laterality_mismatch` |
| **EC-07** | Very old prior study (> 5 years ago) | Recency score decays heavily ($S_t < 0.1$). Included only if no recent prior exists, with warning badge *"Prior study > 5 years old"*. | `test_edge_case_very_old_prior` |
| **EC-08** | Duplicate metadata (Two scans with identical metadata & same date) | System deduplicates candidates based on `study_id` and flags duplicate scan entry. | `test_edge_case_duplicate_metadata` |
| **EC-09** | No prior studies available for patient | System returns empty candidate list with status: *"No historical prior studies found for patient."* | `test_edge_case_no_priors_available` |
| **EC-10** | Contradictory report context (e.g., Report states "No pulmonary nodules seen") | Jaccard concept overlap fails to match positive nodule terms. Score remains low. | `test_edge_case_contradictory_report` |
| **EC-11** | Low composite confidence score (< 0.35) across all candidates | System presents candidate list marked with amber low-confidence warning banner: *"Insufficient evidence to confidently rank this prior study."* | `test_edge_case_low_confidence_fallback` |
