from typing import List, Optional
from app.models.study import RadiologyStudy, MatchRecommendation

class BaselineRetrievalEngine:
    @staticmethod
    def rank_priors(query_study: RadiologyStudy, candidate_pool: List[RadiologyStudy]) -> List[MatchRecommendation]:
        # Exclude query study itself and future studies
        candidates = [
            s for s in candidate_pool
            if s.study_id != query_study.study_id
            and s.patient_id_hash == query_study.patient_id_hash
            and s.study_date <= query_study.study_date
        ]

        if not candidates:
            return []

        # Strict deterministic filter: Same modality & Same body region
        exact_matches = [
            s for s in candidates
            if s.modality.lower().strip() == query_study.modality.lower().strip()
            and s.body_region.lower().strip() == query_study.body_region.lower().strip()
        ]

        selected_candidates = exact_matches if exact_matches else candidates
        sorted_priors = sorted(selected_candidates, key=lambda x: x.study_date, reverse=True)

        recommendations = []
        for rank, prior in enumerate(sorted_priors, start=1):
            evidence = [
                f"✓ Baseline filter: Same patient hash ({prior.patient_id_hash})",
                f"✓ Baseline sort: Simple recency sort ({prior.study_date})"
            ]
            if prior.modality.lower().strip() == query_study.modality.lower().strip():
                evidence.append(f"✓ Exact modality match ({prior.modality})")
            if prior.body_region.lower().strip() == query_study.body_region.lower().strip():
                evidence.append(f"✓ Exact body region match ({prior.body_region})")

            # Simple baseline score on 0-100 scale
            score = max(10.0, round(100.0 - (rank - 1) * 15.0, 1))
            ev_level = "STRONG" if score >= 85.0 else ("MODERATE" if score >= 60.0 else "LIMITED")

            recommendations.append(
                MatchRecommendation(
                    study_id=prior.study_id,
                    rank=rank,
                    score=score,
                    study_date=prior.study_date,
                    modality=prior.modality,
                    body_region=prior.body_region,
                    anatomy=prior.anatomy,
                    condition_concept=prior.condition_concept,
                    evidence=evidence,
                    evidence_level=ev_level,
                    source_centre=prior.source_centre,
                    contrast_used=prior.contrast_used,
                    is_clinically_relevant_prior=prior.is_clinically_relevant_prior
                )
            )

        return recommendations

