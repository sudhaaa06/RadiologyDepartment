from app.models.study import RadiologyStudy
from app.services.matching_engine import ExplainableMatchingEngine

engine = ExplainableMatchingEngine()

def test_edge_case_1_same_anatomy_different_condition():
    query = RadiologyStudy(
        study_id="ST_EC1_Q",
        patient_id_hash="PAT_EC1",
        study_date="2026-03-01",
        modality="CT",
        body_region="Chest",
        anatomy="Lung",
        clinical_indication="Pulmonary nodule follow-up",
        condition_concept="Pulmonary Nodule",
        report_summary="7mm nodule RUL",
        report_concepts=["RUL nodule"],
        exam_type="CT Chest"
    )

    prior_diff_cond = RadiologyStudy(
        study_id="ST_EC1_P",
        patient_id_hash="PAT_EC1",
        study_date="2025-10-01",
        modality="CT",
        body_region="Chest",
        anatomy="Lung",
        clinical_indication="Rib fracture follow-up",
        condition_concept="Rib Fracture",
        report_summary="Healing 5th rib fracture",
        report_concepts=["rib fracture"],
        exam_type="CT Chest"
    )

    resp = engine.match_priors(query, [query, prior_diff_cond])
    assert len(resp.recommendations) == 1
    # Condition mismatch penalty
    assert any("Condition concept mismatch" in ev for ev in resp.recommendations[0].evidence)

def test_edge_case_2_same_condition_different_modality():
    query = RadiologyStudy(
        study_id="ST_EC2_Q",
        patient_id_hash="PAT_EC2",
        study_date="2026-03-01",
        modality="CT",
        body_region="Chest",
        anatomy="Lung",
        clinical_indication="Pulmonary nodule follow-up",
        condition_concept="Pulmonary Nodule",
        report_summary="7mm nodule RUL",
        report_concepts=["RUL nodule"],
        exam_type="CT Chest"
    )

    prior_cxr = RadiologyStudy(
        study_id="ST_EC2_P",
        patient_id_hash="PAT_EC2",
        study_date="2025-10-01",
        modality="CXR",  # Modality is CXR (X-Ray)
        body_region="Chest",
        anatomy="Lung",
        clinical_indication="Pulmonary nodule surveillance",
        condition_concept="Pulmonary Nodule",
        report_summary="Faint opacity right upper zone",
        report_concepts=["RUL nodule"],
        exam_type="Chest X-Ray"
    )

    resp = engine.match_priors(query, [query, prior_cxr])
    assert len(resp.recommendations) == 1
    assert any("Clinically comparable cross-modality" in ev for ev in resp.recommendations[0].evidence)

def test_edge_case_3_multiple_similar_priors_different_dates():
    query = RadiologyStudy(
        study_id="ST_EC3_Q",
        patient_id_hash="PAT_EC3",
        study_date="2026-03-01",
        modality="CT",
        body_region="Chest",
        anatomy="Lung",
        clinical_indication="Pulmonary nodule",
        condition_concept="Pulmonary Nodule",
        report_summary="7mm nodule",
        report_concepts=["nodule"],
        exam_type="CT Chest"
    )

    prior_recent = RadiologyStudy(
        study_id="ST_EC3_P1",
        patient_id_hash="PAT_EC3",
        study_date="2025-08-01",  # 7 months prior
        modality="CT",
        body_region="Chest",
        anatomy="Lung",
        clinical_indication="Pulmonary nodule",
        condition_concept="Pulmonary Nodule",
        report_summary="7mm nodule",
        report_concepts=["nodule"],
        exam_type="CT Chest"
    )

    prior_old = RadiologyStudy(
        study_id="ST_EC3_P2",
        patient_id_hash="PAT_EC3",
        study_date="2023-01-01",  # > 3 years prior
        modality="CT",
        body_region="Chest",
        anatomy="Lung",
        clinical_indication="Pulmonary nodule",
        condition_concept="Pulmonary Nodule",
        report_summary="6mm nodule",
        report_concepts=["nodule"],
        exam_type="CT Chest"
    )

    resp = engine.match_priors(query, [query, prior_recent, prior_old])
    assert resp.recommendations[0].study_id == "ST_EC3_P1"
    assert resp.recommendations[0].score > resp.recommendations[1].score

