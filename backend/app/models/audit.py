from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

AuditActionType = Literal[
    "CASE_OPENED",
    "RETRIEVAL_RUN_ASSISTANT",
    "RETRIEVAL_RUN_BASELINE",
    "NORMALIZATION_APPLIED",
    "PRIOR_RECOMMENDED",
    "LOW_EVIDENCE_FLAGGED",
    "NO_PRIOR_FOUND",
    "WHY_THIS_SCORE_VIEWED",
    "VIEW_NORMALIZATION_CLICKED",
    "DECISION_CONFIRMED",
    "DECISION_OVERRIDDEN",
    "BENCHMARK_EXECUTED",
    "ANALYTICS_VIEWED",
    "AUDIT_LOG_EXPORTED"
]

class AuditLogEntry(BaseModel):
    audit_id: str
    timestamp: str
    action: str = Field(default="PRIOR_RECOMMENDED", description="One of the 14 audit action types")
    study_id: str
    recommended_prior_id: Optional[str] = None
    selected_prior: Optional[str] = None
    human_decision: Optional[str] = None
    override_reason: Optional[str] = None
    custom_reason_text: Optional[str] = None
    override_notes: Optional[str] = None
    user: str = Field(default="anonymous_user")
    role: str = Field(default="Radiologist")
    user_role: str = Field(default="Radiologist")
    duration_seconds: Optional[float] = None
    retrieval_method: Optional[str] = "ASSISTANT"
    rules_applied: List[str] = Field(default_factory=list)
    score: float = 0.0
    details: Optional[Dict[str, Any]] = Field(default_factory=dict)

class AuditLogResponse(BaseModel):
    total_records: int
    entries: List[AuditLogEntry]

