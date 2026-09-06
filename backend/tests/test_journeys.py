from app.models.study import RadiologyStudy
from app.services.matching_engine import ExplainableMatchingEngine

engine = ExplainableMatchingEngine()

def test_journey_1_stat_brain():
    # Journey 1: STAT CT Brain query
    query = RadiologyStudy(
        study_id="ST_JOURNEY1_STAT",
        patient_id_hash="PAT_STAT_BRAIN",
        study_date="2026-08-15",
        urgency="STAT",
        modality="CT",
        body_region="Brain",
        anatomy="Brain Hemisphere",
        clinical_indication="STAT rule out stroke evolution",
        condition_concept="Stroke Follow-up",
        report_summary="Acute stroke protocol",
        report_concepts=["ischemic stroke", "MCA infarct"],
        exam_type="CT Brain"
    )

    prior_best = RadiologyStudy(
        study_id="ST_JOURNEY1_PRIOR_BEST",
        patient_id_hash="PAT_STAT_BRAIN",
        study_date="2025-12-10",
        modality="CT",
        body_region="Brain",
        anatomy="Brain Hemisphere",
        clinical_indication="Acute MCA stroke follow-up",
        condition_concept="Stroke Follow-up",
        report_summary="Left MCA infarct",
        report_concepts=["ischemic stroke", "MCA infarct"],
        exam_type="CT Brain",
        is_clinically_relevant_prior=True
    )

    prior_recent_noise = RadiologyStudy(
        study_id="ST_JOURNEY1_PRIOR_RECENT_NOISE",
        patient_id_hash="PAT_STAT_BRAIN",
        study_date="2026-07-01", # More recent date, but wrong anatomy/condition (Chest CT)
        modality="CT",
        body_region="Chest",
        anatomy="Lung",
        clinical_indication="Trauma chest pain",
        condition_concept="Trauma Evaluation",
        report_summary="Clear lungs",
        report_concepts=["trauma"],
        exam_type="CT Chest",
        is_clinically_relevant_prior=False
    )

    resp = engine.match_priors(query, [query, prior_best, prior_recent_noise])
    assert len(resp.recommendations) == 2
    # Prior best CT Brain MUST rank #1 above recent Chest CT noise!
    assert resp.recommendations[0].study_id == "ST_JOURNEY1_PRIOR_BEST"
    assert resp.recommendations[0].score >= 80.0
    assert resp.recommendations[0].relevance_explanation_tag is not None

def test_journey_2_routine_knee():
    # Journey 2: ROUTINE MRI Knee query
    query = RadiologyStudy(
        study_id="ST_JOURNEY2_ROUTINE",
        patient_id_hash="PAT_ROUTINE_KNEE",
        study_date="2026-08-20",
        urgency="ROUTINE",
        modality="MRI",
        body_region="Knee",
        anatomy="Knee Joint",
        laterality="Right",
        clinical_indication="Right knee pain post fall",
        condition_concept="Fracture Follow-up",
        report_summary="ORIF hardware",
        report_concepts=["tibial plateau", "hardware"],
        exam_type="MRI Knee Right"
    )

    prior_xray = RadiologyStudy(
        study_id="ST_JOURNEY2_PRIOR_ASSISTANT_PICK",
        patient_id_hash="PAT_ROUTINE_KNEE",
        study_date="2026-06-15",
        modality="X-Ray", # X-Ray Knee (Recent)
        body_region="Knee",
        anatomy="Knee Joint",
        laterality="Right",
        clinical_indication="Right knee radiograph",
        condition_concept="Fracture Follow-up",
        report_summary="Hardware intact",
        report_concepts=["hardware"],
        exam_type="X-Ray Knee"
    )

    prior_mri = RadiologyStudy(
        study_id="ST_JOURNEY2_PRIOR_HUMAN_PICK",
        patient_id_hash="PAT_ROUTINE_KNEE",
        study_date="2025-08-10",
        modality="MRI", # MRI Knee (Older)
        body_region="Knee",
        anatomy="Knee Joint",
        laterality="Right",
        clinical_indication="Baseline post-op MRI right knee",
        condition_concept="Fracture Follow-up",
        report_summary="Baseline post-op MRI showing tibial plateau repair",
        report_concepts=["tibial plateau", "hardware"],
        exam_type="MRI Knee Right",
        is_clinically_relevant_prior=True
    )

    resp = engine.match_priors(query, [query, prior_xray, prior_mri])
    assert len(resp.recommendations) == 2
    # Both MRI and X-Ray returned with full score breakdowns
    assert "Anatomy" in resp.recommendations[0].score_breakdown
    assert "Modality" in resp.recommendations[0].score_breakdown
