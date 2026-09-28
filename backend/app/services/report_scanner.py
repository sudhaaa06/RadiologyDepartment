"""
report_scanner.py — Free-Text Radiology Report Scanner
=======================================================
Extracts structured metadata from unstructured radiology reports / referral notes.
Uses rule-based NLP (regex + keyword matching) backed by the existing normalization
ontology so extracted fields are directly compatible with the matching engine.

No external ML dependencies — runs entirely in-process.
"""

import re
from typing import Dict, Any, Optional, List, Tuple

# Re-use the normalizer's synonym maps so extracted terms map to canonical values
from .normalization import (
    MODALITY_SYNONYMS,
    BODY_REGION_SYNONYMS,
    CONDITION_CONCEPT_SYNONYMS,
    TerminologyNormalizer,
)


# ── Laterality patterns ────────────────────────────────────────────────────────
_LATERALITY_LEFT = re.compile(
    r'\b(left|lt\.?|l/s|l-side|left-sided|left sided)\b', re.IGNORECASE
)
_LATERALITY_RIGHT = re.compile(
    r'\b(right|rt\.?|r/s|r-side|right-sided|right sided)\b', re.IGNORECASE
)
_LATERALITY_BILATERAL = re.compile(
    r'\b(bilateral|both sides|bilaterally)\b', re.IGNORECASE
)

# ── Urgency patterns ───────────────────────────────────────────────────────────
_URGENCY_STAT = re.compile(
    r'\b(stat|emergency|urgent|emergent|rush|immediate)\b', re.IGNORECASE
)

# ── Contrast patterns ──────────────────────────────────────────────────────────
_CONTRAST_YES = re.compile(
    r'\b(with contrast|post.?contrast|iv contrast|gadolinium|iodinated contrast|contrast enhanced|\+c)\b',
    re.IGNORECASE,
)
_CONTRAST_NO = re.compile(
    r'\b(without contrast|non.?contrast|non contrast|unenhanced|plain|w/o contrast)\b',
    re.IGNORECASE,
)

# ── Indication extraction patterns ─────────────────────────────────────────────
_INDICATION_PATTERNS = [
    re.compile(r'(?:indication|reason for exam|clinical indication|reason)[:\-]\s*(.+?)(?:\.|$)', re.IGNORECASE | re.MULTILINE),
    re.compile(r'(?:history|clinical history)[:\-]\s*(.+?)(?:\.|$)', re.IGNORECASE | re.MULTILINE),
    re.compile(r'(?:presenting complaint|chief complaint)[:\-]\s*(.+?)(?:\.|$)', re.IGNORECASE | re.MULTILINE),
]

# ── Exam date patterns ─────────────────────────────────────────────────────────
_DATE_PATTERN = re.compile(
    r'\b(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4}|\d{1,2}\s+\w+\s+\d{4})\b'
)


def _extract_indication(text: str) -> Optional[str]:
    """Try structured indication extractors, fall back to first meaningful sentence."""
    for pat in _INDICATION_PATTERNS:
        m = pat.search(text)
        if m:
            raw = m.group(1).strip()
            if len(raw) > 5:
                return raw[:200]   # cap length

    # Fallback: first non-empty line that isn't a header
    for line in text.splitlines():
        line = line.strip()
        if line and len(line) > 10 and ':' not in line[:30]:
            return line[:200]
    return None


def _extract_modality(text: str) -> Tuple[Optional[str], bool]:
    """Return (canonical_modality, was_found)."""
    text_lower = text.lower()
    # Longest-match first to avoid "CT chest" grabbing just "chest"
    sorted_synonyms = sorted(MODALITY_SYNONYMS.items(), key=lambda x: len(x[0]), reverse=True)
    for syn, canonical in sorted_synonyms:
        if re.search(r'\b' + re.escape(syn) + r'\b', text_lower):
            return canonical, True
    return None, False


def _extract_body_region(text: str) -> Tuple[Optional[str], bool]:
    """Return (canonical_body_region, was_found)."""
    text_lower = text.lower()
    sorted_synonyms = sorted(BODY_REGION_SYNONYMS.items(), key=lambda x: len(x[0]), reverse=True)
    for syn, canonical in sorted_synonyms:
        if re.search(r'\b' + re.escape(syn) + r'\b', text_lower):
            return canonical, True
    return None, False


def _extract_condition(text: str) -> Tuple[Optional[str], bool]:
    """Return (canonical_condition_concept, was_found)."""
    text_lower = text.lower()
    sorted_synonyms = sorted(CONDITION_CONCEPT_SYNONYMS.items(), key=lambda x: len(x[0]), reverse=True)
    for syn, canonical in sorted_synonyms:
        if re.search(r'\b' + re.escape(syn) + r'\b', text_lower):
            return canonical, True
    return None, False


def _extract_laterality(text: str) -> Optional[str]:
    if _LATERALITY_BILATERAL.search(text):
        return "Bilateral"
    if _LATERALITY_LEFT.search(text) and _LATERALITY_RIGHT.search(text):
        return "Bilateral"
    if _LATERALITY_LEFT.search(text):
        return "Left"
    if _LATERALITY_RIGHT.search(text):
        return "Right"
    return "N/A"


def _extract_contrast(text: str) -> Optional[bool]:
    if _CONTRAST_YES.search(text):
        return True
    if _CONTRAST_NO.search(text):
        return False
    return None


def _extract_urgency(text: str) -> str:
    if _URGENCY_STAT.search(text):
        return "STAT"
    return "ROUTINE"


