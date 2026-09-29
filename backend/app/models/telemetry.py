from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class TelemetryEvent(BaseModel):
    event_id: str = Field(..., description="Unique event ID")
    task_id: str = Field(..., description="Unique task identifier")
    session_id: str = Field(..., description="User session identifier")
    case_id_hash: str = Field(..., description="De-identified patient/case hash (never real patient ID)")
    workflow_type: str = Field(..., description="'baseline' or 'assistant'")
    event_type: str = Field(
        ...,
        description="One of: workflow_started, search_started, candidate_displayed, candidate_opened, candidate_selected, human_confirmed, human_overrode, workflow_completed"
    )
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp")
    selected_prior_study: Optional[str] = None
    override_status: Optional[str] = Field(None, description="'CONFIRMED', 'OVERRIDDEN', 'NONE', 'NO_PRIOR'")
    details: Optional[Dict[str, Any]] = None

class TaskRecord(BaseModel):
    task_id: str
    session_id: str
    case_id_hash: str
    workflow_type: str  # 'baseline' or 'assistant'
    start_timestamp: str
    first_candidate_timestamp: Optional[str] = None
    selected_candidate_timestamp: Optional[str] = None
    completion_timestamp: Optional[str] = None
    selected_prior_study: Optional[str] = None
    override_status: Optional[str] = "NONE"
    override_reason: Optional[str] = None
    time_to_first_candidate_seconds: Optional[float] = None
    time_to_selected_prior_seconds: Optional[float] = None
    total_workflow_time_seconds: Optional[float] = None
    candidates_reviewed_count: int = 0
    correct_prior_selected: Optional[bool] = None
    error_type: Optional[str] = None

class EvaluationCase(BaseModel):
    case_id: str
    category: str  # 'Routine', 'Urgent', 'Difficult', 'Missing Metadata', 'Different Modality', 'Laterality Mismatch', 'External Centre', 'No Prior'
    difficulty: str  # 'Standard', 'Moderate', 'High'
    urgency: str  # 'ROUTINE', 'URGENT', 'STAT'
    query_study_id: str
    patient_id_hash: str
    ground_truth_prior_ids: List[str]
    expected_challenges: str
    description: str

class ExperimentResultRow(BaseModel):
    case_id: str
    workflow: str  # 'baseline' or 'assistant'
    baseline_time: float
    assistant_time: float
    selected_prior: Optional[str]
    correct: bool
    override: bool
    error_type: Optional[str] = None
    candidates_reviewed: int = 1
    urgency: str
    difficulty: str

class ErrorCategorySummary(BaseModel):
    category: str
    count: int
    percentage: float
    example_case_id: Optional[str] = None
    example_description: Optional[str] = None
    root_cause: str
    potential_improvement: str
