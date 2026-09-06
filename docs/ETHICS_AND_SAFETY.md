# Ethics & Safety Policy: Clinical Boundaries & Risk Mitigation

This document details the clinical scope boundaries, safety controls, risk analysis, and HIPAA compliance policy for the Prior Study Matching Assistant.

---

## 1. Tenet Safety Rules & Scope Boundaries

> [!CAUTION]
> **MANDATORY SAFETY RULES**
> 1. **Retrieval-Only Scope**: The system function is strictly retrieval decision support.
> 2. **No Autonomous Diagnosis**: The system NEVER predicts disease, malignancy, or pathology.
> 3. **No Autonomous Treatment**: The system NEVER recommends medications, surgeries, or clinical management.
> 4. **Human Review Mandatory**: Prior study matching is advisory; radiologist confirmation or override is required for every recommendation.
> 5. **Transparent Evidence**: Every score is accompanied by transparent positive (✓) and negative (⚠) signals.
> 6. **Captured Overrides**: Radiologist overrides mandate selecting a reason to capture failure modes.
> 7. **De-Identified Data**: 100% synthetic/de-identified metadata (hashed patient IDs, relative dates).
> 8. **No PHI/PII in Logs**: Zero patient names, DOBs, MRNs, or addresses stored in audit logs.
> 9. **Prototype Status**: The system is a research prototype and is NOT clinically validated for production diagnostic use.
> 10. **Clinical Governance Required**: Production deployment requires institutional IRB, HIPAA compliance audit, and clinical governance approval.

---

## 2. Clinical Risk Analysis & Mitigation Matrix

| Potential Clinical Risk | Severity | Risk Mechanism | Automated Mitigation Strategy |
|---|---|---|---|
| **Automation Bias** | High | Radiologist blindly accepts top-ranked prior without inspecting images | System displays explicit score breakdown, positive/negative signals, and requires confirmation modal. |
| **Incorrect Prior Match** | Medium | Terminology variation causes mismatched prior to receive high score | Terminology Normalizer maps synonyms. Overrides log reason to tune weights. |
| **Overlooked Prior** | Medium | Relevant prior hidden due to heavy recency decay | Engine ranks by clinical relevance over recency and displays relevance explanation tag. |
| **Missing Metadata Failure** | Low | Incomplete DICOM tags lead to poor match score | Safe fallback triggers banner: *"Limited retrieval evidence - No strongly comparable prior identified"*. |
