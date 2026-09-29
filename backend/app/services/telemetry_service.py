import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Optional, Any
from app.models.telemetry import TelemetryEvent, TaskRecord

TELEMETRY_FILE = Path(__file__).parent.parent.parent.parent / "data" / "telemetry_logs.json"

class TelemetryService:
    def __init__(self, storage_path: Path = TELEMETRY_FILE):
        self.storage_path = storage_path
        self._events: List[TelemetryEvent] = []
        self._tasks: Dict[str, TaskRecord] = {}
        self._load()

    def _load(self):
        if self.storage_path.exists():
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for e in data.get("events", []):
                        self._events.append(TelemetryEvent(**e))
                    for t in data.get("tasks", []):
                        task = TaskRecord(**t)
                        self._tasks[task.task_id] = task
            except Exception as e:
                print(f"Error loading telemetry: {e}")

    def _save(self):
        try:
            self.storage_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump({
                    "events": [e.model_dump() for e in self._events],
                    "tasks": [t.model_dump() for t in self._tasks.values()]
                }, f, indent=2)
        except Exception as e:
            print(f"Error saving telemetry: {e}")

    def record_event(
        self,
        task_id: str,
        session_id: str,
        case_id_hash: str,
        workflow_type: str,
        event_type: str,
        selected_prior_study: Optional[str] = None,
        override_status: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        timestamp: Optional[str] = None
    ) -> TelemetryEvent:
        now_iso = timestamp or datetime.now(timezone.utc).isoformat()
        event = TelemetryEvent(
            event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
            task_id=task_id,
            session_id=session_id,
            case_id_hash=case_id_hash,
            workflow_type=workflow_type,
            event_type=event_type,
            timestamp=now_iso,
            selected_prior_study=selected_prior_study,
            override_status=override_status,
            details=details or {}
        )
        self._events.append(event)

        # Update or create corresponding TaskRecord
        if task_id not in self._tasks:
            self._tasks[task_id] = TaskRecord(
                task_id=task_id,
                session_id=session_id,
                case_id_hash=case_id_hash,
                workflow_type=workflow_type,
                start_timestamp=now_iso
            )
        task = self._tasks[task_id]

        if event_type == "search_started":
            pass
        elif event_type == "candidate_displayed":
            if not task.first_candidate_timestamp:
                task.first_candidate_timestamp = now_iso
                task.time_to_first_candidate_seconds = self._calc_diff_seconds(task.start_timestamp, now_iso)
        elif event_type == "candidate_opened":
            task.candidates_reviewed_count += 1
        elif event_type in ("candidate_selected", "human_confirmed", "human_overrode"):
            if not task.selected_candidate_timestamp:
                task.selected_candidate_timestamp = now_iso
                task.time_to_selected_prior_seconds = self._calc_diff_seconds(task.start_timestamp, now_iso)
            if selected_prior_study:
                task.selected_prior_study = selected_prior_study
            if override_status:
                task.override_status = override_status
        elif event_type == "workflow_completed":
            task.completion_timestamp = now_iso
            task.total_workflow_time_seconds = self._calc_diff_seconds(task.start_timestamp, now_iso)
            if not task.selected_candidate_timestamp:
                task.selected_candidate_timestamp = now_iso
                task.time_to_selected_prior_seconds = task.total_workflow_time_seconds

        self._save()
        return event

    def _calc_diff_seconds(self, t_start: str, t_end: str) -> float:
        try:
            d_start = datetime.fromisoformat(t_start.replace("Z", "+00:00"))
            d_end = datetime.fromisoformat(t_end.replace("Z", "+00:00"))
            return max(0.1, round((d_end - d_start).total_seconds(), 2))
        except Exception:
            return 1.0

    def get_task(self, task_id: str) -> Optional[TaskRecord]:
        return self._tasks.get(task_id)

    def list_tasks(self, workflow_type: Optional[str] = None) -> List[TaskRecord]:
        tasks = list(self._tasks.values())
        if workflow_type:
            tasks = [t for t in tasks if t.workflow_type.lower() == workflow_type.lower()]
        return sorted(tasks, key=lambda x: x.start_timestamp, reverse=True)

    def get_summary(self) -> Dict[str, Any]:
        tasks = list(self._tasks.values())
        baseline_tasks = [t for t in tasks if t.workflow_type == "baseline" and t.total_workflow_time_seconds]
        assistant_tasks = [t for t in tasks if t.workflow_type == "assistant" and t.total_workflow_time_seconds]

        def get_median(nums: List[float]) -> float:
            if not nums:
                return 0.0
            sorted_nums = sorted(nums)
            mid = len(sorted_nums) // 2
            if len(sorted_nums) % 2 == 0:
                return round((sorted_nums[mid - 1] + sorted_nums[mid]) / 2.0, 2)
            return round(sorted_nums[mid], 2)

        def get_p90(nums: List[float]) -> float:
            if not nums:
                return 0.0
            sorted_nums = sorted(nums)
            idx = int(len(sorted_nums) * 0.9)
            return round(sorted_nums[min(idx, len(sorted_nums) - 1)], 2)

        b_times = [t.total_workflow_time_seconds for t in baseline_tasks]
        a_times = [t.total_workflow_time_seconds for t in assistant_tasks]

        b_median = get_median(b_times)
        a_median = get_median(a_times)
        time_saved = max(0.0, round(b_median - a_median, 2)) if (b_median and a_median) else 0.0
        pct_reduction = round((time_saved / b_median * 100), 1) if b_median > 0 else 0.0

        return {
            "total_tasks": len(tasks),
            "baseline_task_count": len(baseline_tasks),
            "assistant_task_count": len(assistant_tasks),
            "baseline_median_seconds": b_median,
            "assistant_median_seconds": a_median,
            "baseline_p90_seconds": get_p90(b_times),
            "assistant_p90_seconds": get_p90(a_times),
            "time_saved_seconds": time_saved,
            "percentage_time_reduction": f"{pct_reduction}%",
            "recent_tasks": [t.model_dump() for t in tasks[:15]]
        }

telemetry_service = TelemetryService()
