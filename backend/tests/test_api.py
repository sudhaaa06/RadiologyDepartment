from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_api_studies():
    res = client.get("/api/studies")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_api_match():
    query_payload = {
        "study_id": "ST_TEST_101",
        "patient_id_hash": "PAT_TEST_01",
        "study_date": "2026-03-01",
        "department": "Oncology",
        "source_centre": "Main PACS",
        "modality": "CT thorax",
        "body_region": "Chest",
        "anatomy": "Lung",
        "clinical_indication": "F/u pulmonary nodule",
        "condition_concept": "Pulmonary Nodule",
        "report_summary": "7mm RUL nodule",
        "report_concepts": ["RUL nodule"],
        "exam_type": "CT Chest"
    }

    res = client.post("/api/match", json=query_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["current_study_id"] == "ST_TEST_101"

def test_api_feedback_confirm():
    payload = {
        "study_id": "ST_TEST_101",
        "recommended_prior_id": "ST_TEST_99",
        "human_decision": "CONFIRMED",
        "user_role": "Radiologist"
    }

    res = client.post("/api/feedback", json=payload)
    assert res.status_code == 200
    assert res.json()["status"] == "success"

def test_api_feedback_override_validation():
    # Should FAIL if override_reason is missing when decision is OVERRIDDEN
    payload_bad = {
        "study_id": "ST_TEST_101",
        "recommended_prior_id": "ST_TEST_99",
        "human_decision": "OVERRIDDEN"
    }
    res_bad = client.post("/api/feedback", json=payload_bad)
    assert res_bad.status_code == 400

    # Should SUCCEED when override_reason is provided
    payload_good = {
        "study_id": "ST_TEST_101",
        "recommended_prior_id": "ST_TEST_99",
        "human_decision": "OVERRIDDEN",
        "override_reason": "Wrong condition",
        "user_role": "Radiologist"
    }
    res_good = client.post("/api/feedback", json=payload_good)
    assert res_good.status_code == 200
    assert res_good.json()["status"] == "success"

def test_api_audit_log():
    res = client.get("/api/audit-log")
    assert res.status_code == 200
    assert "entries" in res.json()

def test_api_metrics():
    res = client.get("/api/metrics")
    assert res.status_code == 200
    assert "proposed_matching_assistant" in res.json()
