/**
 * src/lib/writing-score.js — Client helper for MET writing evaluation.
 *
 * POSTs { essay, taskPrompt } to /api/evaluate-writing and returns the
 * server-scored evaluation. Requires an active Supabase session (cookies
 * are sent automatically via credentials: 'same-origin').
 */
export async function scoreWriting({ essay, taskPrompt, practiceStudio = false }) {
  const res = await fetch('/api/evaluate-writing', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ essay, taskPrompt, practiceStudio }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Scoring failed');
  return data;
}
