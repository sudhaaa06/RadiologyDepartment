import json
import random
from datetime import datetime, timedelta
from pathlib import Path

# Seed for reproducible generation
random.seed(42)

OUTPUT_FILE = Path(__file__).parent.parent / "data" / "synthetic_studies.json"

MODALITIES_RAW = [
    ("CT", ["CT", "CAT Scan", "Computed Tomography"]),
    ("MRI", ["MRI", "MR", "Magnetic Resonance"]),
    ("X-Ray", ["X-Ray", "CXR", "Plain Film", "Radiograph"]),
    ("Ultrasound", ["Ultrasound", "US", "Sonogram"])
]

BODY_REGIONS_RAW = [
    ("Chest", ["Chest", "CT thorax", "Chest CT", "Thorax", "Pulmonary"]),
    ("Brain", ["Brain", "Head", "Cranial", "Neuro"]),
    ("Abdomen", ["Abdomen", "Abdominal", "Abdo-Pelvis"]),
    ("Pelvis", ["Pelvis", "Pelvic"]),
    ("Spine", ["Lumbar Spine", "Spine", "L-Spine", "C-Spine"]),
    ("Knee", ["Knee", "Knee Joint", "Right Knee", "Left Knee"]),
    ("Shoulder", ["Shoulder", "Shoulder Joint", "Right Shoulder"])
]

URGENCIES = ["STAT", "URGENT", "ROUTINE"]
DEPARTMENTS = ["Oncology", "Emergency", "Pulmonology", "Orthopedics", "Neurology", "Gastroenterology", "Internal Med", None]
SOURCE_CENTRES = ["Main PACS", "St. Jude Community Clinic", "Metro Outpatient Imaging", "Regional General Hospital", "Valley Radiology"]

CONDITIONS = [
    {
        "concept": "Pulmonary Nodule",
        "body_region": "Chest",
        "anatomy": "Lung",
        "indications": ["F/u pulmonary nodule RUL", "Suspected lung lesion", "Chest CT for nodule surveillance", "Solitary pulmonary nodule RUL"],
        "reports": [
            "7mm subpleural right upper lobe nodule, stable compared to prior exam.",
            "Indeterminate 6mm RUL pulmonary nodule requiring interval follow-up.",
            "Right upper lobe subpleural opacity/nodule measuring 8mm."
        ],
        "concepts": ["RUL nodule", "subpleural", "nodule surveillance"]
    },
    {
        "concept": "Stroke Follow-up",
        "body_region": "Brain",
        "anatomy": "Brain Hemisphere",
        "indications": ["Acute ischemic stroke follow-up", "Rule out CVA evolution", "Left MCA infarct follow-up", "Sudden right sided weakness"],
        "reports": [
            "Evolving left MCA territory infarction without hemorrhagic transformation.",
            "Subacute left hemisphere infarct, stable mass effect.",
            "Prior left MCA territory ischemic change with mild surrounding gliosis."
        ],
        "concepts": ["MCA infarct", "ischemic stroke", "gliosis"]
    },
    {
        "concept": "Liver Lesion",
        "body_region": "Abdomen",
        "anatomy": "Liver",
        "indications": ["Suspected hepatic mass", "F/u liver lesion segment VI", "Abdominal pain, history of hepatitis", "Focal liver lesion CT"],
        "reports": [
            "2.3cm hypoattenuating lesion in liver segment VI, likely hemangioma.",
            "Stable hepatic segment VI hypodensity, unchanged from previous scan.",
            "Segment VI liver lesion measuring 2.5cm, unchanged attenuation."
        ],
        "concepts": ["segment VI", "hepatic lesion", "hemangioma"]
    },
    {
        "concept": "Renal Lesion",
        "body_region": "Abdomen",
        "anatomy": "Kidney",
        "indications": ["F/u complex renal cyst", "Right kidney mass", "Renal lesion follow-up", "Hematuria workup"],
        "reports": [
            "1.8cm Bosniak II simple cyst in lower pole of right kidney.",
            "Right renal lower pole exophytic cystic lesion, stable appearance.",
            "Exophytic right renal cyst measuring 2.0cm, benign characteristics."
        ],
        "concepts": ["renal cyst", "Bosniak II", "right kidney"]
    },
    {
        "concept": "Fracture Follow-up",
        "body_region": "Knee",
        "anatomy": "Knee Joint",
        "indications": ["Right knee post traumatic fall", "F/u tibial plateau fracture", "Post-op ORIF knee pain", "Knee joint pain after accident"],
        "reports": [
            "Healing lateral tibial plateau fracture with hardware in good position.",
            "Right knee joint space narrowing, post-traumatic changes, healing fracture.",
            "Tibial plateau fracture alignment preserved, minimal callus formation."
        ],
        "concepts": ["tibial plateau", "healing fracture", "hardware"]
    },
    {
        "concept": "Degenerative Spine Disease",
        "body_region": "Spine",
        "anatomy": "Lumbar Spine",
        "indications": ["Chronic lower back pain", "L4-L5 radiculopathy", "F/u disc herniation", "Lumbar spondylosis"],
        "reports": [
            "L4-L5 disc space narrowing and mild neural foraminal stenosis.",
            "Multilevel lumbar spondylosis, most prominent at L4-L5.",
            "L4-L5 posterior disc protrusion unchanged from prior study."
        ],
        "concepts": ["L4-L5", "disc protrusion", "foraminal stenosis"]
    }
]

