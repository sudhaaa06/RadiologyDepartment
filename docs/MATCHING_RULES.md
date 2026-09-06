# Matching Rules & Scoring Methodology

This document details the explainable ranking algorithm, term normalization rules, weight configurations, and evidence breakdown formulas used by the Prior Study Matching Assistant.

---

## 1. Terminology Normalization Layer

Before scoring, incoming raw study metadata passes through a deterministic dictionary normalization pipeline:

### Body Region & Modality Maps:
- `"CT thorax"`, `"Chest CT"`, `"CT Chest"`, `"Chest X-Ray"`, `"CXR"` → **Body Region**: `Chest`
- `"CAT Scan"`, `"CT Scan"`, `"Computed Tomography"` → **Modality**: `CT`
- `"MR"`, `"MRI Brain"`, `"Brain MRI"` → **Modality**: `MRI`, **Body Region**: `Brain`
- `"Plain Film"`, `"Radiograph"`, `"X-Ray"` → **Modality**: `X-Ray`

### Condition Concept Map:
- `"lung nodule"`, `"pulmonary nodule"`, `"RUL nodule"`, `"solitary nodule"` → **Condition**: `Pulmonary Nodule`
- `"ischemic stroke"`, `"cva"`, `"stroke follow-up"`, `"infarct"` → **Condition**: `Stroke Follow-up`
- `"hepatic mass"`, `"liver lesion"`, `"hepatic nodule"` → **Condition**: `Liver Lesion`
- `"renal mass"`, `"kidney lesion"` → **Condition**: `Renal Lesion`

---

## 2. Explainable Scoring Function

The composite match score is calculated as a weighted sum of component similarity sub-scores:

$$\text{Match Score} = w_a \cdot S_a + w_m \cdot S_m + w_c \cdot S_c + w_r \cdot S_r + w_t \cdot S_t + w_l \cdot S_l$$

### Sub-Score Definitions & Logic:

1. **Anatomy Similarity ($S_a$)** Weight: `0.25`
   - Exact normalized region & anatomy match = `1.0`
   - Matching body region, different sub-anatomy = `0.7`
   - Adjacent region (e.g. Chest vs Abdomen) = `0.3`
   - Unrelated region = `0.0`

2. **Modality Similarity ($S_m$)** Weight: `0.20`
   - Exact modality match (e.g. CT to CT) = `1.0`
   - Clinically comparable cross-modality (e.g., CT Chest vs CXR for pulmonary process) = `0.6`
   - Non-comparable modality = `0.1`

3. **Condition Similarity ($S_c$)** Weight: `0.20`
   - Exact normalized condition match = `1.0`
   - Related concept family = `0.6`
   - Mismatched condition = `0.0`

4. **Report-Context Similarity ($S_r$)** Weight: `0.20`
   - Jaccard similarity index of report concept tokens:
     $$S_r = \frac{|C_{\text{current}} \cap C_{\text{prior}}|}{|C_{\text{current}} \cup C_{\text{prior}}|}$$

5. **Recency Score ($S_t$)** Weight: `0.10`
   - Exponential decay based on study date delta ($\Delta t$ in days):
     $$S_t = \exp\left(-\frac{\Delta t}{365 \times 1.5}\right)$$
   - Studies performed 6 months ago score $\sim 0.90$, 2 years ago score $\sim 0.25$.

6. **Laterality Similarity ($S_l$)** Weight: `0.05`
   - Exact match (Right == Right) = `1.0`
   - One or both N/A or Bilateral = `0.7`
   - Conflict (Left vs Right) = `0.0`

---

## 3. Evidence Generation Rules

For every candidate prior study scored, the engine builds an explicit human-readable array of evidence strings:

- `"✓ Same patient identifier (PAT_8921A)"`
- `"✓ Matching anatomy: Chest (normalized from 'CT thorax')"`
- `"✓ Matching modality: CT"`
- `"✓ Matching clinical concept: Pulmonary Nodule"`
- `"✓ Overlapping report concepts: ['RUL nodule', 'subpleural']"`
- `"✓ Time interval: 8 months prior (2025-03-10)"`
- `"✓ Matching laterality: Right"`

If composite score $< 0.35$ or mandatory metadata is missing, the system outputs:
> ⚠️ **"Insufficient evidence to confidently rank this prior study."**
