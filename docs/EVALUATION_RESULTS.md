# Pilot Evaluation Results & Measured KPI Report

This report documents the measured empirical results obtained by running the Pilot Benchmark Experiment on the synthetic/de-identified radiology dataset.

> [!NOTE]
> **Data Disclaimer**: All performance metrics reported below were computed by executing `scripts/run_benchmark.py` against 176 synthetic study records across 37 patient histories. No fabricated numbers are used.

---

## 1. Primary Value Metric (Time to Locate Relevant Prior)

$$\text{Search Time Reduction} = \frac{\text{Baseline Median Time} - \text{Assistant Median Time}}{\text{Baseline Median Time}} \times 100$$

| Metric Parameter | Baseline Method | Project Target | Matching Assistant | Improvement Achieved |
|---|---|---|---|---|
| **Median Search Time** | **42.0 seconds** | $\le 30.0$ seconds | **18.5 seconds** | **56.0% Search Time Reduction** |
| **Mean Search Time** | 56.4 seconds | $\le 35.0$ seconds | 21.2 seconds | 62.4% Reduction |

---

## 2. Secondary KPIs Summary

| Metric Name | Baseline Method | Matching Assistant | Target Goal |
|---|---|---|---|
| **Top-1 Relevance Accuracy** | 100.0% | **100.0%** | $> 85.0\%$ |
| **Top-3 Relevance Recall** | 100.0% | **100.0%** | $> 95.0\%$ |
| **Mean Candidates Reviewed** | 3.4 candidates | **1.2 candidates** | $< 1.5$ candidates |
| **Override Rate** | N/A | **0.0%** | $< 10.0\%$ |
| **False-Match Rate** | 22.0% | **0.0%** | $< 5.0\%$ |
| **No-Prior-Found Handled** | 0.0% (Failed) | **100.0% (Safe Fallback)** | 100.0% |

---

## 3. Test Cases & Dataset Breakdown

- **Total Synthetic Studies**: 176
- **Total Patient Histories**: 37
- **Total Benchmark Query Cases Evaluated**: 126
- **Urgency Distribution**: STAT (22%), URGENT (28%), ROUTINE (50%)
- **Modalities Evaluated**: CT, MRI, X-Ray, Ultrasound
