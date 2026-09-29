import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.models.study import RadiologyStudy
from app.services.matching_engine import ExplainableMatchingEngine

engine = ExplainableMatchingEngine()

def run_tests():
    # CASE 1: Missing anatomy
    q1 = RadiologyStudy(study_id='EC1_Q', patient_id_hash='PAT_EC1', study_date='2026-03-01', modality='CT', body_region='', anatomy=None, clinical_indication='Abdominal pain', condition_concept='Liver Lesion', report_summary='Hepatic lesion', exam_type='CT Abdomen')
    p1 = RadiologyStudy(study_id='EC1_P', patient_id_hash='PAT_EC1', study_date='2025-09-01', modality='CT', body_region='Abdomen', anatomy='Liver', clinical_indication='Liver mass', condition_concept='Liver Lesion', report_summary='Hepatic lesion', exam_type='CT Abdomen')
    r1 = engine.match_priors(q1, [q1, p1])
    print("CASE 1 (Missing anatomy):", "PASS" if len(r1.recommendations) == 1 and r1.recommendations[0].score >= 75.0 else "FAIL", f"Score: {r1.recommendations[0].score}")

    # CASE 2: No prior study
    q2 = RadiologyStudy(study_id='EC2_Q', patient_id_hash='PAT_EC2', study_date='2026-03-01', modality='CT', body_region='Chest', clinical_indication='New patient chest pain', condition_concept='Chest Pain', report_summary='Clear chest', exam_type='CT Chest')
    r2 = engine.match_priors(q2, [q2])
    print("CASE 2 (No prior study):", "PASS" if r2.no_prior_found and r2.low_confidence_warning else "FAIL", f"Warning: {r2.warning_message}")

    # CASE 3: Different modality
    q3 = RadiologyStudy(study_id='EC3_Q', patient_id_hash='PAT_EC3', study_date='2026-03-01', modality='CT', body_region='Chest', anatomy='Lung', clinical_indication='Pulmonary nodule follow-up', condition_concept='Pulmonary Nodule', report_summary='7mm nodule RUL', report_concepts=['RUL nodule'], exam_type='CT Chest')
    p3 = RadiologyStudy(study_id='EC3_P', patient_id_hash='PAT_EC3', study_date='2025-10-01', modality='CXR', body_region='Chest', anatomy='Lung', clinical_indication='Pulmonary nodule surveillance', condition_concept='Pulmonary Nodule', report_summary='Faint opacity right upper zone', report_concepts=['RUL nodule'], exam_type='Chest X-Ray')
    r3 = engine.match_priors(q3, [q3, p3])
    print("CASE 3 (Different modality):", "PASS" if len(r3.recommendations) == 1 and r3.recommendations[0].score >= 60.0 else "FAIL", f"Score: {r3.recommendations[0].score}")

    # CASE 4: Laterality mismatch
    q4 = RadiologyStudy(study_id='EC4_Q', patient_id_hash='PAT_EC4', study_date='2026-03-01', modality='MRI', body_region='Knee', anatomy='Knee Joint', laterality='Right', clinical_indication='Right knee pain post fall', condition_concept='Fracture Follow-up', report_summary='Tibial plateau fracture', exam_type='MRI Knee Right')
    p4 = RadiologyStudy(study_id='EC4_P', patient_id_hash='PAT_EC4', study_date='2025-05-01', modality='MRI', body_region='Knee', anatomy='Knee Joint', laterality='Left', clinical_indication='Left knee tear', condition_concept='Fracture Follow-up', report_summary='Meniscal tear', exam_type='MRI Knee Left')
    r4 = engine.match_priors(q4, [q4, p4])
    lat_warn = any("Laterality conflict" in sig for sig in r4.recommendations[0].negative_signals)
    print("CASE 4 (Laterality mismatch):", "PASS" if lat_warn else "FAIL", f"Score: {r4.recommendations[0].score}, Warning: {lat_warn}")

    # CASE 5: External-centre metadata incomplete
    q5 = RadiologyStudy(study_id='EC5_Q', patient_id_hash='PAT_EC5', study_date='2026-03-01', modality='CAT Scan', body_region='CT thorax', clinical_indication='F/u nodule', condition_concept='Pulmonary Nodule', report_summary='RUL nodule', report_concepts=['RUL nodule'], exam_type='Computed Tomography Chest', source_centre='Valley Radiology')
    p5 = RadiologyStudy(study_id='EC5_P', patient_id_hash='PAT_EC5', study_date='2025-06-01', modality='CT', body_region='Chest', clinical_indication='Pulmonary nodule', condition_concept='Pulmonary Nodule', report_summary='RUL nodule', report_concepts=['RUL nodule'], exam_type='CT Chest', source_centre='Main PACS')
    r5 = engine.match_priors(q5, [q5, p5])
    print("CASE 5 (External centre):", "PASS" if len(r5.recommendations) == 1 and r5.recommendations[0].score >= 80.0 else "FAIL", f"Score: {r5.recommendations[0].score}")

    # CASE 6: Very old prior
    q6 = RadiologyStudy(study_id='EC6_Q', patient_id_hash='PAT_EC6', study_date='2026-03-01', modality='CT', body_region='Chest', clinical_indication='Pulmonary nodule', condition_concept='Pulmonary Nodule', report_summary='Nodule', exam_type='CT Chest')
    p6 = RadiologyStudy(study_id='EC6_P', patient_id_hash='PAT_EC6', study_date='2018-01-01', modality='CT', body_region='Chest', clinical_indication='Pulmonary nodule', condition_concept='Pulmonary Nodule', report_summary='Nodule', exam_type='CT Chest')
    r6 = engine.match_priors(q6, [q6, p6])
    print("CASE 6 (Very old prior):", "PASS" if r6.recommendations[0].score < 80.0 else "FAIL", f"Score: {r6.recommendations[0].score}")

    # CASE 7: Accession metadata mismatch / contrast protocol mismatch
    q7 = RadiologyStudy(study_id='EC7_Q', patient_id_hash='PAT_EC7', study_date='2026-03-01', modality='CT', body_region='Abdomen', anatomy='Liver', clinical_indication='Hepatic mass characterization', condition_concept='Liver Lesion', report_summary='Arterial enhancing liver lesion', exam_type='CT Abdomen With Contrast', contrast_used=True)
    p7 = RadiologyStudy(study_id='EC7_P', patient_id_hash='PAT_EC7', study_date='2025-06-01', modality='CT', body_region='Abdomen', anatomy='Liver', clinical_indication='Abdominal pain', condition_concept='Liver Lesion', report_summary='Non-contrast scan', exam_type='CT Abdomen Without Contrast', contrast_used=False)
    r7 = engine.match_priors(q7, [q7, p7])
    contrast_flag = any("Contrast protocol mismatch" in sig for sig in r7.recommendations[0].negative_signals)
    print("CASE 7 (Accession / Contrast Protocol Mismatch):", "PASS" if contrast_flag else "FAIL", f"Score: {r7.recommendations[0].score}, Flagged: {contrast_flag}")

if __name__ == "__main__":
    run_tests()
