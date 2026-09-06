import uuid
from datetime import datetime
from typing import List, Optional
from app.models.audit import AuditLogEntry
from app.models.feedback import FeedbackSubmission
from app.services.database import db

class AuditService:
    @staticmethod
    def log_event(
        action: str,
        user_role: str = "Radiologist",
        study_id: str = "SYSTEM",
        recommended_prior_id: str = "N/A",
        human_decision: str = "COMPLETED",
        override_reason: Optional[str] = None,
        custom_reason_text: Optional[str] = None,
        rules_applied: Optional[List[str]] = None,
        score: float = 0.0
    ) -> AuditLogEntry:
        audit_entry = AuditLogEntry(
            audit_id=f"AUD_{uuid.uuid4().hex[:8].upper()}",
            timestamp=datetime.utcnow().isoformat() + "Z",
            study_id=study_id,
            recommended_prior_id=recommended_prior_id,
            human_decision=f"{action}:{human_decision}",
            override_reason=override_reason,
            custom_reason_text=custom_reason_text,
            user_role=user_role,
            rules_applied=rules_applied or [],
            score=score
        )
        db.add_audit_log(audit_entry)
        return audit_entry

    @staticmethod
    def record_feedback(submission: FeedbackSubmission, rules_applied: Optional[List[str]] = None, score: float = 0.0) -> AuditLogEntry:
        return AuditService.log_event(
            action=submission.human_decision,
            user_role=submission.user_role,
            study_id=submission.study_id,
            recommended_prior_id=submission.recommended_prior_id,
            human_decision=submission.human_decision,
            override_reason=submission.override_reason,
            custom_reason_text=submission.custom_reason_text,
            rules_applied=rules_applied,
            score=score
        )
