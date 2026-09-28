from pydantic import BaseModel

class MatchingWeights(BaseModel):
    anatomy: float = 0.25
    modality: float = 0.20
    condition: float = 0.20
    report_context: float = 0.20
    recency: float = 0.10
    laterality: float = 0.03
    exam_type: float = 0.02

class Settings(BaseModel):
    app_name: str = "Prior Study Matching Assistant"
    version: str = "2.0.0-phase2"
    weights: MatchingWeights = MatchingWeights()
    min_confidence_threshold: float = 0.35
    # Evidence thresholds (0-100 scale)
    evidence_strong_threshold: float = 85.0
    evidence_moderate_threshold: float = 60.0

settings = Settings()

