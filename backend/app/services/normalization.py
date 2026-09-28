import re
from typing import Dict, Tuple, List, Optional
from ..models.study import NormalizationItem

MODALITY_SYNONYMS: Dict[str, str] = {
    "ct": "CT",
    "cat scan": "CT",
    "cat": "CT",
    "computed tomography": "CT",
    "computed tomography scan": "CT",
    "ct thorax": "CT",
    "ct chest": "CT",
    "mri": "MRI",
    "mr": "MRI",
    "magnetic resonance": "MRI",
    "magnetic resonance imaging": "MRI",
    "cxr": "X-Ray",
    "x-ray": "X-Ray",
    "xray": "X-Ray",
    "plain film": "X-Ray",
    "radiograph": "X-Ray",
    "radiography": "X-Ray",
    "xr": "X-Ray",
    "ultrasound": "Ultrasound",
    "us": "Ultrasound",
    "sonogram": "Ultrasound",
    "echography": "Ultrasound",
    "pet": "PET-CT",
    "pet-ct": "PET-CT",
    "nuclear medicine": "Nuclear Medicine"
}

BODY_REGION_SYNONYMS: Dict[str, str] = {
    "chest": "Chest",
    "ct thorax": "Chest",
    "chest ct": "Chest",
    "thorax": "Chest",
    "thoracic": "Chest",
    "pulmonary": "Chest",
    "lung": "Chest",
    "lungs": "Chest",
    "brain": "Brain",
    "head": "Brain",
    "cranial": "Brain",
    "neuro": "Brain",
    "cerebral": "Brain",
    "abdomen": "Abdomen",
    "abdominal": "Abdomen",
    "abdo-pelvis": "Abdomen",
    "pelvis": "Pelvis",
    "pelvic": "Pelvis",
    "lumbar spine": "Spine",
    "spine": "Spine",
    "l-spine": "Spine",
    "c-spine": "Spine",
    "t-spine": "Spine",
    "cervical spine": "Spine",
    "thoracic spine": "Spine",
    "knee": "Knee",
    "knee joint": "Knee",
    "right knee": "Knee",
    "left knee": "Knee",
    "rt knee": "Knee",
    "lt knee": "Knee",
    "shoulder": "Shoulder",
    "shoulder joint": "Shoulder",
    "right shoulder": "Shoulder",
    "left shoulder": "Shoulder",
    "hip": "Hip",
    "hip joint": "Hip",
    "ankle": "Ankle",
    "wrist": "Wrist",
    "elbow": "Elbow"
}

CONDITION_CONCEPT_SYNONYMS: Dict[str, str] = {
    "pulmonary nodule": "Pulmonary Nodule",
    "lung nodule": "Pulmonary Nodule",
    "rul nodule": "Pulmonary Nodule",
    "lul nodule": "Pulmonary Nodule",
    "solitary pulmonary nodule": "Pulmonary Nodule",
    "lung lesion": "Pulmonary Nodule",
    "lung mass": "Pulmonary Nodule",
    "ground glass opacity": "Pulmonary Nodule",
    "stroke follow-up": "Stroke Follow-up",
    "stroke": "Stroke Follow-up",
    "ischemic stroke": "Stroke Follow-up",
    "cva": "Stroke Follow-up",
    "infarct": "Stroke Follow-up",
    "cerebral infarction": "Stroke Follow-up",
    "mca infarct": "Stroke Follow-up",
    "liver lesion": "Liver Lesion",
    "hepatic mass": "Liver Lesion",
    "hepatic lesion": "Liver Lesion",
    "hemangioma": "Liver Lesion",
    "hepatocellular carcinoma": "Liver Lesion",
    "hcc": "Liver Lesion",
    "renal lesion": "Renal Lesion",
    "renal mass": "Renal Lesion",
    "renal cyst": "Renal Lesion",
    "kidney lesion": "Renal Lesion",
    "kidney mass": "Renal Lesion",
    "fracture follow-up": "Fracture Follow-up",
    "fracture": "Fracture Follow-up",
    "tibial plateau fracture": "Fracture Follow-up",
    "meniscal tear": "Meniscal Tear",
    "acl tear": "Ligament / Tendon Injury",
    "ligament injury": "Ligament / Tendon Injury",
    "rotator cuff tear": "Rotator Cuff Tear",
    "orif": "Fracture Follow-up",
    "knee fracture": "Fracture Follow-up",
    "degenerative spine disease": "Degenerative Spine Disease",
    "spondylosis": "Degenerative Spine Disease",
    "disc herniation": "Degenerative Spine Disease",
    "lumbar stenosis": "Degenerative Spine Disease",
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
        
        target = f"{raw_region or ''} {exam_type or ''}".strip().lower()

        for syn, canonical in BODY_REGION_SYNONYMS.items():
            if syn in target:
                return canonical, True
        return raw_region or "Unknown", False

    @staticmethod
    def normalize_condition(raw_indication: str, condition_concept: str = "") -> Tuple[str, bool]:
        target = f"{raw_indication or ''} {condition_concept or ''}".strip().lower()

        for syn, canonical in CONDITION_CONCEPT_SYNONYMS.items():
            if syn in target:
                return canonical, True
        return condition_concept or raw_indication or "General Exam", False

    @classmethod
    def get_normalization_records(cls, raw_modality: str, raw_region: str, raw_indication: str, exam_type: str = "", raw_condition: str = "") -> List[NormalizationItem]:
        records: List[NormalizationItem] = []
        
        mod_norm, mod_matched = cls.normalize_modality(raw_modality)
        if mod_matched and (raw_modality or "").lower() != mod_norm.lower():
            records.append(NormalizationItem(
                original=raw_modality or "",
                normalized=mod_norm,
                rule_applied=f"Modality mapping: '{raw_modality}' normalized to canonical '{mod_norm}'",
                category="Modality"
            ))

        reg_norm, reg_matched = cls.normalize_body_region(raw_region, exam_type)
        if reg_matched and (raw_region or "").lower() != reg_norm.lower():
            records.append(NormalizationItem(
                original=f"{raw_region} ({exam_type})".strip() if exam_type else (raw_region or ""),
                normalized=reg_norm,
                rule_applied=f"Anatomy taxonomy: mapped to canonical body region '{reg_norm}'",
                category="Anatomy / Body Region"
            ))

        cond_norm, cond_matched = cls.normalize_condition(raw_indication, raw_condition)
        orig_cond = raw_condition or raw_indication or ""
        if cond_matched and orig_cond.lower() != cond_norm.lower():
            records.append(NormalizationItem(
                original=orig_cond,
                normalized=cond_norm,
                rule_applied=f"Condition ontology: mapped clinical term to '{cond_norm}'",
                category="Clinical Condition"
            ))

        return records


