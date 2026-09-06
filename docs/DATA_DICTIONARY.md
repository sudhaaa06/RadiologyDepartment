# Data Dictionary: Synthetic Radiology Metadata Schema

This document defines the schema for the synthetic radiology study metadata used by the Prior Study Matching Assistant.

---

## 📋 Field Definitions

| Field Name | Type | Required | Description | Example Values |
|---|---|---|---|---|
| `study_id` | String (UUID/Code) | Yes | Unique identifier for the study record | `"ST1001"`, `"ST0811"` |
| `patient_id_hash` | String (Hash) | Yes | Hashed identifier representing a patient across historical scans | `"PAT_8921A"`, `"PAT_4402B"` |
| `study_date` | String (ISO 8601) | Yes | Acquisition date of the imaging study | `"2025-11-14"`, `"2026-03-01"` |
| `department` | String | No (Missing allowed) | Hospital department ordering or performing the scan | `"Oncology"`, `"Emergency"`, `"Pulmonology"` |
| `source_centre` | String | Yes | Originating imaging facility or PACS archive | `"Main PACS"`, `"St. Jude Clinic"`, `"Metro Imaging"` |
| `modality` | String | Yes | Modality abbreviation (raw / unnormalized) | `"CT"`, `"CAT Scan"`, `"MRI"`, `"CXR"`, `"Ultrasound"` |
| `body_region` | String | Yes | Primary body region (raw / unnormalized) | `"Chest"`, `"CT thorax"`, `"Abdomen"`, `"Brain"`, `"Knee"` |
| `anatomy` | String | No | Specific anatomical sub-structure | `"Lung"`, `"Liver"`, `"Lumbar Spine"`, `"Right Knee"` |
| `laterality` | String | No | Anatomical laterality | `"Left"`, `"Right"`, `"Bilateral"`, `"N/A"` |
| `clinical_indication` | String | Yes | Reason for examination / clinical question | `"F/u lung nodule RUL"`, `"Acute stroke symptoms"` |
| `condition_concept` | String | Yes | Ground-truth or target clinical concept | `"Pulmonary Nodule"`, `"Stroke Follow-up"`, `"Liver Lesion"` |
| `report_summary` | String | Yes | Free-text report executive summary or impression | `"7mm subpleural RUL nodule stable from prior."` |
| `report_concepts` | Array[String] | Yes | Extracted clinical keywords/phrases from report | `["RUL nodule", "subpleural", "calcium score"]` |
| `exam_type` | String | Yes | Full exam description | `"CT Chest without Contrast"`, `"MRI Brain W/WO"` |
| `contrast_used` | Boolean / Null | No | Whether IV/oral contrast was administered | `true`, `false`, `null` |
| `comparison_available` | Boolean | Yes | Flag indicating if historical scans exist in archive | `true`, `false` |
| `prior_study_ids` | Array[String] | Yes | Ground-truth relevant prior study IDs for validation | `["ST0811"]` |
| `is_clinically_relevant_prior` | Boolean | Internal | Evaluation flag indicating if study is a valid target prior | `true`, `false` |

---

## ⚠️ Intentionally Introduced Data Imperfections

To simulate real-world healthcare PACS environments, the dataset generator injects:
1. **Terminology Variations**: `"CT Chest"`, `"Chest CT"`, `"CT thorax"`, `"CXR"`.
2. **Abbreviated Clinical Indications**: `"F/u pulmonary nodule"`, `"RUL lesion"`, `"S/p fall"`.
3. **Missing Fields**: Optional fields (`contrast_used`, `anatomy`, `department`) set to `null`.
4. **External Center Variations**: Naming differences in `source_centre` causing non-standard exam type strings.
5. **Decay / Temporal Spread**: Prior study dates ranging from 1 month to 5 years prior.
