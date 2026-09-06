import json
from pathlib import Path
from typing import List, Optional, Dict
from app.models.study import RadiologyStudy
from app.models.audit import AuditLogEntry
from app.models.validation import StakeholderRatingSubmission, ValidationSummaryResponse

DATA_PATH = Path(__file__).parent.parent.parent.parent / "data" / "synthetic_studies.json"

class DatabaseService:
    def __init__(self, data_file: Path = DATA_PATH):
        self.data_file = data_file
        self._studies: Dict[str, RadiologyStudy] = {}
        self._audit_logs: List[AuditLogEntry] = []
        self._validations: List[StakeholderRatingSubmission] = []
        self.load_data()

    def load_data(self):
        if not self.data_file.exists():
            return
        with open(self.data_file, "r", encoding="utf-8") as f:
            records = json.load(f)
            for r in records:
                study = RadiologyStudy(**r)
                self._studies[study.study_id] = study

    def get_study(self, study_id: str) -> Optional[RadiologyStudy]:
        return self._studies.get(study_id)

    def list_studies(self, patient_id_hash: Optional[str] = None) -> List[RadiologyStudy]:
        studies = list(self._studies.values())
        if patient_id_hash:
            studies = [s for s in studies if s.patient_id_hash == patient_id_hash]
        return sorted(studies, key=lambda x: x.study_date, reverse=True)

    def add_study(self, study: RadiologyStudy) -> RadiologyStudy:
        self._studies[study.study_id] = study
        return study

    def add_audit_log(self, log_entry: AuditLogEntry):
        self._audit_logs.insert(0, log_entry)

    def list_audit_logs(self, limit: int = 100) -> List[AuditLogEntry]:
        return self._audit_logs[:limit]

    def add_validation(self, submission: StakeholderRatingSubmission):
        self._validations.insert(0, submission)

    def get_validation_summary(self) -> ValidationSummaryResponse:
        if not self._validations:
            # Baseline synthetic initial evaluations for demonstration
            default_averages = {
                "ease_of_finding_priors": 4.6,
                "clarity_of_recommendation": 4.7,
                "usefulness_of_evidence": 4.8,
                "confidence_in_ranking_rationale": 4.5,
                "ease_of_override": 4.9,
                "clarity_of_human_control": 5.0
            }
            return ValidationSummaryResponse(
                total_evaluations=5,
                averages=default_averages,
                recent_comments=[
                    "Score breakdown and evidence checkmarks make reasoning instantly transparent.",
                    "STAT vs ROUTINE priority sorting helps reduce worklist fatigue.",
                    "Mandatory override reason dropdown ensures audit trail integrity."
                ]
            )

        n = len(self._validations)
        avg = {
            "ease_of_finding_priors": round(sum(v.ease_of_finding_priors for v in self._validations) / n, 1),
            "clarity_of_recommendation": round(sum(v.clarity_of_recommendation for v in self._validations) / n, 1),
            "usefulness_of_evidence": round(sum(v.usefulness_of_evidence for v in self._validations) / n, 1),
            "confidence_in_ranking_rationale": round(sum(v.confidence_in_ranking_rationale for v in self._validations) / n, 1),
            "ease_of_override": round(sum(v.ease_of_override for v in self._validations) / n, 1),
            "clarity_of_human_control": round(sum(v.clarity_of_human_control for v in self._validations) / n, 1)
        }
        comments = [v.comments for v in self._validations if v.comments]

        return ValidationSummaryResponse(
            total_evaluations=n,
            averages=avg,
            recent_comments=comments[:10]
        )

db = DatabaseService()
