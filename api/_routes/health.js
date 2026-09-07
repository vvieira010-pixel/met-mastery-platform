import { applyPublicApiHeaders, writeProblem } from './_problem.js';

export default function handler(req, res) {
  applyPublicApiHeaders(res);
  if (req.method !== 'GET') {
    writeProblem(res, 405, 'method_not_allowed', 'This endpoint only accepts GET requests.', 'Use GET /api/health.', 'GET');
    return;
  }
  res.status(200).json({ status: 'ok', service: 'met-mastery', readOnly: true });
}
