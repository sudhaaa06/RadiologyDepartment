from pydantic import BaseModel

class MatchingWeights(BaseModel):
    anatomy: float = 0.25
    modality: float = 0.20
    condition: float = 0.20
    report_context: float = 0.20
    recency: float = 0.10
    laterality: float = 0.05

class Settings(BaseModel):
    app_name: str = "Prior Study Matching Assistant"
    version: str = "1.0.0-phase1"
    weights: MatchingWeights = MatchingWeights()
    min_confidence_threshold: float = 0.35

settings = Settings()
