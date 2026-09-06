from app.services.normalization import TerminologyNormalizer

def test_modality_normalization():
    m1, is_norm1 = TerminologyNormalizer.normalize_modality("CT thorax")
    assert m1 == "CT"
    assert is_norm1 is True

    m2, is_norm2 = TerminologyNormalizer.normalize_modality("CXR")
    assert m2 == "X-Ray"
    assert is_norm2 is True

    m3, is_norm3 = TerminologyNormalizer.normalize_modality("CAT Scan")
    assert m3 == "CT"
    assert is_norm3 is True

def test_body_region_normalization():
    b1, _ = TerminologyNormalizer.normalize_body_region("CT thorax")
    assert b1 == "Chest"

    b2, _ = TerminologyNormalizer.normalize_body_region("Cranial")
    assert b2 == "Brain"

    b3, _ = TerminologyNormalizer.normalize_body_region("Lumbar Spine")
    assert b3 == "Spine"

def test_condition_normalization():
    c1, _ = TerminologyNormalizer.normalize_condition("F/u RUL nodule")
    assert c1 == "Pulmonary Nodule"

    c2, _ = TerminologyNormalizer.normalize_condition("Acute CVA evolution")
    assert c2 == "Stroke Follow-up"

    c3, _ = TerminologyNormalizer.normalize_condition("Hepatic mass segment VI")
    assert c3 == "Liver Lesion"
