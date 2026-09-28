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
    recommended_prior_id: Optional[str] = Field(default=None, description="Target prior study ID recommended")
    selected_prior: Optional[str] = Field(default=None, description="Prior study ID confirmed or overridden with (can be None or another prior)")
    human_decision: HumanDecisionState
    override_reason: Optional[OverrideReasonEnum] = None
    custom_reason_text: Optional[str] = None
    override_notes: Optional[str] = None
    user: str = Field(default="Radiologist")
    user_role: str = Field(default="Radiologist")
    duration_seconds: Optional[float] = Field(default=None, description="Time-to-locate in seconds")
    retrieval_method: Optional[str] = Field(default="ASSISTANT", description="ASSISTANT, BASELINE, or MANUAL")

class FeedbackResponse(BaseModel):
    status: str
    audit_id: str
    message: str
    duration_seconds: Optional[float] = None

