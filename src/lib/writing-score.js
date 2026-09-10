/**
 * src/lib/writing-score.js — Client helper for MET writing evaluation.
 *
 * POSTs { essay, taskPrompt } to /api/evaluate-writing and returns the
 * server-scored evaluation. Requires an active Supabase session. The app
 * keeps that session in browser storage, so its bearer token is forwarded.
 * Writing provider selection is server-owned and never routes through
 * AssemblyAI; AssemblyAI is reserved for speaking/audio workflows.
 */
export async function scoreWriting({ essay, taskPrompt, token = '' }) {
  const res = await fetch('/api/evaluate-writing', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: 'same-origin',
    body: JSON.stringify({ essay, taskPrompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Scoring failed');
  return data;
}
