import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.study import RadiologyStudy
from app.models.feedback import FeedbackSubmission
from app.services.matching_engine import ExplainableMatchingEngine
from app.services.database import db
from app.services.normalization import TerminologyNormalizer

client = TestClient(app)
engine = ExplainableMatchingEngine()

def test_feature_1_explainable_match_score():
    """Feature 1: 7 prototype weights (total 100) + rule details + positive & negative signals."""
    query = RadiologyStudy(
        study_id="TEST_F1_Q",
        patient_id_hash="PAT_F1",
        study_date="2026-08-01",
        modality="CT",
        body_region="Chest",
        anatomy="Lung",
        laterality="N/A",
        clinical_indication="Pulmonary nodule follow-up",
        condition_concept="Pulmonary Nodule",
        report_summary="7mm nodule RUL",
        report_concepts=["RUL nodule", "surveillance"],
        exam_type="CT Chest Without Contrast",
        contrast_used=False
    )
    candidate = RadiologyStudy(
        study_id="TEST_F1_C",
        patient_id_hash="PAT_F1",
        study_date="2025-08-01", # 1 year prior
        modality="CT",
        body_region="Chest",
        anatomy="Lung",
        laterality="N/A",
        clinical_indication="Pulmonary nodule",
        condition_concept="Pulmonary Nodule",
        report_summary="6.5mm nodule RUL",
        report_concepts=["RUL nodule", "surveillance"],
        exam_type="CT Chest Without Contrast",
        contrast_used=False
    )
    result = engine.score_candidate(query, candidate)
    breakdown = result["score_breakdown"]
    
    # 7 prototype dimensions
    assert "Anatomy" in breakdown
    assert "Modality" in breakdown
    assert "Condition" in breakdown
    assert "Report context" in breakdown
    assert "Recency" in breakdown
    assert "Laterality" in breakdown
    assert "Exam Type" in breakdown
    
    # Max scores sum to 100
    assert breakdown["Anatomy"] == 25.0
    assert breakdown["Modality"] == 20.0
    assert breakdown["Condition"] == 20.0
    assert breakdown["Report context"] == 20.0
    assert breakdown["Laterality"] == 3.0
    assert breakdown["Exam Type"] == 2.0
    assert 0.0 <= breakdown["Recency"] <= 10.0
    
    # Rule details for [WHY THIS SCORE?]
    rule_details = result["rule_details"]
    assert "Anatomy" in rule_details
    assert rule_details["Anatomy"]["max_points"] == 25.0
    assert rule_details["Anatomy"]["matched"] is True
    assert "rule" in rule_details["Anatomy"]

    # Positive evidence
    assert len(result["positive_signals"]) >= 3
    assert result["evidence_level"] == "STRONG"

def test_feature_2_baseline_vs_assistant_comparison():
    """Feature 2: Baseline vs Assistant comparison summary."""
    query = RadiologyStudy(
        study_id="TEST_F2_Q",
        patient_id_hash="PAT_F2",
        study_date="2026-08-01",
        modality="CT",
        body_region="Chest",
        clinical_indication="Pulmonary nodule follow-up",
        condition_concept="Pulmonary Nodule",
        report_summary="7mm nodule",
        report_concepts=["nodule"],
        exam_type="CT Chest"
    )
    # Prior 1: Recent CXR (Baseline would pick if only recency/modality mismatch)
    p1 = RadiologyStudy(
        study_id="TEST_F2_P1",
        patient_id_hash="PAT_F2",
        study_date="2026-07-01",
        modality="CT",
        body_region="Chest",
        clinical_indication="Trauma rib fracture",
        condition_concept="Fracture Follow-up",
        report_summary="Rib fracture",
        exam_type="CT Chest"
    )
    # Prior 2: Older CT with matching nodule
    p2 = RadiologyStudy(
        study_id="TEST_F2_P2",
        patient_id_hash="PAT_F2",
        study_date="2025-08-01",
        modality="CT",
        body_region="Chest",
        clinical_indication="Pulmonary nodule",
        condition_concept="Pulmonary Nodule",
        report_summary="7mm nodule",
        report_concepts=["nodule"],
        exam_type="CT Chest"
    )
    resp = engine.match_priors(query, [query, p1, p2])
    assert resp.comparison_summary is not None
    assert "rank_match" in resp.comparison_summary
    assert "rationale_difference" in resp.comparison_summary
    assert resp.baseline_top_recommendation is not None
    assert resp.recommendations[0].study_id == "TEST_F2_P2"

