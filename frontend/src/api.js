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

export async function fetchAuditLog() {
  const res = await fetch(`${API_BASE}/audit-log`);
  if (!res.ok) throw new Error('Failed to fetch audit log');
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
