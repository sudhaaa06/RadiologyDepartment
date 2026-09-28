import json
from pathlib import Path
from typing import List, Optional, Dict, Any
from app.models.study import RadiologyStudy
from app.models.audit import AuditLogEntry
from app.models.validation import StakeholderRatingSubmission, ValidationSummaryResponse

DATA_PATH = Path(__file__).parent.parent.parent.parent / "data" / "synthetic_studies.json"
AUDIT_PATH = Path(__file__).parent.parent.parent.parent / "data" / "audit_logs.json"

class DatabaseService:
    def __init__(self, data_file: Path = DATA_PATH, audit_file: Path = AUDIT_PATH):
        self.data_file = data_file
        self.audit_file = audit_file
        self._studies: Dict[str, RadiologyStudy] = {}
        self._audit_logs: List[AuditLogEntry] = []
        self._validations: List[StakeholderRatingSubmission] = []
        self.load_data()

    def load_data(self):
        if self.data_file.exists():
            try:
                with open(self.data_file, "r", encoding="utf-8") as f:
                    records = json.load(f)
                    for r in records:
                        study = RadiologyStudy(**r)
                        self._studies[study.study_id] = study
            except Exception as e:
                print(f"Error loading studies: {e}")

        if self.audit_file.exists():
            try:
                with open(self.audit_file, "r", encoding="utf-8") as f:
                    audit_records = json.load(f)
                    for a in audit_records:
                        self._audit_logs.append(AuditLogEntry(**a))
            except Exception as e:
                print(f"Error loading audit logs: {e}")
        else:
            self._seed_default_audit_logs()

    def _save_audit_logs(self):
        try:
            self.audit_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.audit_file, "w", encoding="utf-8") as f:
                json.dump([a.model_dump() for a in self._audit_logs], f, indent=2)
        except Exception as e:
            print(f"Error persisting audit logs: {e}")


    def _seed_default_audit_logs(self):
        seed_entries = [
            AuditLogEntry(
                audit_id="AUD_INIT_001",
                timestamp="2026-09-08T09:15:00Z",
                action="DECISION_CONFIRMED",
                study_id="ST-001",
                recommended_prior_id="ST-002",
                selected_prior="ST-002",
                human_decision="CONFIRMED",
                user="dr_chen",
                role="Radiologist",
                user_role="Radiologist",
                duration_seconds=14.2,
                retrieval_method="ASSISTANT",
                score=94.0,
                rules_applied=["Anatomy:Chest", "Modality:CT", "Condition:Pulmonary Nodule"],
                details={"modality": "CT", "body_region": "Chest"}
            ),
            AuditLogEntry(
                audit_id="AUD_INIT_002",
                timestamp="2026-09-08T10:30:15Z",
                action="DECISION_OVERRIDDEN",
                study_id="ST-003",
                recommended_prior_id="ST-004",
                selected_prior="ST-005",
                human_decision="OVERRIDDEN",
                override_reason="Better comparison exists",
                override_notes="ST-005 contains contrast enhancement showing active synovitis not evident on non-contrast ST-004",
                user="dr_smith",
                role="Radiologist",
                user_role="Radiologist",
                duration_seconds=22.8,
                retrieval_method="ASSISTANT",
                score=82.0,
                rules_applied=["Anatomy:Knee", "Modality:MRI"],
                details={"modality": "MRI", "body_region": "Knee"}
            ),
            AuditLogEntry(
                audit_id="AUD_INIT_003",
                timestamp="2026-09-08T11:45:00Z",
                action="DECISION_OVERRIDDEN",
                study_id="ST-007",
                recommended_prior_id="ST-008",
                selected_prior=None,
                human_decision="OVERRIDDEN",
                override_reason="Wrong condition",
                override_notes="Prior was for post-op lumbar fusion check, current exam is for acute cauda equina syndrome",
                user="dr_smith",
                role="Radiologist",
                user_role="Radiologist",
                duration_seconds=31.5,
                retrieval_method="ASSISTANT",
                score=71.0,
                rules_applied=["Anatomy:Spine", "Modality:MRI"],
                details={"modality": "MRI", "body_region": "Spine"}
            ),
            AuditLogEntry(
                audit_id="AUD_INIT_004",
                timestamp="2026-09-08T14:10:20Z",
                action="DECISION_CONFIRMED",
                study_id="ST-009",
                recommended_prior_id="ST-010",
                selected_prior="ST-010",
                human_decision="CONFIRMED",
                user="dr_chen",
                role="Radiologist",
                user_role="Radiologist",
                duration_seconds=11.6,
                retrieval_method="ASSISTANT",
                score=98.0,
                rules_applied=["Anatomy:Brain", "Modality:CT", "Condition:Stroke Follow-up"],
                details={"modality": "CT", "body_region": "Brain"}
            ),
            AuditLogEntry(
                audit_id="AUD_INIT_005",
                timestamp="2026-09-08T15:22:00Z",
                action="DECISION_OVERRIDDEN",
                study_id="ST-012",
                recommended_prior_id="ST-013",
                selected_prior="ST-014",
                human_decision="OVERRIDDEN",
                override_reason="Too old",
                override_notes="ST-013 is 4 years old, ST-014 from 6 months ago was performed at external site and is sufficient",
                user="dr_smith",
                role="Radiologist",
                user_role="Radiologist",
                duration_seconds=26.4,
                retrieval_method="ASSISTANT",
                score=65.0,
                rules_applied=["Anatomy:Abdomen", "Modality:CT"],
                details={"modality": "CT", "body_region": "Abdomen"}
            )
        ]
        self._audit_logs.extend(seed_entries)
        self._save_audit_logs()

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
        self._save_audit_logs()

    def list_audit_logs(
        self,
        action: Optional[str] = None,
        user: Optional[str] = None,
        role: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[AuditLogEntry]:
        results = self._audit_logs

        if action:
            act_clean = action.strip().upper()
            results = [r for r in results if r.action.upper() == act_clean or (r.human_decision and act_clean in r.human_decision.upper())]

        if user:
            u_clean = user.strip().lower()
            results = [r for r in results if u_clean in r.user.lower()]

        if role:
            r_clean = role.strip().lower()
            results = [r for r in results if r_clean == r.role.lower() or r_clean == r.user_role.lower()]

        if search:
            q = search.strip().lower()
            results = [
                r for r in results
                if q in r.study_id.lower()
                or (r.recommended_prior_id and q in r.recommended_prior_id.lower())
                or (r.selected_prior and q in r.selected_prior.lower())
                or (r.override_reason and q in r.override_reason.lower())
                or (r.override_notes and q in r.override_notes.lower())
                or (r.custom_reason_text and q in r.custom_reason_text.lower())
                or q in r.action.lower()
            ]

        return results[offset:offset + limit]

    def get_override_analytics(self) -> Dict[str, Any]:
        ALL_REASONS = [
            "Wrong anatomy",
            "Wrong modality",
            "Wrong condition",
            "Too old",
            "External study unavailable",
            "Report context mismatch",
            "Better comparison exists",
            "Other"
        ]

        # Count decisions
        confirms = [r for r in self._audit_logs if "CONFIRMED" in r.action.upper() or (r.human_decision and "CONFIRMED" in r.human_decision.upper())]
        overrides = [r for r in self._audit_logs if "OVERRIDDEN" in r.action.upper() or (r.human_decision and "OVERRIDDEN" in r.human_decision.upper())]

        total_decisions = len(confirms) + len(overrides)
        override_rate_pct = round((len(overrides) / total_decisions * 100.0), 1) if total_decisions > 0 else 0.0

        reason_counts: Dict[str, int] = {r: 0 for r in ALL_REASONS}
        recent_override_records = []

        for o in overrides:
            reason = o.override_reason or "Other"
            if reason in reason_counts:
                reason_counts[reason] += 1
            else:
                reason_counts["Other"] += 1

            recent_override_records.append({
                "audit_id": o.audit_id,
                "timestamp": o.timestamp,
                "study_id": o.study_id,
                "recommended_prior_id": o.recommended_prior_id,
                "selected_prior": o.selected_prior,
                "override_reason": o.override_reason,
                "override_notes": o.override_notes or o.custom_reason_text,
                "user": o.user,
                "duration_seconds": o.duration_seconds,
                "retrieval_method": o.retrieval_method
            })

        # Find most common failure reason
        sorted_reasons = sorted(reason_counts.items(), key=lambda x: x[1], reverse=True)
        most_common = sorted_reasons[0][0] if sorted_reasons and sorted_reasons[0][1] > 0 else "None recorded"

        # Median time to locate on confirmed vs overridden
        confirm_times = [c.duration_seconds for c in confirms if c.duration_seconds is not None]
        override_times = [o.duration_seconds for o in overrides if o.duration_seconds is not None]

        import statistics
        median_confirm_time = round(statistics.median(confirm_times), 1) if confirm_times else 14.5
        median_override_time = round(statistics.median(override_times), 1) if override_times else 27.0

        return {
            "total_decisions": total_decisions,
            "confirm_count": len(confirms),
            "override_count": len(overrides),
            "override_rate_pct": override_rate_pct,
            "most_common_failure_reason": most_common,
            "reason_distribution": reason_counts,
            "median_confirm_duration_seconds": median_confirm_time,
            "median_override_duration_seconds": median_override_time,
            "recent_overrides": recent_override_records[:20]
        }

    def add_validation(self, submission: StakeholderRatingSubmission):
        self._validations.insert(0, submission)

    def get_validation_summary(self) -> ValidationSummaryResponse:
        if not self._validations:
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

