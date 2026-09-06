import math
from datetime import datetime
from typing import List, Tuple, Dict, Any, Optional
from app.core.config import settings, MatchingWeights
from app.models.study import RadiologyStudy, MatchRecommendation, MatchResponse
from app.services.normalization import TerminologyNormalizer
from app.services.baseline_engine import BaselineRetrievalEngine

class ExplainableMatchingEngine:
    def __init__(self, weights: MatchingWeights = settings.weights):
        self.weights = weights

    def calculate_recency_score(self, query_date_str: str, prior_date_str: str) -> Tuple[float, int]:
        try:
            d_query = datetime.strptime(query_date_str, "%Y-%m-%d")
            d_prior = datetime.strptime(prior_date_str, "%Y-%m-%d")
            days_diff = (d_query - d_prior).days
            if days_diff < 0:
                return 0.0, 0
            recency_score = math.exp(-days_diff / (365.0 * 1.5))
            return recency_score, days_diff
        except Exception:
            return 0.5, 0

    def calculate_report_context_score(self, current_concepts: List[str], prior_concepts: List[str]) -> Tuple[float, List[str], int, int]:
        if not current_concepts or not prior_concepts:
            return 0.0, [], 0, max(len(current_concepts), len(prior_concepts))
        
        set_curr = {c.lower().strip() for c in current_concepts}
        set_prior = {c.lower().strip() for c in prior_concepts}
        
        intersection = set_curr.intersection(set_prior)
        union = set_curr.union(set_prior)
        
        jaccard_score = len(intersection) / len(union) if union else 0.0
        return jaccard_score, list(intersection), len(intersection), len(union)

    def score_candidate(self, query: RadiologyStudy, candidate: RadiologyStudy) -> Dict[str, Any]:
        evidence = [f"✓ Same patient identifier ({query.patient_id_hash})"]
        positive_signals = [f"✓ Same patient identifier ({query.patient_id_hash})"]
        negative_signals = []
        
        # 1. Terminology Normalization
        q_modality, _ = TerminologyNormalizer.normalize_modality(query.modality)
        c_modality, _ = TerminologyNormalizer.normalize_modality(candidate.modality)
        
        q_region, _ = TerminologyNormalizer.normalize_body_region(query.body_region, query.exam_type)
        c_region, _ = TerminologyNormalizer.normalize_body_region(candidate.body_region, candidate.exam_type)

        q_condition, _ = TerminologyNormalizer.normalize_condition(query.clinical_indication, query.condition_concept)
        c_condition, _ = TerminologyNormalizer.normalize_condition(candidate.clinical_indication, candidate.condition_concept)

        # 2. Points breakdown (scaled to 100 max)
        # Anatomy (25 points max)
        if q_region == c_region and q_region != "Unknown":
            anatomy_pts = 25.0
            msg = f"✓ Matching body region: {c_region} (normalized from '{candidate.body_region}')"
            evidence.append(msg)
            positive_signals.append(msg)
            if query.anatomy and candidate.anatomy and query.anatomy.lower() == candidate.anatomy.lower():
                msg_anat = f"✓ Matching specific anatomy: {candidate.anatomy}"
                evidence.append(msg_anat)
                positive_signals.append(msg_anat)
        else:
            anatomy_pts = 0.0
            msg_warn = f"⚠️ Body region mismatch: Query ({q_region}) vs Prior ({c_region})"
            evidence.append(msg_warn)
            negative_signals.append(msg_warn)

        # Modality (20 points max)
        if q_modality == c_modality and q_modality != "Unknown":
            modality_pts = 20.0
            msg = f"✓ Matching modality: {c_modality}"
            evidence.append(msg)
            positive_signals.append(msg)
        elif (q_modality, c_modality) in [("CT", "X-Ray"), ("X-Ray", "CT"), ("CT", "MRI"), ("MRI", "CT")]:
            modality_pts = 12.0
            msg = f"✓ Clinically comparable cross-modality: {q_modality} to {c_modality}"
            evidence.append(msg)
            positive_signals.append(msg)
            negative_signals.append(f"⚠️ Cross-modality comparison ({q_modality} vs {c_modality})")
        else:
            modality_pts = 2.0
            msg_warn = f"⚠️ Modality mismatch: Query ({q_modality}) vs Prior ({c_modality})"
            evidence.append(msg_warn)
            negative_signals.append(msg_warn)

        # Condition (20 points max)
        if q_condition == c_condition and q_condition != "General Exam":
            condition_pts = 20.0
            msg = f"✓ Matching condition concept: {c_condition}"
            evidence.append(msg)
            positive_signals.append(msg)
        else:
            condition_pts = 0.0
            msg_warn = f"⚠️ Condition concept mismatch: Query ({q_condition}) vs Prior ({c_condition})"
            evidence.append(msg_warn)
            negative_signals.append(msg_warn)

        # Report Context (20 points max)
        report_score, matching_concepts, matched_ct, total_ct = self.calculate_report_context_score(query.report_concepts, candidate.report_concepts)
        report_pts = round(report_score * 20.0, 1)
        concept_overlap_summary = f"Report concept overlap: {matched_ct}/{total_ct} concepts matched"
        
        if matching_concepts:
            msg = f"✓ Overlapping report concepts: {matching_concepts}"
            evidence.append(msg)
            positive_signals.append(msg)
        else:
            msg_warn = "⚠️ No overlapping report context terms found"
            evidence.append(msg_warn)
            negative_signals.append(msg_warn)

        # Recency (10 points max)
        recency_score, days_diff = self.calculate_recency_score(query.study_date, candidate.study_date)
        recency_pts = round(recency_score * 10.0, 1)
        months_approx = round(days_diff / 30.4)
        msg_time = f"✓ Time interval: {months_approx} months prior ({candidate.study_date})"
        evidence.append(msg_time)
        positive_signals.append(msg_time)

        if days_diff > 365:
            negative_signals.append(f"⚠️ Study performed over 1 year prior ({months_approx} months ago)")

        # Laterality (5 points max)
        q_lat = query.laterality or "N/A"
        c_lat = candidate.laterality or "N/A"
        if q_lat == c_lat or q_lat == "N/A" or c_lat == "N/A":
            laterality_pts = 5.0
            if q_lat != "N/A":
                msg = f"✓ Matching laterality: {c_lat}"
                evidence.append(msg)
                positive_signals.append(msg)
            else:
                positive_signals.append("✓ Laterality not applicable / compatible")
        else:
            laterality_pts = 0.0
            msg_warn = f"⚠️ Laterality conflict: Query ({q_lat}) vs Prior ({c_lat})"
            evidence.append(msg_warn)
            negative_signals.append(msg_warn)

        # Total 0-100 Score
        total_score = round(anatomy_pts + modality_pts + condition_pts + report_pts + recency_pts + laterality_pts)
        total_score = min(100, max(0, total_score))

        score_breakdown = {
            "Anatomy": anatomy_pts,
            "Modality": modality_pts,
            "Condition": condition_pts,
            "Report context": report_pts,
            "Recency": recency_pts,
            "Laterality": laterality_pts
        }

        return {
            "score": float(total_score),
            "evidence": evidence,
            "score_breakdown": score_breakdown,
            "positive_signals": positive_signals,
            "negative_signals": negative_signals,
            "concept_overlap_summary": concept_overlap_summary,
            "days_diff": days_diff
        }

    def match_priors(self, query_study: RadiologyStudy, candidate_pool: List[RadiologyStudy]) -> MatchResponse:
        candidates = [
            s for s in candidate_pool
            if s.study_id != query_study.study_id
            and s.patient_id_hash == query_study.patient_id_hash
            and s.study_date <= query_study.study_date
        ]

        if not candidates:
            return MatchResponse(
                current_study_id=query_study.study_id,
                patient_id_hash=query_study.patient_id_hash,
                urgency=query_study.urgency,
                low_confidence_warning=True,
                warning_message="Limited retrieval evidence — No historical prior studies available for this patient.",
                recommendations=[]
            )

        scored_candidates = []
        for cand in candidates:
            res_dict = self.score_candidate(query_study, cand)
            scored_candidates.append((cand, res_dict))

        # Sort descending by score, then by study_date descending
        scored_candidates.sort(key=lambda x: (x[1]["score"], x[0].study_date), reverse=True)

        recommendations = []
        for rank, (cand, res_dict) in enumerate(scored_candidates, start=1):
            relevance_explanation = None
            
            # Check if there was a more recent study that was ranked lower due to condition mismatch
            if rank == 1 and len(scored_candidates) > 1:
                more_recent_other = [c for c, r in scored_candidates if r["days_diff"] < res_dict["days_diff"] and r["score"] < res_dict["score"]]
                if more_recent_other:
                    relevance_explanation = "More recent study ranked lower because its anatomy/condition context does not match the current examination as closely."

            recommendations.append(
                MatchRecommendation(
                    study_id=cand.study_id,
                    rank=rank,
                    score=res_dict["score"],
                    study_date=cand.study_date,
                    modality=cand.modality,
                    body_region=cand.body_region,
                    anatomy=cand.anatomy,
                    condition_concept=cand.condition_concept,
                    evidence=res_dict["evidence"],
                    score_breakdown=res_dict["score_breakdown"],
                    positive_signals=res_dict["positive_signals"],
                    negative_signals=res_dict["negative_signals"],
                    concept_overlap_summary=res_dict["concept_overlap_summary"],
                    relevance_explanation_tag=relevance_explanation,
                    is_clinically_relevant_prior=cand.is_clinically_relevant_prior
                )
            )

        baseline_recs = BaselineRetrievalEngine.rank_priors(query_study, candidate_pool)
        baseline_top = baseline_recs[0] if baseline_recs else None

        top_score = recommendations[0].score if recommendations else 0.0
        low_confidence = top_score < (settings.min_confidence_threshold * 100.0)
        warning_msg = "Limited retrieval evidence — No strongly comparable prior study identified." if low_confidence else None

        return MatchResponse(
            current_study_id=query_study.study_id,
            patient_id_hash=query_study.patient_id_hash,
            urgency=query_study.urgency,
            low_confidence_warning=low_confidence,
            warning_message=warning_msg,
            recommendations=recommendations,
            baseline_top_recommendation=baseline_top
        )
