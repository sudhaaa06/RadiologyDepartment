from typing import Optional, Literal
from pydantic import BaseModel, Field

HumanDecisionState = Literal["RECOMMENDED", "REVIEWED", "CONFIRMED", "OVERRIDDEN"]

OverrideReasonEnum = Literal[
    "Wrong anatomy",
    "Wrong modality",
    "Wrong condition",
    "Too old",
    "External study unavailable",
    "Report context mismatch",
    "Better comparison exists",
    "Other"
]

class FeedbackSubmission(BaseModel):
    study_id: str = Field(..., description="Current study ID")
    recommended_prior_id: str = Field(..., description="Target prior study ID being reviewed")
    human_decision: HumanDecisionState
    override_reason: Optional[OverrideReasonEnum] = None
    custom_reason_text: Optional[str] = None
    user_role: str = Field(default="Radiologist")

class FeedbackResponse(BaseModel):
    status: str
    audit_id: str
    message: str
