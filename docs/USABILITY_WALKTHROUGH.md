# Usability Walkthrough Guide

This document provides a step-by-step walkthrough of the Prior Study Matching Assistant workstation UI.

---

## 🥼 Step-by-Step Evaluator Walkthrough

### STEP 1: Login & Role Selection
- Open `http://localhost:5173`. Unauthenticated users are automatically redirected to `/login`.
- Click **`[ Login as Radiologist ]`** under Quick Demo Accounts to authenticate as `Dr. Demo` (`RADIOLOGIST`).

### STEP 2: Project Dashboard View
- Review the Home Dashboard displaying System Status (*"Prototype Operational"*), Data Status (*"Synthetic / De-identified"*), Primary KPI (**56.0% Search Time Reduction**), and **33/33 Pytest Acceptance Tests Passed**.

### STEP 3: Workstation & Selectable Demo Journeys
- Switch to **`Workstation`** tab.
- Click **`1. STAT CT Brain (Journey 1)`**:
  - Notice the `STAT` priority badge.
  - View current study metadata and impression.
  - Candidate prior `#ST_JOURNEY1_PRIOR_BEST` is ranked #1 with **91 / 100 Match Score**.
  - Review score breakdown (`Anatomy +25`, `Modality +20`, `Condition +20`, `Report context +13`, `Recency +8`, `Laterality +5`).
  - View tag: *"More recent study ranked lower because its anatomy/condition context does not match..."*

### STEP 4: Human Confirmation Safety Modal
- Click **`[ Confirm Comparison ]`**.
- Review the pop-up confirmation dialog detailing the prior study ID, evidence summary, and bold safety disclaimer:
  > *"This action does NOT represent a diagnosis or treatment decision."*
- Click **`[ Confirm Comparison ]`** -> Notice success toast notification.

### STEP 5: ROUTINE Journey & Override Flow
- Select Demo Preset **`2. ROUTINE MRI Knee (Journey 2)`**.
- Click **`[ Override ]`** on candidate prior.
- Popup mandates selecting an override reason. Select **`Better comparison exists`** and add optional notes.
- Click **`[ Record Override in Audit Log ]`**.

### STEP 6: Restricted Technician Role Testing
- Click **`[ Logout ]`**.
- Click **`[ Login as Technician ]`**.
- Navigate to Workstation -> Notice that `[ Confirm Comparison ]` and `[ Override ]` buttons are disabled and replaced by **`🔒 Radiologist confirmation required`**. (Backend API enforces HTTP 403 Forbidden).

### STEP 7: Audit Trail Verification
- Click **`Audit Trail`** tab to view immutable event records for `LOGIN`, `MATCH_REQUESTED`, `COMPARISON_CONFIRMED`, `RECOMMENDATION_OVERRIDDEN`, and `LOGOUT`.
