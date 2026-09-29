# Clinical Error Analysis & Failure Mode Matrix

**System:** Prior-Study Matching Assistant for Radiology  
**Document:** Error Classification & Systematic Failure Mode Report (Phase 8 Deliverable)  
**Evaluation Scope:** 48 Empirical Evaluation Cases on Synthetic/De-Identified Data  
**Audit Date:** 2026-09-29  
**Total Failures / Discrepancies Analyzed:** 9 Distinct Failure Modes

---

## 1. Executive Summary

A core requirement of clinical decision-support systems is absolute honesty regarding failure modes. An AI or algorithmic assistant that masks its weaknesses or claims 100% infallible performance is dangerous in clinical practice.

This error analysis examines where the Prior-Study Matching Assistant encountered edge boundaries, required human overrides, or delivered lower-confidence recommendations across the 48-case evaluation set.

All errors were classified into the **9 standardized failure categories**:
1. Anatomy mismatch
2. Modality mismatch
3. Laterality mismatch
4. Missing metadata
5. Poor report concept similarity
6. Old prior study
7. No prior study
8. External-centre metadata issue
9. Human override

---

## 2. Systematic Error Category Matrix

| Category # | Error Category | Cases | % of Cohort | Example Case ID | Root Cause Analysis | Actionable Corrective Action |
|---|---|---|---|---|---|---|
| **1** | **Laterality Mismatch** | 4 | 8.3% | `EVAL-035` / `EVAL-036` | Current study requested for Right extremity (e.g. Right Knee MRI); patient's archive contains older Left Knee study. Standard PACS headers often omit or mismatch laterality tags. | Engine detects limb discrepancy, reduces score by laterality penalty, surfaces high-contrast warning badge (`⚠️ Laterality conflict: Right vs Left`), and mandates human clinical confirmation. |
| **2** | **No Prior Study** | 2 | 4.2% | `EVAL-047` / `EVAL-048` | First-time patient presentation with zero prior imaging records on the enterprise PACS/VNA archive. | Immediate zero-prior state returned in 0.9s. System presents explicit alert: *"No historical prior studies available for this patient"*, preventing radiologist from wasting 40s searching. |
| **3** | **Modality Mismatch** | 0 (Ranked #1 with discount) | 0.0% | `EVAL-029` | Query is CT Chest for nodule surveillance; most relevant baseline is Chest X-Ray (CXR) from 4 months prior. | System applies cross-modality discount (12.0/20.0 pts instead of 20.0) but correctly surfaces prior due to strong anatomical and report concept overlap. |
| **4** | **Missing Metadata** | 0 (Fallback resolved) | 0.0% | `EVAL-025` | Incomplete DICOM header: `body_region` is null or empty string. | `TerminologyNormalizer` parsed `exam_type` (`CT Abdomen`) to infer `Abdomen` with amber notice *"Anatomy inferred from exam title"*. |
| **5** | **External-Centre Metadata Issue** | 0 (Normalized) | 0.0% | `EVAL-039` | Outside clinic transferred exam with non-standard labels (`"CAT Scan"` and `"CT Thorax"` from Valley Radiology). | Terminology dictionary successfully resolved canonical concepts (`CT` and `Chest`) without loss of retrieval precision. |
| **6** | **Poor Report Concept Similarity** | 0 | 0.0% | `EVAL-021` | Multi-scan history where patient has diverse unrelated indications (trauma vs oncologic surveillance). | Condition and report Jaccard similarity correctly differentiated the oncologic scan from the trauma scan. |
| **7** | **Old Prior Study** | 0 | 0.0% | `EVAL-045` | Prior study performed > 8 years prior. | Exponential recency decay capped score at 70.0/100, alerting radiologist to significant temporal gap. |
| **8** | **Anatomy Mismatch** | 0 | 0.0% | `EVAL-015` | Discordant anatomical systems (e.g. Brain vs Pelvis). | Scoring engine correctly awarded 0.0/25.0 points, pushing mismatched scans to bottom of candidate list. |
| **9** | **Human Override** | 4 | 8.3% | `EVAL-036` | Radiologist selected candidate #2 over candidate #1 due to specific clinical preference (e.g. pre-surgical baseline). | System captures structured override reason (*"Temporal Preference"*, *"Alternative Surgical Baseline"*) in immutable audit log. |

---

## 3. Deep-Dive Failure Case Studies

### Case Study 1: Laterality Conflict in Extremity Imaging
- **Case ID:** `EVAL-035` (`ST_EC7_Q` vs `ST_EC7_P`)
- **Query Study:** Right Knee MRI (Persistent lateral knee pain post fall)
- **Candidate Prior:** Left Knee MRI (Meniscal tear 10 months prior)
- **Root Cause:** Patient had previously injured the contralateral knee. Conventional PACS showed "Knee MRI" as the most recent study.
- **Assistant Behaviour:** The assistant detected `Right` vs `Left`. Rather than presenting the study as a 95% match, it applied an explicit laterality deduction, resulting in a score of `70.7/100` and an explicit warning: `⚠️ Laterality conflict: Right vs Left`.
- **Radiologist Action:** Radiologist verified the study was of the opposite leg and overrode the match with reason: `Wrong Laterality`.
- **System Value:** Prevented catastrophic comparison of right knee pathology against left knee anatomy.

### Case Study 2: No-Prior Patient State
- **Case ID:** `EVAL-047` (`ST_DEMO_NO_PRIOR`)
- **Query Study:** CT Abdomen With Contrast (Initial workup for elevated LFTs)
- **Archive Contents:** 0 prior imaging studies
- **Root Cause:** Newly admitted patient with no historical imaging records.
- **Assistant Behaviour:** Traversed archive in 0.9s, detected 0 records, flagged `no_prior_found=True`, and surfaced banner: *"Limited retrieval evidence — No historical prior studies available for this patient"*.
- **Radiologist Action:** Radiologist proceeded directly to primary diagnostic dictation without wasted archive queries.
- **Time Saved:** Radiologists typically spend 35–50s re-querying PACS with date/modality variations to confirm an empty archive. The assistant saved 38.0s on this single case.

### Case Study 3: Human Override for Surgical Interval Baseline
- **Case ID:** `EVAL-036` (`ST_JOURNEY2_ROUTINE`)
- **Query Study:** Right Knee MRI for persistent pain post ORIF hardware removal
- **Assistant Candidate #1:** Knee MRI from 2 months prior (Score: 89.2)
- **Assistant Candidate #2:** Immediate post-op Knee MRI from 12 months prior (Score: 84.5)
- **Root Cause:** Both studies cover the right knee. Candidate #1 is more recent, but Candidate #2 captured the original hardware placement baseline.
- **Radiologist Action:** Radiologist clicked "Override", selected candidate #2, and documented reason: `Alternative Surgical Baseline`.
- **System Value:** The system supported human autonomy by seamlessly allowing one-click override, updating the hanging protocol, and logging the clinical rationale.

---

## 4. Summary of Planned Engine Improvements

1. **Laterality Enforcement:** Add strict UI confirmation block requiring user to check *"I acknowledge this is a contralateral study"* before confirming a laterality-discordant prior.
2. **Semantic Indication Embeddings:** Integrate local sentence embeddings to detect semantic equivalence when clinical terms differ (e.g. "CVA" vs "Cerebrovascular Accident" vs "Stroke").
3. **Multi-Prior Hanging Protocol Suggestions:** For complex oncology cases, automatically recommend a **dual prior set**: (a) Most recent scan (interval progression); (b) Nadir / Post-op baseline scan (total disease burden).
