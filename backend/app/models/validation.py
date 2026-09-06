from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class StakeholderRatingSubmission(BaseModel):
    evaluator_name: Optional[str] = "Evaluator"
    role: str = Field(default="Radiologist")
    ease_of_finding_priors: int = Field(..., ge=1, le=5)
    clarity_of_recommendation: int = Field(..., ge=1, le=5)
    usefulness_of_evidence: int = Field(..., ge=1, le=5)
    confidence_in_ranking_rationale: int = Field(..., ge=1, le=5)
    ease_of_override: int = Field(..., ge=1, le=5)
    clarity_of_human_control: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None

class ValidationSummaryResponse(BaseModel):
    total_evaluations: int
    averages: Dict[str, float]
    recent_comments: List[str]
