import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.models.audit import AuditLogEntry
from app.models.feedback import FeedbackSubmission
from app.services.database import db

class AuditService:
    @staticmethod
    def log_event(
        action: str,
        user: str = "dr_radiologist",
        role: str = "Radiologist",
        user_role: Optional[str] = None,
        study_id: str = "SYSTEM",
        recommended_prior_id: Optional[str] = None,
        selected_prior: Optional[str] = None,
        human_decision: Optional[str] = None,
        override_reason: Optional[str] = None,
        override_notes: Optional[str] = None,
        custom_reason_text: Optional[str] = None,
        duration_seconds: Optional[float] = None,
        retrieval_method: Optional[str] = "ASSISTANT",
        rules_applied: Optional[List[str]] = None,
        score: float = 0.0,
        details: Optional[Dict[str, Any]] = None
    ) -> AuditLogEntry:
        final_role = user_role or role
        audit_entry = AuditLogEntry(
            audit_id=f"AUD_{uuid.uuid4().hex[:8].upper()}",
            timestamp=datetime.utcnow().isoformat() + "Z",
            action=action,
            study_id=study_id,
            recommended_prior_id=recommended_prior_id,
            selected_prior=selected_prior,
            human_decision=human_decision or action,
            override_reason=override_reason,
            override_notes=override_notes or custom_reason_text,
            custom_reason_text=custom_reason_text or override_notes,
            user=user,
            role=final_role,
            user_role=final_role,
            duration_seconds=duration_seconds,
            retrieval_method=retrieval_method or "ASSISTANT",
            rules_applied=rules_applied or [],
            score=score,
            details=details or {}
        )
        db.add_audit_log(audit_entry)
        return audit_entry

    @staticmethod
    def record_feedback(
        submission: FeedbackSubmission,
        rules_applied: Optional[List[str]] = None,
        score: float = 0.0,
        user: Optional[str] = None
    ) -> AuditLogEntry:
        action_name = "DECISION_CONFIRMED" if submission.human_decision == "CONFIRMED" else "DECISION_OVERRIDDEN"
        return AuditService.log_event(
            action=action_name,
            user=user or submission.user or "dr_radiologist",
            role=submission.user_role,
            user_role=submission.user_role,
            study_id=submission.study_id,
            recommended_prior_id=submission.recommended_prior_id,
            selected_prior=submission.selected_prior,
            human_decision=submission.human_decision,
            override_reason=submission.override_reason,
            override_notes=submission.override_notes or submission.custom_reason_text,
            custom_reason_text=submission.custom_reason_text or submission.override_notes,
            duration_seconds=submission.duration_seconds,
            retrieval_method=submission.retrieval_method or "ASSISTANT",
            rules_applied=rules_applied,
            score=score
        )