def test_edge_case_low_confidence_fallback():
    query = RadiologyStudy(
        study_id="ST_EC4_Q",
        patient_id_hash="PAT_EC4",
        study_date="2026-03-01",
        modality="Ultrasound",
        body_region="Thyroid",
        clinical_indication="Thyroid nodule",
        condition_concept="Thyroid Nodule",
        report_summary="1cm thyroid cyst",
        exam_type="US Thyroid"
    )

    unrelated_prior = RadiologyStudy(
        study_id="ST_EC4_P",
        patient_id_hash="PAT_EC4",
        study_date="2022-01-01",
        modality="X-Ray",
        body_region="Knee",
        clinical_indication="Knee pain",
        condition_concept="Knee Osteoarthritis",
        report_summary="Joint space narrowing",
        exam_type="X-Ray Knee"
    )

    resp = engine.match_priors(query, [query, unrelated_prior])
    assert resp.low_confidence_warning is True
    assert "Limited retrieval evidence" in resp.warning_message or "No strongly comparable" in resp.warning_message


def test_edge_case_missing_anatomy():
    query = RadiologyStudy(
        study_id="ST_EC5_Q",
        patient_id_hash="PAT_EC5",
        study_date="2026-03-01",
        modality="CT",
        body_region="", # Missing body region / anatomy
        anatomy=None,
        clinical_indication="Abdominal pain",
        condition_concept="Liver Lesion",
        report_summary="Hepatic lesion",
        exam_type="CT Abdomen"
    )
    prior = RadiologyStudy(
        study_id="ST_EC5_P",
        patient_id_hash="PAT_EC5",
        study_date="2025-09-01",
        modality="CT",
        body_region="Abdomen",
        anatomy="Liver",
        clinical_indication="Liver mass",
        condition_concept="Liver Lesion",
        report_summary="Hepatic lesion",
        exam_type="CT Abdomen"
    )
    resp = engine.match_priors(query, [query, prior])
    # Engine uses exam_type fallback to infer Abdomen
    assert len(resp.recommendations) == 1
    assert any("Matching body region: Abdomen" in ev for ev in resp.recommendations[0].evidence)

def test_edge_case_external_centre_naming_variation():
    query = RadiologyStudy(
        study_id="ST_EC6_Q",
        patient_id_hash="PAT_EC6",
        study_date="2026-03-01",
        modality="CAT Scan", # External naming
        body_region="CT thorax", # External naming
        clinical_indication="F/u nodule",
        condition_concept="Pulmonary Nodule",
        report_summary="RUL nodule",
        report_concepts=["RUL nodule"],
        exam_type="Computed Tomography Chest"
    )
    prior = RadiologyStudy(
        study_id="ST_EC6_P",
        patient_id_hash="PAT_EC6",
        study_date="2025-06-01",
        modality="CT",
        body_region="Chest",
        clinical_indication="Pulmonary nodule",
        condition_concept="Pulmonary Nodule",
        report_summary="RUL nodule",
        report_concepts=["RUL nodule"],
        exam_type="CT Chest"
    )
    resp = engine.match_priors(query, [query, prior])
    assert len(resp.recommendations) == 1
    assert resp.recommendations[0].score >= 80.0
    assert any("Matching modality: CT" in ev for ev in resp.recommendations[0].evidence)



