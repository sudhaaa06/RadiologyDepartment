import sys
from pathlib import Path
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app

client = TestClient(app)

def test_telemetry_event_and_summary():
    # 1. Record workflow_started
    res = client.post("/api/telemetry/event", json={
        "task_id": "TEST-TASK-001",
        "session_id": "SESS-001",
        "case_id_hash": "PAT_HASH_99",
        "workflow_type": "assistant",
        "event_type": "workflow_started"
    })
    assert res.status_code == 200
    assert res.json()["status"] == "success"

    # 2. Record candidate_displayed
    res = client.post("/api/telemetry/event", json={
        "task_id": "TEST-TASK-001",
        "session_id": "SESS-001",
        "case_id_hash": "PAT_HASH_99",
        "workflow_type": "assistant",
        "event_type": "candidate_displayed"
    })
    assert res.status_code == 200

    # 3. Record workflow_completed
    res = client.post("/api/telemetry/event", json={
        "task_id": "TEST-TASK-001",
        "session_id": "SESS-001",
        "case_id_hash": "PAT_HASH_99",
        "workflow_type": "assistant",
        "event_type": "workflow_completed",
        "selected_prior_study": "ST-PRIOR-01"
    })
    assert res.status_code == 200

    # 4. Check summary
    res_summary = client.get("/api/telemetry/summary")
    assert res_summary.status_code == 200
    data = res_summary.json()
    assert "total_tasks" in data
    assert data["total_tasks"] >= 1

def test_experiment_cases_and_results_endpoints():
    # 1. Check cases
    res_cases = client.get("/api/experiment/cases")
    assert res_cases.status_code == 200
    cases = res_cases.json()
    assert len(cases) >= 30

    # 2. Check results
    res_results = client.get("/api/experiment/results")
    assert res_results.status_code == 200
    results = res_results.json()
    assert results.get("status") in ("COMPLETED", "PENDING")
    if results.get("status") == "COMPLETED":
        assert "executive_kpis" in results
        assert "performance_statistics" in results
        assert "error_analysis_matrix" in results