def test_feature_3_time_to_locate_timer():
    """Feature 3: Time-to-locate timer is captured and persisted."""
    payload = {
        "study_id": "ST-001",
        "recommended_prior_id": "ST-002",
        "selected_prior": "ST-002",
        "human_decision": "CONFIRMED",
        "user": "dr_smith",
        "user_role": "Radiologist",
        "duration_seconds": 16.4,
        "retrieval_method": "ASSISTANT"
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["duration_seconds"] == 16.4

def test_feature_4_human_confirm_and_override():
    """Feature 4: RBAC enforcement and mandatory override reasons."""
    # Technician cannot confirm
    tech_payload = {
        "study_id": "ST-001",
        "recommended_prior_id": "ST-002",
        "human_decision": "CONFIRMED",
        "user_role": "Technician"
    }
    r1 = client.post("/api/feedback", json=tech_payload)
    assert r1.status_code == 403

    # Radiologist override without reason rejected
    no_reason_payload = {
        "study_id": "ST-001",
        "recommended_prior_id": "ST-002",
        "human_decision": "OVERRIDDEN",
        "user_role": "Radiologist"
    }
    r2 = client.post("/api/feedback", json=no_reason_payload)
    assert r2.status_code == 400

    # Radiologist override with valid reason from the 8 allowed
    valid_payload = {
        "study_id": "ST-001",
        "recommended_prior_id": "ST-002",
        "selected_prior": "ST-003",
        "human_decision": "OVERRIDDEN",
        "override_reason": "Better comparison exists",
        "override_notes": "Prior ST-003 has higher resolution slice thickness",
        "user": "dr_smith",
        "user_role": "Radiologist",
        "duration_seconds": 23.5
    }
    r3 = client.post("/api/feedback", json=valid_payload)
    assert r3.status_code == 200

def test_feature_5_override_reason_analytics():
    """Feature 5: Aggregated override analytics and distribution across 8 reasons."""
    resp = client.get("/api/override-analytics")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_decisions" in data
    assert "override_rate_pct" in data
    assert "reason_distribution" in data
    assert "most_common_failure_reason" in data
    assert "recent_overrides" in data
    assert len(data["reason_distribution"]) == 8

def test_feature_6_audit_trail():
    """Feature 6: File-backed persistence and comprehensive filtering."""
    # Filter by action
    resp = client.get("/api/audit-log?action=DECISION_CONFIRMED")
    assert resp.status_code == 200
    entries = resp.json()["entries"]
    assert all("CONFIRMED" in e["action"].upper() or "CONFIRMED" in (e.get("human_decision") or "").upper() for e in entries)

    # Post custom audit event
    ev_resp = client.post("/api/audit-event", json={
        "action": "WHY_THIS_SCORE_VIEWED",
        "study_id": "ST-001",
        "user": "dr_smith",
        "role": "Radiologist",
        "duration_seconds": 5.0
    })
    assert ev_resp.status_code == 200

def test_feature_7_smart_terminology_normalization():
    """Feature 7: Smart terminology normalization across multi-centre variants."""
    # 1. External Centre "CT Thorax"
    mod, mod_mapped = TerminologyNormalizer.normalize_modality("CAT Scan")
    assert mod == "CT" and mod_mapped is True

    reg, reg_mapped = TerminologyNormalizer.normalize_body_region("CT Thorax")
    assert reg == "Chest" and reg_mapped is True

    # 2. Joint synonyms
    knee_reg, _ = TerminologyNormalizer.normalize_body_region("knee joint")
    assert knee_reg == "Knee"

    # 3. Explainable inspection records
    records = TerminologyNormalizer.get_normalization_records(
        raw_modality="CAT Scan",
        raw_region="CT Thorax",
        raw_indication="F/u RUL nodule"
    )
    assert len(records) >= 2
    assert any(r.normalized == "CT" for r in records)
    assert any(r.normalized == "Chest" for r in records)

def test_feature_8_low_evidence_and_no_prior_state():
    """Feature 8: Low-evidence (<60) and No-Prior state."""
    # No prior case
    no_prior_query = RadiologyStudy(
        study_id="TEST_F8_NONE_Q",
        patient_id_hash="PAT_F8_NONE",
        study_date="2026-08-01",
        modality="CT",
        body_region="Chest",
        clinical_indication="New patient",
        condition_concept="Chest Pain",
        report_summary="Clear",
        exam_type="CT Chest"
    )
    r_none = engine.match_priors(no_prior_query, [no_prior_query])
    assert r_none.no_prior_found is True
    assert r_none.evidence_level == "LIMITED"
    assert len(r_none.recommendations) == 0

    # Low evidence case (<60)
    low_ev_query = RadiologyStudy(
        study_id="TEST_F8_LOW_Q",
        patient_id_hash="PAT_F8_LOW",
        study_date="2026-08-01",
        modality="CT",
        body_region="Chest",
        clinical_indication="Pulmonary nodule",
        condition_concept="Pulmonary Nodule",
        report_summary="Nodule",
        exam_type="CT Chest"
    )
    unrelated_prior = RadiologyStudy(
        study_id="TEST_F8_LOW_P",
        patient_id_hash="PAT_F8_LOW",
        study_date="2022-01-01",
        modality="Ultrasound",
        body_region="Pelvis",
        clinical_indication="Pelvic exam",
        condition_concept="Pelvic Pain",
        report_summary="Normal",
        exam_type="US Pelvis"
    )
    r_low = engine.match_priors(low_ev_query, [low_ev_query, unrelated_prior])
    assert r_low.low_confidence_warning is True
    assert r_low.evidence_level == "LIMITED"
    assert r_low.recommendations[0].score < 60.0
