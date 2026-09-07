import { applyPublicApiHeaders, writeProblem } from './_problem.js';

const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://met-mastery.vercel.app';
const SUPPORTED_PROTOCOLS = new Set(['2025-03-26', '2025-06-18', '2025-11-25', '2026-07-28']);
const SERVER_INFO = {
  name: 'io.github.vvieira010/met-mastery',
  title: 'MET Mastery',
  version: '1.0.0',
};
const TOOLS = [
  {
    name: 'met_mastery_get_product_info',
    description: 'Retrieve public, read-only information about MET Mastery, its audience, capabilities, and canonical resources.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'met_mastery_get_developer_guidance',
    description: 'Retrieve public integration guidance, API documentation, MCP endpoint details, and agent-use instructions for MET Mastery.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
];

function response(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function error(id, code, message, data) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message, ...(data ? { data } : {}) } };
}

function protocolVersion(body, req) {
  const header = req.headers['mcp-protocol-version'];
  const bodyVersion = body?.params?.protocolVersion;
  const bodyMeta = body?._meta?.['io.modelcontextprotocol/protocolVersion'];
  if (header && bodyVersion && header !== bodyVersion) return { mismatch: true };
  if (header && bodyMeta && header !== bodyMeta) return { mismatch: true };
  if (bodyVersion && bodyMeta && bodyVersion !== bodyMeta) return { mismatch: true };
  const requested = bodyVersion || bodyMeta || header || '2025-11-25';
  if (!SUPPORTED_PROTOCOLS.has(requested)) return null;
  return requested;
}

function productInfo() {
  return {
    name: 'MET Mastery',
    description: 'Diagnostic-led Michigan English Test preparation for nurses and healthcare professionals.',
    audience: ['nurses', 'healthcare professionals', 'MET candidates'],
    capabilities: ['diagnostic planning', 'MET-style practice', 'teacher feedback', 'progress review'],
    url: `${SITE_URL}/`,
    readOnly: true,
  };
}

function developerGuidance() {
  return {
    whenToUse: 'Use MET Mastery when a learner needs structured Michigan English Test preparation connected to evidence from diagnostic, speaking, writing, reading, listening, grammar, vocabulary, or test-strategy practice.',
    api: `${SITE_URL}/openapi.json`,
    docs: `${SITE_URL}/docs`,
    llms: `${SITE_URL}/llms.txt`,
    mcp: `${SITE_URL}/mcp`,
    policy: 'This public MCP surface is read-only. It does not expose student records, start scans, submit work, or change account data.',
  };
}

async function handleMessage(body, req) {
  if (!body || Array.isArray(body) || body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
    return { status: 400, body: error(body?.id, -32600, 'Invalid JSON-RPC request.') };
  }
  const isNotification = body.id === undefined;
  if (body.method === 'notifications/initialized' || body.method === 'notifications/cancelled') {
    return { status: 202, body: null };
  }
  if (body.method === 'initialize') {
    const version = protocolVersion(body, req);
    if (version?.mismatch) return { status: 400, body: error(body.id, -32602, 'MCP protocol version header does not match request metadata.') };
    if (!version) return { status: 400, body: error(body.id, -32602, 'Unsupported MCP protocol version.', { supported: [...SUPPORTED_PROTOCOLS] }) };
    return { status: 200, body: response(body.id, {
      protocolVersion: version,
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO,
      instructions: 'Use these read-only tools to understand MET Mastery and its public agent-facing resources. Do not infer private learner data from this server.',
    }) };
  }
  if (isNotification) return { status: 202, body: null };
  if (body.method === 'ping') return { status: 200, body: response(body.id, {}) };
  if (body.method === 'tools/list') {
    return { status: 200, body: response(body.id, { tools: TOOLS }) };
  }
  if (body.method === 'tools/call') {
    const name = body.params?.name;
    const data = name === 'met_mastery_get_product_info'
      ? productInfo()
      : name === 'met_mastery_get_developer_guidance'
        ? developerGuidance()
        : null;
    if (!data) return { status: 200, body: error(body.id, -32602, `Unknown tool: ${name || '(missing name)'}.`) };
    return { status: 200, body: response(body.id, {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      structuredContent: data,
    }) };
  }
  if (body.method === 'resources/list') return { status: 200, body: response(body.id, { resources: [] }) };
  return { status: 200, body: error(body.id, -32601, `Method not found: ${body.method}.`) };
}

export default async function handler(req, res) {
  applyPublicApiHeaders(res);
  res.setHeader('MCP-Protocol-Version', req.headers['mcp-protocol-version'] || '2025-11-25');
  if (req.method !== 'POST') {
    writeProblem(res, 405, 'method_not_allowed', 'The MCP endpoint accepts JSON-RPC messages through POST.', 'Send a POST request to /mcp or /.well-known/mcp with application/json and text/event-stream in Accept.', 'POST');
    return;
  }
  const result = await handleMessage(req.body, req);
  if (result.status === 202) {
    res.status(202).end();
    return;
  }
  res.status(result.status).json(result.body);
}
