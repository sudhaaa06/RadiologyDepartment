const API_BASE = '/api';

export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data;
}

export async function logoutUser(token) {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  return res.json();
}

export async function fetchStudies(patient_id_hash = null) {
  const url = patient_id_hash ? `${API_BASE}/studies?patient_id_hash=${patient_id_hash}` : `${API_BASE}/studies`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch studies');
  return res.json();
}

export async function matchPriors(queryStudy) {
  const res = await fetch(`${API_BASE}/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queryStudy)
  });
  if (!res.ok) throw new Error('Failed to match priors');
  return res.json();
}

export async function submitFeedback(payload) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to submit feedback');
  }
  return data;
}

export async function fetchAuditLog(params = {}) {
  const query = new URLSearchParams();
  if (params.action) query.append('action', params.action);
  if (params.user) query.append('user', params.user);
  if (params.role) query.append('role', params.role);
  if (params.search) query.append('search', params.search);
  if (params.limit) query.append('limit', params.limit);
  if (params.offset) query.append('offset', params.offset);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(`${API_BASE}/audit-log${qs}`);
  if (!res.ok) throw new Error('Failed to fetch audit log');
  return res.json();
}

export async function logAuditEvent(event) {
  const res = await fetch(`${API_BASE}/audit-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchOverrideAnalytics() {
  const res = await fetch(`${API_BASE}/override-analytics`);
  if (!res.ok) throw new Error('Failed to fetch override analytics');
  return res.json();
}

export async function normalizeTerminology(req) {
  const res = await fetch(`${API_BASE}/terminology/normalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!res.ok) throw new Error('Terminology normalization request failed');
  return res.json();
}

export async function fetchEvaluationResults() {
  const res = await fetch(`${API_BASE}/evaluation/results`);
  if (!res.ok) throw new Error('Failed to fetch evaluation benchmark results');
  return res.json();
}

export async function fetchPilotMetrics() {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function fetchValidationSummary() {
  const res = await fetch(`${API_BASE}/validation`);
  if (!res.ok) throw new Error('Failed to fetch validation summary');
  return res.json();
}

export async function submitValidation(payload) {
  const res = await fetch(`${API_BASE}/validation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to submit validation');
  return res.json();
}

export async function scanReport(reportText) {
  const res = await fetch(`${API_BASE}/scan-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report_text: reportText })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Report scan failed');
  return data;
}