def _extract_date(text: str) -> Optional[str]:
    """Try to extract the first recognisable date from the report."""
    m = _DATE_PATTERN.search(text)
    if m:
        raw = m.group(1)
        # Normalise to YYYY-MM-DD if possible
        for fmt in ('%Y-%m-%d', '%Y/%m/%d', '%d-%m-%Y', '%d/%m/%Y'):
            try:
                from datetime import datetime
                return datetime.strptime(raw, fmt).strftime('%Y-%m-%d')
            except ValueError:
                continue
        return raw
    return None


# ── Public API ─────────────────────────────────────────────────────────────────

class ReportScanner:
    """
    Parses a free-text radiology report and returns structured metadata.

    Usage::

        result = ReportScanner.scan("CT chest with contrast. Indication: lung nodule follow-up...")
        # result["modality"] == "CT"
        # result["body_region"] == "Chest"
        # result["condition_concept"] == "Pulmonary Nodule"
    """

    @staticmethod
    def scan(report_text: str) -> Dict[str, Any]:
        """
        Extract structured fields from raw report text.

        Returns a dict with:
            modality, body_region, laterality, contrast_used, urgency,
            clinical_indication, condition_concept, study_date,
            confidence_score (0-100), extracted_fields (list of field names),
            unmatched_text_snippet (for UI debugging)
        """
        if not report_text or not report_text.strip():
            return _empty_result("No report text provided.")

        text = report_text.strip()
        extracted_fields: List[str] = []
        details: Dict[str, Any] = {}

        # ── Modality ──────────────────────────────────────────────────────────
        modality, mod_found = _extract_modality(text)
        if mod_found:
            extracted_fields.append("modality")
            details["modality"] = {"value": modality, "confidence": "HIGH"}
        else:
            details["modality"] = {"value": None, "confidence": "NONE"}

        # ── Body Region ───────────────────────────────────────────────────────
        body_region, reg_found = _extract_body_region(text)
        if reg_found:
            extracted_fields.append("body_region")
            details["body_region"] = {"value": body_region, "confidence": "HIGH"}
        else:
            details["body_region"] = {"value": None, "confidence": "NONE"}

        # ── Laterality ────────────────────────────────────────────────────────
        laterality = _extract_laterality(text)
        if laterality != "N/A":
            extracted_fields.append("laterality")
            details["laterality"] = {"value": laterality, "confidence": "HIGH"}
        else:
            details["laterality"] = {"value": "N/A", "confidence": "LOW"}

        # ── Condition Concept ─────────────────────────────────────────────────
        condition, cond_found = _extract_condition(text)
        if cond_found:
            extracted_fields.append("condition_concept")
            details["condition_concept"] = {"value": condition, "confidence": "HIGH"}
        else:
            details["condition_concept"] = {"value": None, "confidence": "NONE"}

        # ── Clinical Indication ───────────────────────────────────────────────
        indication = _extract_indication(text)
        if indication:
            extracted_fields.append("clinical_indication")
            details["clinical_indication"] = {"value": indication, "confidence": "MEDIUM"}
        else:
            details["clinical_indication"] = {"value": None, "confidence": "NONE"}

        # ── Contrast ──────────────────────────────────────────────────────────
        contrast = _extract_contrast(text)
        if contrast is not None:
            extracted_fields.append("contrast_used")
            details["contrast_used"] = {"value": contrast, "confidence": "HIGH"}
        else:
            details["contrast_used"] = {"value": None, "confidence": "NONE"}

        # ── Urgency ───────────────────────────────────────────────────────────
        urgency = _extract_urgency(text)
        if urgency == "STAT":
            extracted_fields.append("urgency")
            details["urgency"] = {"value": urgency, "confidence": "HIGH"}
        else:
            details["urgency"] = {"value": "ROUTINE", "confidence": "LOW"}

        # ── Date ──────────────────────────────────────────────────────────────
        study_date = _extract_date(text)
        if study_date:
            extracted_fields.append("study_date")
            details["study_date"] = {"value": study_date, "confidence": "MEDIUM"}
        else:
            details["study_date"] = {"value": None, "confidence": "NONE"}

        # ── Confidence Score ──────────────────────────────────────────────────
        key_fields = {"modality", "body_region", "condition_concept", "clinical_indication"}
        bonus_fields = {"laterality", "contrast_used", "urgency", "study_date"}
        key_hits = len(key_fields & set(extracted_fields))
        bonus_hits = len(bonus_fields & set(extracted_fields))
        confidence_score = min(100, int((key_hits / len(key_fields)) * 75 + (bonus_hits / len(bonus_fields)) * 25))

        # ── Short preview of unmatched text ───────────────────────────────────
        snippet = text[:300] + ("..." if len(text) > 300 else "")

        return {
            "success": True,
            "message": f"Extracted {len(extracted_fields)} field(s) from report text.",
            "confidence_score": confidence_score,
            "extracted_fields": extracted_fields,
            "details": details,
            # Flat values for easy consumption by the match endpoint
            "modality": modality or "",
            "body_region": body_region or "",
            "laterality": laterality or "N/A",
            "condition_concept": condition or "",
            "clinical_indication": indication or "",
            "contrast_used": contrast,
            "urgency": urgency,
            "study_date": study_date,
            "report_text_snippet": snippet,
        }


def _empty_result(message: str) -> Dict[str, Any]:
    return {
        "success": False,
        "message": message,
        "confidence_score": 0,
        "extracted_fields": [],
        "details": {},
        "modality": "",
        "body_region": "",
        "laterality": "N/A",
        "condition_concept": "",
        "clinical_indication": "",
        "contrast_used": None,
        "urgency": "ROUTINE",
        "study_date": None,
        "report_text_snippet": "",
    }
