# Production Deployment & Governance Checklist

This checklist outlines the technical, security, clinical governance, and operational requirements before transitioning from the prototype to enterprise PACS integration.

---

## 📋 Pre-Deployment Checklist

### DATA & PRIVACY
- [x] Safe Harbor de-identification verified for pilot dataset.
- [ ] Enterprise DICOM De-identification Pipeline integrated for live PACS pre-fetching.
- [ ] Zero PHI/PII stored in unencrypted persistent logs.
- [ ] Data retention and purge policy established (30-day rolling log retention).

### SECURITY & AUTHENTICATION
- [x] Demo RBAC roles (`Radiologist`, `Technician`, `Admin`) enforced in API endpoints.
- [ ] Enterprise SSO / SAML 2.0 / OAuth2 OIDC integration.
- [ ] HTTPS / TLS 1.3 enforced for all workstation API endpoints.
- [ ] AES-256 encryption at rest for database and audit logs.
- [ ] Centralized SIEM audit log forwarding.

### CLINICAL GOVERNANCE & SAFETY
- [x] Human-in-the-loop confirmation dialog mandatory.
- [x] Override reason capturing enforced.
- [x] Non-diagnostic safety disclaimer banners embedded in UI.
- [ ] IRB approval & Clinical Governance Committee sign-off.
- [ ] Post-market surveillance & drift monitoring setup.

### TECHNICAL & SYSTEM HEALTH
- [x] 33/33 Pytest acceptance tests passing cleanly.
- [x] Pilot benchmark evaluation completed (**56.0% Search Time Reduction**).
- [ ] Containerized deployment manifest (Docker / Kubernetes).
- [ ] High-Availability (HA) load balancing & 99.9% uptime SLA.
