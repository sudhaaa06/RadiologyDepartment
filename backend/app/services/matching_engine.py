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
            # Half-life curve over 1.5 years
            recency_score = math.exp(-days_diff / (365.0 * 1.5))
            return recency_score, days_diff
        except Exception:
            return 0.5, 0

    def calculate_report_context_score(self, current_concepts: List[str], prior_concepts: List[str]) -> Tuple[float, List[str], int, int]:
        if not current_concepts or not prior_concepts:
            return 0.0, [], 0, max(len(current_concepts or []), len(prior_concepts or []))
        
        set_curr = {c.lower().strip() for c in current_concepts}
        set_prior = {c.lower().strip() for c in prior_concepts}
        
        intersection = set_curr.intersection(set_prior)
        union = set_curr.union(set_prior)
        
        jaccard_score = len(intersection) / len(union) if union else 0.0
        return jaccard_score, sorted(list(intersection)), len(intersection), len(union)

    def score_candidate(self, query: RadiologyStudy, candidate: RadiologyStudy) -> Dict[str, Any]:
        evidence = [f"✓ Same patient identifier ({query.patient_id_hash})"]
        positive_signals = [f"✓ Same patient identifier ({query.patient_id_hash})"]
        negative_signals = []
        rule_details: Dict[str, Dict[str, Any]] = {}
        
        # 1. Terminology Normalization
        q_modality, q_mod_norm = TerminologyNormalizer.normalize_modality(query.modality)
        c_modality, c_mod_norm = TerminologyNormalizer.normalize_modality(candidate.modality)
        
        q_region, q_reg_norm = TerminologyNormalizer.normalize_body_region(query.body_region, query.exam_type)
        c_region, c_reg_norm = TerminologyNormalizer.normalize_body_region(candidate.body_region, candidate.exam_type)

        q_condition, q_cond_norm = TerminologyNormalizer.normalize_condition(query.clinical_indication, query.condition_concept)
        c_condition, c_cond_norm = TerminologyNormalizer.normalize_condition(candidate.clinical_indication, candidate.condition_concept)

        # 2. Points breakdown (Prototype weights: 25, 20, 20, 20, 10, 3, 2 = 100 max)
        
        # Anatomy (25.0 points max)
        max_anatomy = self.weights.anatomy * 100.0  # 25.0
        if q_region == c_region and q_region != "Unknown":
            anatomy_pts = max_anatomy
            norm_note = f" (normalized from '{candidate.body_region}')" if c_reg_norm and candidate.body_region != c_region else ""
            msg = f"✓ Matching body region: {c_region}{norm_note}"
            evidence.append(msg)
            positive_signals.append(msg)
            if query.anatomy and candidate.anatomy and query.anatomy.lower() == candidate.anatomy.lower():
                msg_anat = f"✓ Matching specific anatomy: {candidate.anatomy}"
                evidence.append(msg_anat)
                positive_signals.append(msg_anat)
            rule_details["Anatomy"] = {
                "points_awarded": round(anatomy_pts, 1),
                "max_points": round(max_anatomy, 1),
                "matched": True,
                "status": "EXACT_OR_CANONICAL_MATCH",
                "description": f"Body region matches {c_region}{norm_note}",
                "rule": "Full 25 pts awarded for matching normalized anatomy/body region"
            }
        else:
            anatomy_pts = 0.0
            msg_warn = f"⚠️ Body region mismatch: Query ({q_region}) vs Prior ({c_region})"
            evidence.append(msg_warn)
            negative_signals.append(msg_warn)
            rule_details["Anatomy"] = {
                "points_awarded": 0.0,
                "max_points": round(max_anatomy, 1),
                "matched": False,
                "status": "MISMATCH",
                "description": f"Anatomy differs: {q_region} vs {c_region}",
                "rule": "0 pts awarded due to discordant anatomical region"
            }

        # Modality (20.0 points max)
        max_modality = self.weights.modality * 100.0  # 20.0
        if q_modality == c_modality and q_modality != "Unknown":
            modality_pts = max_modality
            norm_note = f" (normalized from '{candidate.modality}')" if c_mod_norm and candidate.modality != c_modality else ""
            msg = f"✓ Matching modality: {c_modality}{norm_note}"
            evidence.append(msg)
            positive_signals.append(msg)
            rule_details["Modality"] = {
                "points_awarded": round(modality_pts, 1),
                "max_points": round(max_modality, 1),
                "matched": True,
                "status": "EXACT_OR_CANONICAL_MATCH",
                "description": f"Modality matches {c_modality}{norm_note}",
                "rule": "Full 20 pts awarded for matching acquisition modality"
            }
        elif (q_modality, c_modality) in [("CT", "X-Ray"), ("X-Ray", "CT"), ("CT", "MRI"), ("MRI", "CT")]:
            modality_pts = 12.0
            msg = f"✓ Clinically comparable cross-modality: {q_modality} to {c_modality}"
            evidence.append(msg)
            positive_signals.append(msg)
            negative_signals.append(f"⚠️ Cross-modality comparison ({q_modality} vs {c_modality})")
            rule_details["Modality"] = {
                "points_awarded": 12.0,
                "max_points": round(max_modality, 1),
                "matched": True,
                "status": "CROSS_MODALITY_COMPARABLE",
                "description": f"Cross-modality comparison ({q_modality} to {c_modality})",
                "rule": "Partial 12 pts awarded for clinically useful cross-modality correlation"
            }
        else:
            modality_pts = 0.0
            msg_warn = f"⚠️ Modality mismatch: Query ({q_modality}) vs Prior ({c_modality})"
            evidence.append(msg_warn)
            negative_signals.append(msg_warn)
            rule_details["Modality"] = {
                "points_awarded": 0.0,
                "max_points": round(max_modality, 1),
                "matched": False,
                "status": "MISMATCH",
                "description": f"Discordant modality ({q_modality} vs {c_modality})",
                "rule": "0 pts awarded for non-comparable modalities"
            }

        # Condition (20.0 points max)
        max_condition = self.weights.condition * 100.0  # 20.0
        if q_condition == c_condition and q_condition != "General Exam":
            condition_pts = max_condition
            msg = f"✓ Matching condition concept: {c_condition}"
            evidence.append(msg)
            positive_signals.append(msg)
            rule_details["Condition"] = {
                "points_awarded": round(condition_pts, 1),
                "max_points": round(max_condition, 1),
                "matched": True,
                "status": "MATCH",
                "description": f"Pathology concept matches '{c_condition}'",
                "rule": "Full 20 pts awarded for matching clinical pathology"
            }
        else:
            condition_pts = 0.0
            msg_warn = f"⚠️ Condition concept mismatch: Query ({q_condition}) vs Prior ({c_condition})"
            evidence.append(msg_warn)
            negative_signals.append(msg_warn)
            rule_details["Condition"] = {
                "points_awarded": 0.0,
                "max_points": round(max_condition, 1),
                "matched": False,
                "status": "MISMATCH",
                "description": f"Indication/pathology differs: '{q_condition}' vs '{c_condition}'",
                "rule": "0 pts awarded due to different diagnostic focus"
            }

        # Report Context (20.0 points max)
        max_report = self.weights.report_context * 100.0  # 20.0
        report_score, matching_concepts, matched_ct, total_ct = self.calculate_report_context_score(query.report_concepts, candidate.report_concepts)
        report_pts = round(report_score * max_report, 1)
        concept_overlap_summary = f"Report concept overlap: {matched_ct}/{total_ct} concepts matched"
        
        if matching_concepts:
            msg = f"✓ Overlapping report concepts ({len(matching_concepts)}): {', '.join(matching_concepts)}"
            evidence.append(msg)
            positive_signals.append(msg)
        else:
            msg_warn = "⚠️ No overlapping report context terms found"
            evidence.append(msg_warn)
            negative_signals.append(msg_warn)

        rule_details["Report context"] = {
            "points_awarded": report_pts,
            "max_points": round(max_report, 1),
            "matched": bool(matching_concepts),
            "status": "OVERLAP" if matching_concepts else "NO_OVERLAP",
            "description": f"{matched_ct} of {total_ct} shared clinical keywords ({', '.join(matching_concepts) if matching_concepts else 'None'})",
            "rule": "Jaccard similarity of extracted report findings scaled to 20 pts"
        }

        # Recency (10.0 points max)
        max_recency = self.weights.recency * 100.0  # 10.0
        recency_score, days_diff = self.calculate_recency_score(query.study_date, candidate.study_date)
        recency_pts = round(recency_score * max_recency, 1)
        months_approx = round(days_diff / 30.4)
        msg_time = f"✓ Time interval: {months_approx} months prior ({candidate.study_date})"
        evidence.append(msg_time)
        positive_signals.append(msg_time)

        if days_diff > 730:
            negative_signals.append(f"⚠️ Study performed over 2 years prior ({round(days_diff / 365, 1)} years ago)")
        elif days_diff > 365:
            negative_signals.append(f"⚠️ Study performed over 1 year prior ({months_approx} months ago)")

        rule_details["Recency"] = {
            "points_awarded": recency_pts,
            "max_points": round(max_recency, 1),
            "matched": days_diff <= 365,
            "status": "RECENT" if days_diff <= 365 else "HISTORIC",
            "description": f"{days_diff} days ({months_approx} months) elapsed between exams",
            "rule": "Exponential half-life decay function over 18 months"
        }

        # Laterality (3.0 points max)
        max_laterality = self.weights.laterality * 100.0  # 3.0
        q_lat = (query.laterality or "N/A").strip().upper()
        c_lat = (candidate.laterality or "N/A").strip().upper()
        if q_lat == c_lat or q_lat in ["N/A", "BILATERAL", "NONE"] or c_lat in ["N/A", "BILATERAL", "NONE"]:
            laterality_pts = max_laterality
            if q_lat not in ["N/A", "BILATERAL", "NONE"] and c_lat not in ["N/A", "BILATERAL", "NONE"]:
                msg = f"✓ Matching laterality: {c_lat}"
                evidence.append(msg)
                positive_signals.append(msg)
            else:
                positive_signals.append("✓ Laterality not conflicting / systemic")
            rule_details["Laterality"] = {
                "points_awarded": round(laterality_pts, 1),
                "max_points": round(max_laterality, 1),
                "matched": True,
                "status": "COMPATIBLE",
                "description": f"Laterality compatible ({q_lat} vs {c_lat})",
                "rule": "Full 3 pts for matching laterality or non-lateral study"
            }
        else:
            laterality_pts = 0.0
            msg_warn = f"⚠️ Laterality conflict: Query ({q_lat}) vs Prior ({c_lat})"
            evidence.append(msg_warn)
            negative_signals.append(msg_warn)
            rule_details["Laterality"] = {
                "points_awarded": 0.0,
                "max_points": round(max_laterality, 1),
                "matched": False,
                "status": "CONFLICT",
                "description": f"Opposite or conflicting laterality: {q_lat} vs {c_lat}",
                "rule": "0 pts awarded due to laterality discrepancy"
            }

        # Exam Type (2.0 points max)
        max_exam = self.weights.exam_type * 100.0  # 2.0
        q_exam = (query.exam_type or "").strip().lower()
        c_exam = (candidate.exam_type or "").strip().lower()
        if q_exam and c_exam and (q_exam == c_exam or q_exam in c_exam or c_exam in q_exam):
            exam_pts = max_exam
            msg = f"✓ Compatible exam type: {candidate.exam_type}"
            evidence.append(msg)
            positive_signals.append(msg)
            rule_details["Exam Type"] = {
                "points_awarded": round(exam_pts, 1),
                "max_points": round(max_exam, 1),
                "matched": True,
                "status": "MATCH",
                "description": f"Exam protocol matches '{candidate.exam_type}'",
                "rule": "2 pts for concordant exam acquisition protocol"
            }
        else:
            exam_pts = 0.0
            if q_exam and c_exam:
                negative_signals.append(f"⚠️ Exam type protocol differs: Query ({query.exam_type}) vs Prior ({candidate.exam_type})")
            rule_details["Exam Type"] = {
                "points_awarded": 0.0,
                "max_points": round(max_exam, 1),
                "matched": False,
                "status": "DIFFERING_PROTOCOL",
                "description": f"Protocols differ: '{query.exam_type}' vs '{candidate.exam_type}'",
                "rule": "0 pts for different exam acquisition protocol"
            }

        # Additional Negative Signals: Contrast mismatch
        if query.contrast_used is not None and candidate.contrast_used is not None:
            if query.contrast_used and not candidate.contrast_used:
                negative_signals.append("⚠️ Contrast protocol mismatch: Query (Contrast Enhanced) vs Prior (Non-Contrast)")
            elif not query.contrast_used and candidate.contrast_used:
                negative_signals.append("⚠️ Contrast protocol mismatch: Query (Non-Contrast) vs Prior (Contrast Enhanced)")

        # External Centre note
        if candidate.source_centre and candidate.source_centre != "Main PACS":
            evidence.append(f"ℹ️ Sourced from external network: {candidate.source_centre}")

        # Total 0-100 Score
        total_score = round(anatomy_pts + modality_pts + condition_pts + report_pts + recency_pts + laterality_pts + exam_pts, 1)
        total_score = min(100.0, max(0.0, total_score))

        score_breakdown = {
            "Anatomy": anatomy_pts,
            "Modality": modality_pts,
            "Condition": condition_pts,
            "Report context": report_pts,
            "Recency": recency_pts,
            "Laterality": laterality_pts,
            "Exam Type": exam_pts
        }

        # Evidence tier
        if total_score >= settings.evidence_strong_threshold:
            evidence_level = "STRONG"
        elif total_score >= settings.evidence_moderate_threshold:
            evidence_level = "MODERATE"
        else:
            evidence_level = "LIMITED"

        # Normalization records for inspectable normalization
        norm_records = TerminologyNormalizer.get_normalization_records(
            candidate.modality,
            candidate.body_region,
            candidate.clinical_indication,
            candidate.exam_type,
            candidate.condition_concept
        )

        return {
            "score": float(total_score),
            "evidence": evidence,
            "score_breakdown": score_breakdown,
            "rule_details": rule_details,
            "positive_signals": positive_signals,
            "negative_signals": negative_signals,
            "concept_overlap_summary": concept_overlap_summary,
            "days_diff": days_diff,
            "evidence_level": evidence_level,
            "normalization_records": norm_records
        }

    def match_priors(self, query_study: RadiologyStudy, candidate_pool: List[RadiologyStudy]) -> MatchResponse:
        candidates = [
            s for s in candidate_pool
            if s.study_id != query_study.study_id
            and s.patient_id_hash == query_study.patient_id_hash
            and s.study_date <= query_study.study_date
        ]

        # Feature 8: Low-Evidence / No-Prior State
        if not candidates:
            return MatchResponse(
                current_study_id=query_study.study_id,
                patient_id_hash=query_study.patient_id_hash,
                urgency=query_study.urgency,
                low_confidence_warning=True,
                warning_message="Limited retrieval evidence — No historical prior studies available for this patient.",
                evidence_level="LIMITED",
                no_prior_found=True,
                recommendations=[],
                baseline_recommendations=[],
                baseline_top_recommendation=None,
                comparison_summary={
                    "rank_match": True,
                    "baseline_top_id": None,
                    "assistant_top_id": None,
                    "rationale_difference": "Neither engine found any prior studies for this patient in the PACS archive."
                }
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
                    rule_details=res_dict["rule_details"],
                    positive_signals=res_dict["positive_signals"],
                    negative_signals=res_dict["negative_signals"],
                    evidence_level=res_dict["evidence_level"],
                    concept_overlap_summary=res_dict["concept_overlap_summary"],
                    relevance_explanation_tag=relevance_explanation,
                    is_clinically_relevant_prior=cand.is_clinically_relevant_prior,
                    source_centre=cand.source_centre,
                    contrast_used=cand.contrast_used,
                    normalization_records=res_dict["normalization_records"]
                )
            )

        # Baseline Retrieval Engine
        baseline_recs = BaselineRetrievalEngine.rank_priors(query_study, candidate_pool)
        baseline_top = baseline_recs[0] if baseline_recs else None

        top_score = recommendations[0].score if recommendations else 0.0
        
        # Evidence tiers
        if top_score >= settings.evidence_strong_threshold:
            overall_evidence_level = "STRONG"
            low_confidence = False
            warning_msg = None
        elif top_score >= settings.evidence_moderate_threshold:
            overall_evidence_level = "MODERATE"
            low_confidence = False
            warning_msg = None
        else:
            overall_evidence_level = "LIMITED"
            low_confidence = True
            warning_msg = f"Limited retrieval evidence ({top_score:.1f}/100) — No strongly comparable prior study identified. Assistant does not force a recommendation."

        # Feature 2: Comparison Summary Generation
        assistant_top = recommendations[0] if recommendations else None
        rank_match = (baseline_top and assistant_top and baseline_top.study_id == assistant_top.study_id)
        
        if rank_match:
            rationale_diff = f"Concordant: Both Baseline and Assistant recommend {assistant_top.study_id} as the top prior comparison."
        elif baseline_top and assistant_top:
            rationale_diff = (
                f"Discordant: Baseline selected {baseline_top.study_id} (Date: {baseline_top.study_date}, Modality: {baseline_top.modality}) based purely on recency/modality filter. "
                f"Assistant ranked {assistant_top.study_id} higher (Score: {assistant_top.score}/100) due to matching condition concept ('{assistant_top.condition_concept}'), "
                f"deeper report context overlap, and normalized terminology alignment."
            )
        else:
            rationale_diff = "No comparable candidates available."

        comparison_summary = {
            "rank_match": bool(rank_match),
            "baseline_top_id": baseline_top.study_id if baseline_top else None,
            "assistant_top_id": assistant_top.study_id if assistant_top else None,
            "baseline_top_score": baseline_top.score if baseline_top else 0.0,
            "assistant_top_score": assistant_top.score if assistant_top else 0.0,
            "rationale_difference": rationale_diff
        }

        return MatchResponse(
            current_study_id=query_study.study_id,
            patient_id_hash=query_study.patient_id_hash,
            urgency=query_study.urgency,
            low_confidence_warning=low_confidence,
            warning_message=warning_msg,
            recommendations=recommendations,
            baseline_top_recommendation=baseline_top,
            baseline_recommendations=baseline_recs,
            comparison_summary=comparison_summary,
            evidence_level=overall_evidence_level,
            no_prior_found=False
        )

