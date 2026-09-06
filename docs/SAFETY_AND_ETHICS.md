# Safety & Ethics Specification: Human-in-the-Loop Safeguards

This document defines the clinical safety boundaries, ethical design principles, HIPAA de-identification compliance, and human-in-the-loop requirements governing the Prior Study Matching Assistant.

---

## 1. Safety Constraint & Clinical Scope Boundary

> [!CAUTION]
> **STRICT SAFETY MANDATE**  
> The system **MUST NOT** make autonomous diagnostic, treatment, or clinical-management decisions. 
> 
> The system functions **ONLY** as an information retrieval and context-ranking decision support assistant.

### Prohibited Output Language:
- ❌ *"Patient has lung cancer."*
- ❌ *"The liver lesion is malignant."*
- ❌ *"Recommend biopsy or CT follow-up in 3 months."*
- ❌ *"Diagnostic prediction: Ischemic stroke."*

### Permitted Output Language:
- ✅ *"Suggested prior study based on anatomical and clinical metadata."*
- ✅ *"These studies appear comparable based on chest CT modality, pulmonary nodule concept, and 8-month interval."*
- ✅ *"Insufficient evidence to confidently rank this prior study."*

---

## 2. Human-in-the-Loop Protocol

Every prior study recommendation presented in the workstation UI must undergo explicit human review:

1. **Explicit Review State Machine**:
   - `RECOMMENDED`: Initial system state upon retrieval.
   - `REVIEWED`: Radiologist inspected candidate card & evidence rules.
   - `CONFIRMED`: Radiologist explicitly confirmed candidate as relevant comparison prior.
   - `OVERRIDDEN`: Radiologist selected a different prior or rejected recommendation.

2. **Mandatory Override Capturing**:
   - If a radiologist clicks "Override", the system **requires** selecting an override reason before state transition:
     - `Wrong anatomy`
     - `Wrong modality`
     - `Wrong condition`
     - `Too old`
     - `External study unavailable`
     - `Report context mismatch`
     - `Better comparison exists`
     - `Other` (with mandatory text field)

3. **Auditability**:
   - Every human action (Confirm / Override), user role (`Radiologist`), timestamp, recommendation snapshot, and override reason are saved to an immutable audit log.

---

## 3. HIPAA & Privacy De-identification Compliance

The prototype strictly enforces Safe Harbor de-identification principles:
- **Patient IDs**: Hashed strings (`PAT_8921A`), never real MRNs.
- **Dates**: Relative study dates (offset synthetic years), never real DOBs or admission dates.
- **Names / Contact**: Zero patient names, clinician names, addresses, or phone numbers.
- **Facility Names**: Synthetic institutional descriptors (`Main PACS`, `St. Jude Clinic`).
