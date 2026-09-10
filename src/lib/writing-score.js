/**
 * src/lib/writing-score.js — Client helper for MET writing evaluation.
 *
 * POSTs { essay, taskPrompt } to /api/evaluate-writing and returns the
 * server-scored evaluation. Requires an active Supabase session. The app
 * keeps that session in browser storage, so its bearer token is forwarded.
 */
export async function scoreWriting({ essay, taskPrompt, practiceStudio = false, token = '' }) {
  const res = await fetch('/api/evaluate-writing', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: 'same-origin',
    body: JSON.stringify({ essay, taskPrompt, practiceStudio }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Scoring failed');
  return data;
}
