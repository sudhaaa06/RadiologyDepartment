from typing import List, Optional
from pydantic import BaseModel, Field

class AuditLogEntry(BaseModel):
    audit_id: str
    timestamp: str
    study_id: str
    recommended_prior_id: str
    human_decision: str
    override_reason: Optional[str] = None
    custom_reason_text: Optional[str] = None
    user_role: str
    rules_applied: List[str] = Field(default_factory=list)
    score: float = 0.0

class AuditLogResponse(BaseModel):
    total_records: int
    entries: List[AuditLogEntry]
