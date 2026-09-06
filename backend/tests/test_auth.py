from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_1_invalid_credentials_rejected():
    res = client.post("/api/auth/login", json={"username": "wronguser", "password": "WrongPassword"})
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid username or password."

def test_2_empty_login_fields_rejected():
    res = client.post("/api/auth/login", json={"username": "", "password": ""})
    assert res.status_code == 400

def test_3_valid_radiologist_login():
    res = client.post("/api/auth/login", json={"username": "radiologist", "password": "Demo@123"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["role"] == "Radiologist"
    assert data["display_name"] == "Dr. Demo"
    assert "token" in data

def test_4_valid_technician_login():
    res = client.post("/api/auth/login", json={"username": "technician", "password": "Demo@123"})
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "Technician"
    assert data["display_name"] == "Demo Technician"

def test_5_valid_admin_login():
    res = client.post("/api/auth/login", json={"username": "admin", "password": "Admin@123"})
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "Admin"
    assert data["display_name"] == "System Admin"

def test_6_technician_confirmation_rejected_by_backend():
    # RBAC TEST: Technician MUST be rejected when trying to confirm or override clinical decisions!
    payload = {
        "study_id": "ST1001",
        "recommended_prior_id": "ST0811",
        "human_decision": "CONFIRMED",
        "user_role": "Technician"
    }
    res = client.post("/api/feedback", json=payload)
    assert res.status_code == 403
    assert "Radiologist confirmation required" in res.json()["detail"]

def test_7_radiologist_confirm_recommendation_success():
    payload = {
        "study_id": "ST1001",
        "recommended_prior_id": "ST0811",
        "human_decision": "CONFIRMED",
        "user_role": "Radiologist"
    }
    res = client.post("/api/feedback", json=payload)
    assert res.status_code == 200
    assert res.json()["status"] == "success"

def test_8_radiologist_override_without_reason_rejected():
    payload = {
        "study_id": "ST1001",
        "recommended_prior_id": "ST0811",
        "human_decision": "OVERRIDDEN",
        "user_role": "Radiologist"
        # Missing override_reason!
    }
    res = client.post("/api/feedback", json=payload)
    assert res.status_code == 400
    assert "override_reason is strictly required" in res.json()["detail"]

def test_9_radiologist_override_with_reason_success():
    payload = {
        "study_id": "ST1001",
        "recommended_prior_id": "ST0811",
        "human_decision": "OVERRIDDEN",
        "override_reason": "Better comparison exists",
        "user_role": "Radiologist"
    }
    res = client.post("/api/feedback", json=payload)
    assert res.status_code == 200
    assert res.json()["status"] == "success"

def test_10_logout_and_audit_log_access():
    # Login radiologist
    login_res = client.post("/api/auth/login", json={"username": "radiologist", "password": "Demo@123"})
    token = login_res.json()["token"]

    # Access audit log
    audit_res = client.get("/api/audit-log")
    assert audit_res.status_code == 200
    assert len(audit_res.json()["entries"]) > 0

    # Logout
    logout_res = client.post("/api/auth/logout", json={"token": token})
    assert logout_res.status_code == 200
    assert logout_res.json()["status"] == "success"
