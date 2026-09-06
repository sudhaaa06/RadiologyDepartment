from app.models.study import RadiologyStudy
from app.services.baseline_engine import BaselineRetrievalEngine

def test_baseline_retrieval():
    query = RadiologyStudy(
        study_id="ST1001",
        patient_id_hash="PAT_999X",
        study_date="2026-03-01",
        modality="CT",
        body_region="Chest",
        clinical_indication="F/u pulmonary nodule",
        condition_concept="Pulmonary Nodule",
        report_summary="7mm nodule",
        exam_type="CT Chest"
    )

    prior1 = RadiologyStudy(
        study_id="ST1000",
        patient_id_hash="PAT_999X",
        study_date="2025-08-01",
        modality="CT",
        body_region="Chest",
        clinical_indication="F/u nodule",
        condition_concept="Pulmonary Nodule",
        report_summary="7mm nodule",
        exam_type="CT Chest"
    )

    prior2 = RadiologyStudy(
        study_id="ST0999",
        patient_id_hash="PAT_999X",
        study_date="2024-01-01",
        modality="CT",
        body_region="Chest",
        clinical_indication="F/u nodule",
        condition_concept="Pulmonary Nodule",
        report_summary="6mm nodule",
        exam_type="CT Chest"
    )

    recs = BaselineRetrievalEngine.rank_priors(query, [query, prior1, prior2])
    assert len(recs) == 2
    assert recs[0].study_id == "ST1000"  # Most recent first
    assert recs[1].study_id == "ST0999"
