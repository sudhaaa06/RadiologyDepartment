from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class RadiologyStudy(BaseModel):
    study_id: str = Field(..., description="Unique study identifier")
    patient_id_hash: str = Field(..., description="Anonymized patient hash")
    study_date: str = Field(..., description="ISO 8601 acquisition date (YYYY-MM-DD)")
    urgency: str = Field(default="ROUTINE", description="STAT, URGENT, ROUTINE")
    department: Optional[str] = None
    source_centre: str = Field(default="Main PACS")
    modality: str = Field(..., description="Acquisition modality (CT, MRI, X-Ray, etc.)")
    body_region: str = Field(..., description="Primary body region")
    anatomy: Optional[str] = None
    laterality: Optional[str] = "N/A"
    clinical_indication: str
    condition_concept: str
    report_summary: str
    report_concepts: List[str] = Field(default_factory=list)
    exam_type: str
    contrast_used: Optional[bool] = None
    comparison_available: bool = True
    prior_study_ids: List[str] = Field(default_factory=list)
    is_clinically_relevant_prior: Optional[bool] = False

class MatchRecommendation(BaseModel):
    study_id: str
    rank: int
    score: float = Field(..., description="Normalized 0-100 score")
    study_date: str
    modality: str
    body_region: str
    anatomy: Optional[str]
    condition_concept: str
    evidence: List[str]
    score_breakdown: Dict[str, float] = Field(default_factory=dict)
    positive_signals: List[str] = Field(default_factory=list)
    negative_signals: List[str] = Field(default_factory=list)
    concept_overlap_summary: str = ""
    relevance_explanation_tag: Optional[str] = None
    is_clinically_relevant_prior: Optional[bool] = False

class MatchResponse(BaseModel):
    current_study_id: str
    patient_id_hash: str
    urgency: str = "ROUTINE"
    low_confidence_warning: bool = False
    warning_message: Optional[str] = None
    recommendations: List[MatchRecommendation]
    baseline_top_recommendation: Optional[MatchRecommendation] = None
