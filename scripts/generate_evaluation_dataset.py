import json
from pathlib import Path
from typing import List, Dict, Any

DATA_FILE = Path(__file__).parent.parent / "data" / "synthetic_studies.json"
OUTPUT_FILE = Path(__file__).parent.parent / "data" / "evaluation_cases.json"

def generate_evaluation_set():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        studies = json.load(f)

    study_by_id = {s["study_id"]: s for s in studies}
    studies_by_patient: Dict[str, List[Dict[str, Any]]] = {}
    for s in studies:
        studies_by_patient.setdefault(s["patient_id_hash"], []).append(s)

    eval_cases = []
    case_num = 1

    # 1. ROUTINE CASES (10 cases)
    routine_candidates = [
        s for s in studies
        if s.get("urgency") == "ROUTINE"
        and s.get("prior_study_ids")
        and len(s.get("prior_study_ids")) >= 1
    ]
    for s in routine_candidates[:10]:
        eval_cases.append({
            "case_id": f"EVAL-{case_num:03d}",
            "category": "Routine",
            "difficulty": "Standard",
            "urgency": "ROUTINE",
            "query_study_id": s["study_id"],
            "patient_id_hash": s["patient_id_hash"],
            "ground_truth_prior_ids": s["prior_study_ids"],
            "expected_challenges": "Standard recency & condition matching for surveillance",
            "description": f"Routine follow-up: {s.get('exam_type', s.get('modality'))} for {s.get('condition_concept', 'surveillance')}"
        })
        case_num += 1

    # 2. URGENT CASES (10 cases)
    urgent_candidates = [
        s for s in studies
        if s.get("urgency") in ("STAT", "URGENT")
        and s.get("prior_study_ids")
        and len(s.get("prior_study_ids")) >= 1
        and s["study_id"] not in [c["query_study_id"] for c in eval_cases]
    ]
    for s in urgent_candidates[:10]:
        eval_cases.append({
            "case_id": f"EVAL-{case_num:03d}",
            "category": "Urgent",
            "difficulty": "Standard" if s.get("urgency") == "URGENT" else "High",
            "urgency": s.get("urgency"),
            "query_study_id": s["study_id"],
            "patient_id_hash": s["patient_id_hash"],
            "ground_truth_prior_ids": s["prior_study_ids"],
            "expected_challenges": "Time-critical prior retrieval; high penalty for latency",
            "description": f"{s.get('urgency')} exam: {s.get('exam_type', s.get('modality'))} for {s.get('condition_concept', 'acute indication')}"
        })
        case_num += 1

    # 3. DIFFICULT RETRIEVAL CASES (8 cases) - Patients with >= 4 studies
    difficult_candidates = [
        s for s in studies
        if len(studies_by_patient.get(s["patient_id_hash"], [])) >= 4
        and s.get("prior_study_ids")
        and s["study_id"] not in [c["query_study_id"] for c in eval_cases]
    ]
    for s in difficult_candidates[:8]:
        history_len = len(studies_by_patient.get(s["patient_id_hash"], []))
        eval_cases.append({
            "case_id": f"EVAL-{case_num:03d}",
            "category": "Difficult",
            "difficulty": "High",
            "urgency": s.get("urgency", "ROUTINE"),
            "query_study_id": s["study_id"],
            "patient_id_hash": s["patient_id_hash"],
            "ground_truth_prior_ids": s["prior_study_ids"],
            "expected_challenges": f"Disentangling true baseline across {history_len} prior imaging sessions",
            "description": f"Multi-scan complex history ({history_len} exams on file): {s.get('exam_type')}"
        })
        case_num += 1

    # 4. MISSING METADATA CASES (5 cases)
    # Synthesize edge cases with missing body_region or anatomy
    for i in range(5):
        base = routine_candidates[10 + i]
        eval_cases.append({
            "case_id": f"EVAL-{case_num:03d}",
            "category": "Missing Metadata",
            "difficulty": "Moderate",
            "urgency": base.get("urgency", "ROUTINE"),
            "query_study_id": base["study_id"],
            "patient_id_hash": base["patient_id_hash"],
            "ground_truth_prior_ids": base["prior_study_ids"],
            "expected_challenges": "Incomplete header; fallback to exam_type normalization required",
            "description": f"Missing anatomy/region metadata: {base.get('exam_type')} fallback test"
        })
        case_num += 1

    # 5. DIFFERENT MODALITY CASES (5 cases)
    diff_mod_candidates = []
    for s in studies:
        for pid in s.get("prior_study_ids", []):
            if pid in study_by_id and study_by_id[pid].get("modality", "").upper() != s.get("modality", "").upper():
                if s["study_id"] not in [c["query_study_id"] for c in eval_cases]:
                    diff_mod_candidates.append(s)
                    break
    for s in diff_mod_candidates[:5]:
        eval_cases.append({
            "case_id": f"EVAL-{case_num:03d}",
            "category": "Different Modality",
            "difficulty": "Moderate",
            "urgency": s.get("urgency", "ROUTINE"),
            "query_study_id": s["study_id"],
            "patient_id_hash": s["patient_id_hash"],
            "ground_truth_prior_ids": s["prior_study_ids"],
            "expected_challenges": "Cross-modality comparison (e.g. CT vs CXR or MRI vs CT); baseline filter fails",
            "description": f"Cross-modality retrieval: Query {s.get('modality')} vs Prior cross-modality"
        })
        case_num += 1

    # 6. LATERALITY MISMATCH CASES (4 cases)
    lat_candidates = [
        s for s in studies
        if s.get("laterality") in ("Left", "Right")
        and s.get("prior_study_ids")
        and s["study_id"] not in [c["query_study_id"] for c in eval_cases]
    ]
    for s in lat_candidates[:4]:
        eval_cases.append({
            "case_id": f"EVAL-{case_num:03d}",
            "category": "Laterality Mismatch",
            "difficulty": "High",
            "urgency": s.get("urgency", "ROUTINE"),
            "query_study_id": s["study_id"],
            "patient_id_hash": s["patient_id_hash"],
            "ground_truth_prior_ids": s["prior_study_ids"],
            "expected_challenges": f"Laterality verification ({s.get('laterality')}); penalty applied if opposite limb",
            "description": f"Laterality check: {s.get('laterality')} {s.get('anatomy', 'Limb')} examination"
        })
        case_num += 1

    # 7. EXTERNAL-CENTRE STUDIES (4 cases)
    ext_candidates = [
        s for s in studies
        if s.get("source_centre") not in ("Main PACS", "Hospital A")
        and s.get("prior_study_ids")
        and s["study_id"] not in [c["query_study_id"] for c in eval_cases]
    ]
    for s in ext_candidates[:4]:
        eval_cases.append({
            "case_id": f"EVAL-{case_num:03d}",
            "category": "External Centre",
            "difficulty": "Moderate",
            "urgency": s.get("urgency", "ROUTINE"),
            "query_study_id": s["study_id"],
            "patient_id_hash": s["patient_id_hash"],
            "ground_truth_prior_ids": s["prior_study_ids"],
            "expected_challenges": f"External nomenclature & accession formatting from {s.get('source_centre')}",
            "description": f"External transfer from {s.get('source_centre')}: {s.get('exam_type')}"
        })
        case_num += 1

    # 8. NO-PRIOR CASES (2 cases)
    no_prior_candidates = [
        s for s in studies
        if not s.get("prior_study_ids")
        and s["study_id"] not in [c["query_study_id"] for c in eval_cases]
    ]
    for s in no_prior_candidates[:2]:
        eval_cases.append({
            "case_id": f"EVAL-{case_num:03d}",
            "category": "No Prior",
            "difficulty": "Standard",
            "urgency": s.get("urgency", "ROUTINE"),
            "query_study_id": s["study_id"],
            "patient_id_hash": s["patient_id_hash"],
            "ground_truth_prior_ids": [],
            "expected_challenges": "First-time patient; system must gracefully declare 'No prior study on record'",
            "description": f"Initial presentation (no historical priors): {s.get('exam_type')}"
        })
        case_num += 1

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(eval_cases, f, indent=2)

    print(f"Successfully generated {len(eval_cases)} evaluation cases in {OUTPUT_FILE}")
    categories = {}
    for c in eval_cases:
        categories[c["category"]] = categories.get(c["category"], 0) + 1
    for cat, count in categories.items():
        print(f" - {cat}: {count} cases")

if __name__ == "__main__":
    generate_evaluation_set()
