/**
 * callAI.js — AI provider proxy for MET Proficiency Platform.
 * Routes all AI calls through the Vercel serverless endpoint (/api/ai)
 * so provider API keys stay server-side and out of the browser bundle.
 *
 * Accepts optional `skills` array of { id, name, prompt } objects.
 * When provided, skill prompt content is appended to the system message
 * so the AI can apply pedagogical best practices to its response.
 */

export async function callAI(prompt, { max_tokens = 2048, system, temperature = 0.3, preferredProvider = null, skills } = {}) {
  let finalSystem = system || 'You are a helpful MET English teaching assistant.';

  if (skills && skills.length > 0) {
    const augmentations = skills
      .filter(s => s && s.prompt)
      .map(s => `\n--- ${s.name} ---\n${s.prompt}`);
    if (augmentations.length > 0) {
      finalSystem += `\n\n━━━ EDUCATION SKILL AUGMENTATIONS ━━━\n${augmentations.join('\n')}\n━━━ END AUGMENTATIONS ━━━\n`;
    }
  }

  let r;
  try {
    r = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        system: finalSystem,
        max_tokens,
        temperature,
        preferredProvider,
      }),
    });
  } catch (netErr) {
    throw new Error(`Network connection error: ${netErr.message}`, { cause: netErr });
  }

  const contentType = r.headers.get('content-type') || '';
  if (!r.ok) {
    let errorMsg = `AI request failed (${r.status})`;
    if (contentType.includes('application/json')) {
      try {
        const errJson = await r.json();
        errorMsg = errJson?.error?.message || errorMsg;
      } catch (parseErr) { console.warn('[callAI] could not parse AI error body', { status: r.status, message: parseErr?.message }); }
    } else {
      const text = await r.text().catch(() => '');
      if (text.includes('<!doctype') || text.includes('<html')) {
        errorMsg = `AI service timeout or gateway error (${r.status})`;
      } else if (text) {
        errorMsg = text.slice(0, 200);
      }
    }
    throw new Error(errorMsg);
  }

  if (contentType.includes('application/json')) {
    try {
      return await r.json();
    } catch {
      const text = await r.text().catch(() => '');
      return { content: [{ text }] };
    }
  }

  const text = await r.text().catch(() => '');
  try {
    return JSON.parse(text);
  } catch {
    return { content: [{ text }] };
  }
}

export async function summarizeTranscript(transcript) {
  if (!transcript || transcript.length < 800) return transcript;
  const prompt = `Condense this class transcript to under 600 words. Keep all student errors, corrections, and notable moments.\n\n${transcript}`;
  const data = await callAI(prompt, { max_tokens: 800 });
  return data.content?.map(b => b.text || '').join('') || transcript;
}
