# Comprehensive Automated Test Results Report

This report documents the automated test suite execution results for the Prior Study Matching Assistant.

---

## 🧪 Pytest Execution Summary

**Execution Command**: `pytest backend/tests -v`  
**Total Tests Executed**: 33  
**Tests Passed**: 33  
**Tests Failed**: 0  
**Execution Duration**: 0.95 seconds  

---

## 📋 Detailed Test Case Log

| Test Module | Test Name | Result | Feature Verified |
|---|---|---|---|
| `test_auth.py` | `test_1_invalid_credentials_rejected` | **PASSED** | 401 Unauthorized on wrong password |
| `test_auth.py` | `test_2_empty_login_fields_rejected` | **PASSED** | 400 Bad Request on empty credentials |
| `test_auth.py` | `test_3_valid_radiologist_login` | **PASSED** | Radiologist role authentication & token generation |
| `test_auth.py` | `test_4_valid_technician_login` | **PASSED** | Technician role authentication |
| `test_auth.py` | `test_5_valid_admin_login` | **PASSED** | Admin role authentication |
| `test_auth.py` | `test_6_technician_confirmation_rejected_by_backend` | **PASSED** | RBAC 403 Forbidden enforcement for Technician |
| `test_auth.py` | `test_7_radiologist_confirm_recommendation_success` | **PASSED** | Radiologist comparison confirmation |
| `test_auth.py` | `test_8_radiologist_override_without_reason_rejected` | **PASSED** | Mandatory override_reason validation (400 Bad Request) |
| `test_auth.py` | `test_9_radiologist_override_with_reason_success` | **PASSED** | Radiologist override with reason |
| `test_auth.py` | `test_10_logout_and_audit_log_access` | **PASSED** | Session invalidation and audit log query |
| `test_journeys.py` | `test_journey_1_stat_brain` | **PASSED** | Journey 1 STAT CT Brain timeline & #1 ranking |
| `test_journeys.py` | `test_journey_2_routine_knee` | **PASSED** | Journey 2 ROUTINE MRI Knee override flow |
| `test_edge_cases.py`| `test_edge_case_1_same_anatomy_different_condition` | **PASSED** | Condition mismatch penalty |
| `test_edge_cases.py`| `test_edge_case_2_same_condition_different_modality` | **PASSED** | Cross-modality comparability |
| `test_edge_cases.py`| `test_edge_case_3_multiple_similar_priors_different_dates` | **PASSED** | Date recency decay differentiation |
| `test_edge_cases.py`| `test_edge_case_low_confidence_fallback` | **PASSED** | Safe fallback warning (*"Limited retrieval evidence"*) |
| `test_edge_cases.py`| `test_edge_case_missing_anatomy` | **PASSED** | Missing anatomy exam_type fallback |
| `test_edge_cases.py`| `test_edge_case_external_centre_naming_variation` | **PASSED** | External centre terminology normalization |
| `test_edge_cases.py`| `test_edge_case_laterality_mismatch` | **PASSED** | Laterality conflict detection |
| `test_edge_cases.py`| `test_edge_case_very_old_prior` | **PASSED** | Heavy recency decay penalty |
| `test_edge_case.py` | `test_edge_case_no_prior_study_available` | **PASSED** | Empty prior pool handling |
| `test_normalization.py` | `test_modality_normalization` | **PASSED** | Modality terminology normalization |
| `test_normalization.py` | `test_body_region_normalization` | **PASSED** | Body region terminology normalization |
| `test_normalization.py` | `test_condition_normalization` | **PASSED** | Condition terminology normalization |
| `test_baseline.py` | `test_baseline_retrieval` | **PASSED** | Baseline deterministic retrieval logic |
| `test_matching.py` | `test_explainable_matching` | **PASSED** | Explainable scoring engine |
| `test_api.py` | `test_api_health` | **PASSED** | Health check endpoint |
| `test_api.py` | `test_api_studies` | **PASSED** | List studies endpoint |
| `test_api.py` | `test_api_match` | **PASSED** | Matching endpoint |
| `test_api.py` | `test_api_feedback_confirm` | **PASSED** | Confirmation feedback endpoint |
| `test_api.py` | `test_api_feedback_override_validation` | **PASSED** | Override feedback validation endpoint |
| `test_api.py` | `test_api_audit_log` | **PASSED** | Audit log retrieval endpoint |
| `test_api.py` | `test_api_metrics` | **PASSED** | Pilot evaluation metrics endpoint |
