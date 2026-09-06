from app.models.study import RadiologyStudy
from app.services.matching_engine import ExplainableMatchingEngine

def test_explainable_matching():
    engine = ExplainableMatchingEngine()

    query = RadiologyStudy(
        study_id="ST2001",
        patient_id_hash="PAT_888X",
        study_date="2026-03-01",
        modality="CT thorax",
        body_region="Chest",
        anatomy="Lung",
        clinical_indication="F/u pulmonary nodule RUL",
        condition_concept="Pulmonary Nodule",
        report_summary="7mm RUL nodule",
        report_concepts=["RUL nodule", "subpleural"],
        exam_type="CT Chest"
    )

    prior_nodule = RadiologyStudy(
        study_id="ST1001",
        patient_id_hash="PAT_888X",
        study_date="2025-07-01",
        modality="CT",
        body_region="Chest",
        anatomy="Lung",
        clinical_indication="Pulmonary nodule evaluation",
        condition_concept="Pulmonary Nodule",
        report_summary="6mm RUL nodule",
        report_concepts=["RUL nodule", "subpleural"],
        exam_type="CT Chest",
        is_clinically_relevant_prior=True
    )

    prior_trauma = RadiologyStudy(
        study_id="ST0900",
        patient_id_hash="PAT_888X",
        study_date="2025-11-01", # More recent, but wrong condition!
        modality="CT",
        body_region="Chest",
        anatomy="Lung",
        clinical_indication="Motor vehicle collision trauma",
        condition_concept="Trauma Evaluation",
        report_summary="No rib fractures, lung parenchyma clear",
        report_concepts=["trauma", "rib fracture"],
        exam_type="CT Chest",
        is_clinically_relevant_prior=False
    )

    resp = engine.match_priors(query, [query, prior_nodule, prior_trauma])
    
    # Matching assistant should rank prior_nodule HIGHER than prior_trauma even though trauma is more recent!
    assert len(resp.recommendations) == 2
    assert resp.recommendations[0].study_id == "ST1001"
    assert resp.recommendations[0].score > resp.recommendations[1].score
    assert any("Matching condition concept: Pulmonary Nodule" in ev for ev in resp.recommendations[0].evidence)