def test_edge_case_laterality_mismatch():
    query = RadiologyStudy(
        study_id="ST_EC7_Q",
        patient_id_hash="PAT_EC7",
        study_date="2026-03-01",
        modality="MRI",
        body_region="Knee",
        anatomy="Knee Joint",
        laterality="Right",
        clinical_indication="Right knee pain post fall",
        condition_concept="Fracture Follow-up",
        report_summary="Tibial plateau fracture",
        exam_type="MRI Knee Right"
    )
    prior_left = RadiologyStudy(
        study_id="ST_EC7_P",
        patient_id_hash="PAT_EC7",
        study_date="2025-05-01",
        modality="MRI",
        body_region="Knee",
        anatomy="Knee Joint",
        laterality="Left", # Conflict! Left vs Right
        clinical_indication="Left knee tear",
        condition_concept="Fracture Follow-up",
        report_summary="Meniscal tear",
        exam_type="MRI Knee Left"
    )
    resp = engine.match_priors(query, [query, prior_left])
    assert len(resp.recommendations) == 1
    assert any("Laterality conflict" in ev for ev in resp.recommendations[0].evidence)

def test_edge_case_very_old_prior():
    query = RadiologyStudy(
        study_id="ST_EC8_Q",
        patient_id_hash="PAT_EC8",
        study_date="2026-03-01",
        modality="CT",
        body_region="Chest",
        clinical_indication="Pulmonary nodule",
        condition_concept="Pulmonary Nodule",
        report_summary="Nodule",
        exam_type="CT Chest"
    )
    prior_old = RadiologyStudy(
        study_id="ST_EC8_P",
        patient_id_hash="PAT_EC8",
        study_date="2018-01-01", # > 8 years old
        modality="CT",
        body_region="Chest",
        clinical_indication="Pulmonary nodule",
        condition_concept="Pulmonary Nodule",
        report_summary="Nodule",
        exam_type="CT Chest"
    )
    resp = engine.match_priors(query, [query, prior_old])
    assert len(resp.recommendations) == 1
    # Recency decay should lower the score heavily
    assert resp.recommendations[0].score < 90.0


def test_edge_case_no_prior_study_available():
    query = RadiologyStudy(
        study_id="ST_EC9_Q",
        patient_id_hash="PAT_EC9_NEW",
        study_date="2026-03-01",
        modality="CT",
        body_region="Chest",
        clinical_indication="New patient chest pain",
        condition_concept="Chest Pain",
        report_summary="Clear chest",
        exam_type="CT Chest"
    )
    resp = engine.match_priors(query, [query]) # No priors in pool for this patient
    assert len(resp.recommendations) == 0
    assert resp.low_confidence_warning is True
    assert resp.no_prior_found is True
    assert "No historical prior studies available" in resp.warning_message

def test_edge_case_10_contrast_protocol_mismatch():
    query = RadiologyStudy(
        study_id="ST_EC10_Q",
        patient_id_hash="PAT_EC10",
        study_date="2026-03-01",
        modality="CT",
        body_region="Abdomen",
        anatomy="Liver",
        clinical_indication="Hepatic mass characterization triple phase",
        condition_concept="Liver Lesion",
        report_summary="Arterial enhancing liver lesion",
        exam_type="CT Abdomen With Contrast",
        contrast_used=True
    )
    prior_non_contrast = RadiologyStudy(
        study_id="ST_EC10_P",
        patient_id_hash="PAT_EC10",
        study_date="2025-06-01",
        modality="CT",
        body_region="Abdomen",
        anatomy="Liver",
        clinical_indication="Abdominal pain workup",
        condition_concept="Liver Lesion",
        report_summary="Non-contrast scan, lesion poorly visualized",
        exam_type="CT Abdomen Without Contrast",
        contrast_used=False
    )
    resp = engine.match_priors(query, [query, prior_non_contrast])
    assert len(resp.recommendations) == 1
    rec = resp.recommendations[0]
    # Check that negative signal for contrast protocol mismatch is present
    has_contrast_signal = any("Contrast protocol mismatch" in sig for sig in rec.negative_signals)
    print(f"Edge Case 10 - Expected: Contrast mismatch flagged | Actual: {has_contrast_signal} | PASS")
    assert has_contrast_signal


