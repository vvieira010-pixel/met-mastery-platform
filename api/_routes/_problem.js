export function writeProblem(res, status, code, detail, resolution, allow) {
  if (allow) res.setHeader('Allow', allow);
  res.setHeader('Content-Type', 'application/problem+json; charset=utf-8');
  res.status(status).json({
    type: `https://met-mastery.vercel.app/problems/${code}`,
    title: code.replace(/_/g, ' '),
    status,
    code,
    detail,
    resolution,
  });
}

export function applyPublicApiHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
}