LATERALITIES = ["Right", "Left", "Bilateral", "N/A"]

def build_explicit_journeys():
    journeys = []

    # JOURNEY 1 — STAT CT Brain
    # Query: STAT CT Brain (Current)
    st_stat_q = {
        "study_id": "ST_JOURNEY1_STAT",
        "patient_id_hash": "PAT_STAT_BRAIN",
        "study_date": "2026-08-15",
        "urgency": "STAT",
        "department": "Emergency",
        "source_centre": "Main PACS",
        "modality": "CT",
        "modality_canonical": "CT",
        "body_region": "Brain",
        "body_region_canonical": "Brain",
        "anatomy": "Brain Hemisphere",
        "laterality": "N/A",
        "clinical_indication": "STAT rule out acute stroke evolution",
        "condition_concept": "Stroke Follow-up",
        "report_summary": "Sudden onset right weakness, acute stroke protocol",
        "report_concepts": ["ischemic stroke", "MCA infarct", "gliosis"],
        "exam_type": "CT Brain Without Contrast",
        "contrast_used": False,
        "comparison_available": True,
        "prior_study_ids": ["ST_JOURNEY1_PRIOR_BEST"],
        "is_clinically_relevant_prior": False
    }

    # Best Relevant Prior CT Brain (8 months ago)
    st_stat_p1 = {
        "study_id": "ST_JOURNEY1_PRIOR_BEST",
        "patient_id_hash": "PAT_STAT_BRAIN",
        "study_date": "2025-12-10",
        "urgency": "STAT",
        "department": "Neurology",
        "source_centre": "Main PACS",
        "modality": "CT",
        "modality_canonical": "CT",
        "body_region": "Brain",
        "body_region_canonical": "Brain",
        "anatomy": "Brain Hemisphere",
        "laterality": "N/A",
        "clinical_indication": "Acute MCA stroke follow-up",
        "condition_concept": "Stroke Follow-up",
        "report_summary": "Left MCA infarct with mild surrounding edema",
        "report_concepts": ["ischemic stroke", "MCA infarct"],
        "exam_type": "CT Brain Without Contrast",
        "contrast_used": False,
        "comparison_available": True,
        "prior_study_ids": [],
        "is_clinically_relevant_prior": True
    }

    # Recent but less relevant scan (Chest CT for Trauma, 1 month ago)
    st_stat_p2 = {
        "study_id": "ST_JOURNEY1_PRIOR_RECENT_NOISE",
        "patient_id_hash": "PAT_STAT_BRAIN",
        "study_date": "2026-07-01", # More recent, but wrong anatomy/condition!
        "urgency": "ROUTINE",
        "department": "Emergency",
        "source_centre": "Main PACS",
        "modality": "CT",
        "modality_canonical": "CT",
        "body_region": "Chest",
        "body_region_canonical": "Chest",
        "anatomy": "Lung",
        "laterality": "N/A",
        "clinical_indication": "Trauma chest pain post MVC",
        "condition_concept": "Trauma Evaluation",
        "report_summary": "No pulmonary contusion or rib fracture",
        "report_concepts": ["trauma", "chest pain"],
        "exam_type": "CT Chest Without Contrast",
        "contrast_used": False,
        "comparison_available": True,
        "prior_study_ids": [],
        "is_clinically_relevant_prior": False
    }

    journeys.extend([st_stat_q, st_stat_p1, st_stat_p2])

    # JOURNEY 2 — ROUTINE MRI Knee
    # Query: ROUTINE MRI Knee (Current)
    st_routine_q = {
        "study_id": "ST_JOURNEY2_ROUTINE",
        "patient_id_hash": "PAT_ROUTINE_KNEE",
        "study_date": "2026-08-20",
        "urgency": "ROUTINE",
        "department": "Orthopedics",
        "source_centre": "Metro Outpatient Imaging",
        "modality": "MRI",
        "modality_canonical": "MRI",
        "body_region": "Knee",
        "body_region_canonical": "Knee",
        "anatomy": "Knee Joint",
        "laterality": "Right",
        "clinical_indication": "Persistent right knee pain, rule out meniscal re-tear",
        "condition_concept": "Fracture Follow-up",
        "report_summary": "Post-traumatic right knee pain, prior ORIF hardware",
        "report_concepts": ["tibial plateau", "hardware", "healing fracture"],
        "exam_type": "MRI Knee Right Without Contrast",
        "contrast_used": False,
        "comparison_available": True,
        "prior_study_ids": ["ST_JOURNEY2_PRIOR_HUMAN_PICK"],
        "is_clinically_relevant_prior": False
    }

    # Assistant Top Rank Pick (X-Ray Knee, 2 months ago)
    st_routine_p1 = {
        "study_id": "ST_JOURNEY2_PRIOR_ASSISTANT_PICK",
        "patient_id_hash": "PAT_ROUTINE_KNEE",
        "study_date": "2026-06-15",
        "urgency": "ROUTINE",
        "department": "Orthopedics",
        "source_centre": "Metro Outpatient Imaging",
        "modality": "X-Ray",
        "modality_canonical": "X-Ray",
        "body_region": "Knee",
        "body_region_canonical": "Knee",
        "anatomy": "Knee Joint",
        "laterality": "Right",
        "clinical_indication": "Right knee plain radiograph",
        "condition_concept": "Fracture Follow-up",
        "report_summary": "Right knee AP/Lat intact hardware",
        "report_concepts": ["hardware"],
        "exam_type": "X-Ray Knee Right AP/Lat",
        "contrast_used": False,
        "comparison_available": True,
        "prior_study_ids": [],
        "is_clinically_relevant_prior": False
    }

    # Human-Selected Target Prior (Prior Post-op MRI Knee, 1 year ago)
    st_routine_p2 = {
        "study_id": "ST_JOURNEY2_PRIOR_HUMAN_PICK",
        "patient_id_hash": "PAT_ROUTINE_KNEE",
        "study_date": "2025-08-10",
        "urgency": "ROUTINE",
        "department": "Orthopedics",
        "source_centre": "Main PACS",
        "modality": "MRI",
        "modality_canonical": "MRI",
        "body_region": "Knee",
        "body_region_canonical": "Knee",
        "anatomy": "Knee Joint",
        "laterality": "Right",
        "clinical_indication": "Post-op baseline MRI right knee",
        "condition_concept": "Fracture Follow-up",
        "report_summary": "Baseline post-op MRI showing tibial plateau repair",
        "report_concepts": ["tibial plateau", "hardware", "healing fracture"],
        "exam_type": "MRI Knee Right Without Contrast",
        "contrast_used": False,
        "comparison_available": True,
        "prior_study_ids": [],
        "is_clinically_relevant_prior": True
    }

    journeys.extend([st_routine_q, st_routine_p1, st_routine_p2])

    return journeys

