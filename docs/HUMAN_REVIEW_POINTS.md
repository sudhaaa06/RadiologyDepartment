# Human Review Points Specification

This document details the 6 explicit Human Review Points embedded in the operational workflow to guarantee human-in-the-loop safety.

---

## 📋 The 6 Human Review Points

| Review Point | Workflow Step | Radiologist Action & Interface Control | Safety & Governance Function |
|---|---|---|---|
| **REVIEW POINT 1** | **Current Study Verification** | Radiologist inspects incoming study ID, patient hash, modality, anatomy, indication, and urgency priority. | Confirms study context before initiating comparison retrieval. |
| **REVIEW POINT 2** | **Ranked Candidate Inspection** | Radiologist views candidate prior cards ordered by 0–100 match score. | Prevents blind selection by showing all viable candidate options. |
| **REVIEW POINT 3** | **Evidence & Signal Review** | Radiologist inspects score breakdown bar (`Anatomy +25`, `Modality +20`, etc.), positive signals (`✓`), and negative signals (`⚠`). | Provides complete transparency into why a prior study was ranked. |
| **REVIEW POINT 4** | **Confirmation / Override Choice** | Radiologist clicks `[ Confirm Comparison ]` or `[ Override Recommendation ]`. | Ensures explicit human authorization for every prior selection. |
| **REVIEW POINT 5** | **Override Reason Capture** | If overriding, radiologist selects a required reason (`Wrong anatomy`, `Wrong modality`, `Better comparison exists`, etc.) and notes. | Captures clinical rationale to audit model drift and failure modes. |
| **REVIEW POINT 6** | **Audit Trail Verification** | System records immutable audit event (`timestamp`, `user_id`, `role`, `action`, `reason`). | Provides full legal and clinical auditability for hospital governance. |
