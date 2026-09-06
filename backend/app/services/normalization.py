import re
from typing import Dict, Tuple

MODALITY_SYNONYMS: Dict[str, str] = {
    "ct": "CT",
    "cat scan": "CT",
    "computed tomography": "CT",
    "mri": "MRI",
    "mr": "MRI",
    "magnetic resonance": "MRI",
    "cxr": "X-Ray",
    "x-ray": "X-Ray",
    "plain film": "X-Ray",
    "radiograph": "X-Ray",
    "ultrasound": "Ultrasound",
    "us": "Ultrasound",
    "sonogram": "Ultrasound"
}

BODY_REGION_SYNONYMS: Dict[str, str] = {
    "chest": "Chest",
    "ct thorax": "Chest",
    "chest ct": "Chest",
    "thorax": "Chest",
    "pulmonary": "Chest",
    "lung": "Chest",
    "brain": "Brain",
    "head": "Brain",
    "cranial": "Brain",
    "neuro": "Brain",
    "abdomen": "Abdomen",
    "abdominal": "Abdomen",
    "abdo-pelvis": "Abdomen",
    "pelvis": "Pelvis",
    "pelvic": "Pelvis",
    "lumbar spine": "Spine",
    "spine": "Spine",
    "l-spine": "Spine",
    "c-spine": "Spine",
    "knee": "Knee",
    "knee joint": "Knee",
    "right knee": "Knee",
    "left knee": "Knee",
    "shoulder": "Shoulder",
    "shoulder joint": "Shoulder",
    "right shoulder": "Shoulder"
}

CONDITION_CONCEPT_SYNONYMS: Dict[str, str] = {
    "pulmonary nodule": "Pulmonary Nodule",
    "lung nodule": "Pulmonary Nodule",
    "rul nodule": "Pulmonary Nodule",
    "solitary pulmonary nodule": "Pulmonary Nodule",
    "stroke follow-up": "Stroke Follow-up",
    "ischemic stroke": "Stroke Follow-up",
    "cva": "Stroke Follow-up",
    "infarct": "Stroke Follow-up",
    "mca infarct": "Stroke Follow-up",
    "liver lesion": "Liver Lesion",
    "hepatic mass": "Liver Lesion",
    "hepatic lesion": "Liver Lesion",
    "hemangioma": "Liver Lesion",
    "renal lesion": "Renal Lesion",
    "renal mass": "Renal Lesion",
    "renal cyst": "Renal Lesion",
    "kidney lesion": "Renal Lesion",
    "fracture follow-up": "Fracture Follow-up",
    "tibial plateau fracture": "Fracture Follow-up",
    "orif": "Fracture Follow-up",
    "knee fracture": "Fracture Follow-up",
    "degenerative spine disease": "Degenerative Spine Disease",
    "spondylosis": "Degenerative Spine Disease",
    "disc herniation": "Degenerative Spine Disease",
    "radiculopathy": "Degenerative Spine Disease"
}

class TerminologyNormalizer:
    @staticmethod
    def normalize_modality(raw_modality: str) -> Tuple[str, bool]:
        if not raw_modality:
            return "Unknown", False
        clean = raw_modality.strip().lower()
        if clean in MODALITY_SYNONYMS:
            return MODALITY_SYNONYMS[clean], True
        for syn, canonical in MODALITY_SYNONYMS.items():
            if syn in clean:
                return canonical, True
        return raw_modality.upper(), False

    @staticmethod
    def normalize_body_region(raw_region: str, exam_type: str = "") -> Tuple[str, bool]:
        if not raw_region and not exam_type:
            return "Unknown", False
        
        target = (raw_region or "") + " " + (exam_type or "")
        clean = target.strip().lower()

        for syn, canonical in BODY_REGION_SYNONYMS.items():
            if syn in clean:
                return canonical, True
        return raw_region or "Unknown", False

    @staticmethod
    def normalize_condition(raw_indication: str, condition_concept: str = "") -> Tuple[str, bool]:
        target = (raw_indication or "") + " " + (condition_concept or "")
        clean = target.strip().lower()

        for syn, canonical in CONDITION_CONCEPT_SYNONYMS.items():
            if syn in clean:
                return canonical, True
        return condition_concept or raw_indication or "General Exam", False
