import { applyPublicApiHeaders, writeProblem } from './_problem.js';

// Keep this response self-contained because Vercel bundles API functions away
// from the public directory. The same content is also published at /index.md
// for direct discovery.
const HOMEPAGE_MARKDOWN = `# MET Mastery

MET Mastery is a diagnostic-led Michigan English Test preparation workspace for nurses and healthcare professionals.

## When to use MET Mastery

Use MET Mastery when a learner needs a clear starting point, focused MET-style practice, or teacher feedback connected to evidence from speaking, writing, reading, listening, grammar, vocabulary, or test-strategy work. The product connects a diagnostic to a next task and keeps review points visible across sessions.

## Public resources

- About: https://met-mastery.vercel.app/about
- Developer documentation: https://met-mastery.vercel.app/docs
- Assessment approach: https://met-mastery.vercel.app/methodology
- Public API description: https://met-mastery.vercel.app/openapi.json
- Public API overview: https://met-mastery.vercel.app/api/v1/info
- MCP endpoint: https://met-mastery.vercel.app/mcp
- Contact: https://met-mastery.vercel.app/contact
- Privacy: https://met-mastery.vercel.app/privacy
`;

export default async function handler(req, res) {
  applyPublicApiHeaders(res);
  res.setHeader('Vary', 'Accept, Accept-Encoding');
  if (req.method !== 'GET') {
    writeProblem(res, 405, 'method_not_allowed', 'This endpoint only accepts GET requests.', 'Request the homepage with Accept: text/markdown.', 'GET');
    return;
  }
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.status(200).send(HOMEPAGE_MARKDOWN);
}
