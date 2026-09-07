import { applyPublicApiHeaders, writeProblem } from './_problem.js';

const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://met-mastery.vercel.app';

export default function handler(req, res) {
  applyPublicApiHeaders(res);
  if (req.method !== 'GET') {
    writeProblem(res, 405, 'method_not_allowed', 'This endpoint only accepts GET requests.', 'Use GET /api/v1/info.', 'GET');
    return;
  }
  res.status(200).json({
    name: 'MET Mastery',
    description: 'Diagnostic-led Michigan English Test preparation for nurses and healthcare professionals.',
    url: `${SITE_URL}/`,
    readOnly: true,
    capabilities: ['diagnostic planning', 'MET-style practice', 'teacher feedback', 'progress review'],
    publicResources: {
      docs: `${SITE_URL}/docs`,
      methodology: `${SITE_URL}/methodology`,
      sitemap: `${SITE_URL}/sitemap.xml`,
      llms: `${SITE_URL}/llms.txt`,
      openapi: `${SITE_URL}/openapi.json`,
      mcp: `${SITE_URL}/mcp`,
    },
  });
}