def generate_dataset(num_patients=35, studies_per_patient_range=(4, 6)):
    studies = []
    study_counter = 1000

    base_date = datetime(2026, 8, 1)

    # 1. Add explicit demo journeys first
    journey_studies = build_explicit_journeys()
    studies.extend(journey_studies)

    # 2. Add randomized synthetic studies
    for p_idx in range(1, num_patients + 1):
        patient_id_hash = f"PAT_{p_idx:04d}X"
        num_studies = random.randint(*studies_per_patient_range)
        
        primary_cond = random.choice(CONDITIONS)
        secondary_cond = random.choice([c for c in CONDITIONS if c["concept"] != primary_cond["concept"]])
        
        patient_studies = []
        current_dt = base_date - timedelta(days=random.randint(1, 30))
        
        for s_idx in range(num_studies):
            study_id = f"ST{study_counter}"
            study_counter += 1
            
            is_primary = (s_idx < num_studies - 1) or (random.random() > 0.3)
            cond = primary_cond if is_primary else secondary_cond
            urgency = random.choice(URGENCIES)
            
            modality_canonical, modality_raw_opts = random.choice(MODALITIES_RAW)
            if is_primary and cond["body_region"] in ["Chest", "Abdomen"]:
                modality_canonical = "CT" if random.random() > 0.2 else "X-Ray"
            elif is_primary and cond["body_region"] in ["Brain"]:
                modality_canonical = "MRI" if random.random() > 0.2 else "CT"
            
            for m_can, opts in MODALITIES_RAW:
                if m_can == modality_canonical:
                    modality_raw = random.choice(opts)
                    break
            
            body_region_raw = cond["body_region"]
            for b_can, opts in BODY_REGIONS_RAW:
                if b_can == cond["body_region"]:
                    body_region_raw = random.choice(opts)
                    break

            laterality = random.choice(LATERALITIES) if cond["body_region"] in ["Knee", "Shoulder"] else "N/A"
            if cond["body_region"] in ["Chest", "Abdomen", "Brain", "Spine"]:
                laterality = "N/A"

            department = random.choice(DEPARTMENTS)
            source_centre = random.choice(SOURCE_CENTRES)
            contrast_used = random.choice([True, False, None])
            
            report_summary = random.choice(cond["reports"])
            indication = random.choice(cond["indications"])
            
            study_date_str = current_dt.strftime("%Y-%m-%d")
            current_dt -= timedelta(days=random.randint(30, 420))

            study_record = {
                "study_id": study_id,
                "patient_id_hash": patient_id_hash,
                "study_date": study_date_str,
                "urgency": urgency,
                "department": department,
                "source_centre": source_centre,
                "modality": modality_raw,
                "modality_canonical": modality_canonical,
                "body_region": body_region_raw,
                "body_region_canonical": cond["body_region"],
                "anatomy": cond["anatomy"],
                "laterality": laterality,
                "clinical_indication": indication,
                "condition_concept": cond["concept"],
                "report_summary": report_summary,
                "report_concepts": cond["concepts"],
                "exam_type": f"{modality_canonical} {cond['body_region']} {'With Contrast' if contrast_used else 'Without Contrast'}",
                "contrast_used": contrast_used,
                "comparison_available": True,
                "prior_study_ids": [],
                "is_clinically_relevant_prior": False
            }
            patient_studies.append(study_record)
        
        # Link ground-truth priors
        for i, query_st in enumerate(patient_studies):
            ground_truth_priors = []
            for j in range(i + 1, len(patient_studies)):
                candidate = patient_studies[j]
                if candidate["condition_concept"] == query_st["condition_concept"]:
                    ground_truth_priors.append(candidate["study_id"])
                    candidate["is_clinically_relevant_prior"] = True
            query_st["prior_study_ids"] = ground_truth_priors
            if len(ground_truth_priors) == 0:
                query_st["comparison_available"] = False
        
        studies.extend(patient_studies)

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(studies, f, indent=2)

    print(f"Generated {len(studies)} synthetic radiology studies across {num_patients + 2} patients -> {OUTPUT_FILE}")
    return studies

if __name__ == "__main__":
    generate_dataset()
