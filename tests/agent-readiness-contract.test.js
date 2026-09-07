import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import mcpHandler from '../api/mcp.js';
import healthHandler from '../api/health.js';
import infoHandler from '../api/v1/info.js';
import markdownHomepageHandler from '../api/markdown-homepage.js';

const root = new URL('../', import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), 'utf8');
}

function mockResponse() {
  const headers = new Map();
  return {
    headers,
    statusCode: 200,
    body: undefined,
    setHeader(name, value) { headers.set(name.toLowerCase(), value); },
    status(value) { this.statusCode = value; return this; },
    type(value) { headers.set('content-type', value); return this; },
    json(value) { this.body = value; return this; },
    send(value) { this.body = value; return this; },
    end() { this.ended = true; return this; },
  };
}

async function callMcp(body, headers = {}) {
  const res = mockResponse();
  await mcpHandler({ method: 'POST', headers, body }, res);
  return res;
}

test('homepage exposes readable brand, metadata, and organization evidence before JavaScript', async () => {
  const html = await read('index.html');
  assert.match(html, /<h1>MET Mastery: Michigan English Test preparation for nurses<\/h1>/);
  assert.match(html, /og:image/);
  assert.match(html, /images\/met-mastery-share-card\.png/);
  assert.match(html, /"@type": "Organization"/);
  assert.match(html, /"contactPoint"/);
  assert.match(html, /"address"/);
  assert.match(html, /About MET Mastery/);
});

test('public agent resources are linked, parseable, and substantial', async () => {
  const [openapiText, manifestText, cardText, sitemap, llms, agents] = await Promise.all([
    read('public/openapi.json'),
    read('public/server.json'),
    read('public/.well-known/mcp/server-card.json'),
    read('public/sitemap.xml'),
    read('public/llms.txt'),
    read('public/agents.md'),
  ]);
  const openapi = JSON.parse(openapiText);
  const manifest = JSON.parse(manifestText);
  const card = JSON.parse(cardText);

  assert.equal(openapi.openapi, '3.1.0');
  assert.ok(openapi.paths['/api/health'].get.operationId);
  assert.ok(openapi.paths['/api/v1/info'].get.operationId);
  assert.match(openapi.paths['/api/v1/info'].get.description, /read-only/i);
  assert.equal(manifest.remotes[0].type, 'streamable-http');
  assert.equal(card.remotes[0].url, 'https://met-mastery.vercel.app/mcp');
  assert.match(sitemap, /<loc>https:\/\/met-mastery\.vercel\.app\/methodology<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/met-mastery\.vercel\.app\/developers<\/loc>/);
  assert.match(llms, /When to use this product/);
  assert.match(agents, /do not .* private student information/i);
});

test('trust and developer pages contain crawlable explanatory content', async () => {
  for (const page of ['about', 'contact', 'privacy', 'terms', 'docs', 'developers', 'methodology']) {
    const html = await read(`public/${page}/index.html`);
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    assert.ok(text.length > 500, `${page} should contain substantial crawlable text`);
    assert.match(html, new RegExp(`<title>[^<]*MET Mastery`, 'i'));
    assert.match(html, /rel="canonical"/);
  }
});

test('MCP initialize advertises supported protocol and read-only tools', async () => {
  const res = await callMcp({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'contract-test', version: '1.0.0' } },
  }, { 'mcp-protocol-version': '2025-11-25' });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.result.protocolVersion, '2025-11-25');
  assert.deepEqual(res.body.result.capabilities, { tools: {} });
  assert.match(res.body.result.instructions, /read-only/i);

  const tools = await callMcp({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  assert.equal(tools.statusCode, 200);
  assert.deepEqual(tools.body.result.tools.map((tool) => tool.name), [
    'met_mastery_get_product_info',
    'met_mastery_get_developer_guidance',
  ]);
});

test('MCP tool calls return public structured content and reject unknown tools', async () => {
  const info = await callMcp({
    jsonrpc: '2.0', id: 3, method: 'tools/call',
    params: { name: 'met_mastery_get_product_info', arguments: {} },
  });
  assert.equal(info.statusCode, 200);
  assert.equal(info.body.result.structuredContent.name, 'MET Mastery');
  assert.equal(info.body.result.structuredContent.readOnly, true);

  const unknown = await callMcp({
    jsonrpc: '2.0', id: 4, method: 'tools/call',
    params: { name: 'private_student_lookup', arguments: {} },
  });
  assert.equal(unknown.body.error.code, -32602);
});

test('MCP rejects conflicting protocol version metadata instead of silently downgrading', async () => {
  const res = await callMcp({
    jsonrpc: '2.0', id: 5, method: 'initialize',
    params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'contract-test', version: '1.0.0' } },
  }, { 'mcp-protocol-version': '2026-07-28' });
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error.code, -32602);
});

test('public JSON endpoints have explicit read-only contracts and method errors', async () => {
  const health = mockResponse();
  healthHandler({ method: 'GET' }, health);
  assert.deepEqual(health.body, { status: 'ok', service: 'met-mastery', readOnly: true });

  const info = mockResponse();
  infoHandler({ method: 'GET' }, info);
  assert.equal(info.body.name, 'MET Mastery');
  assert.equal(info.body.readOnly, true);
  assert.match(info.body.publicResources.mcp, /\/mcp$/);

  const bad = mockResponse();
  healthHandler({ method: 'POST' }, bad);
  assert.equal(bad.statusCode, 405);
  assert.equal(bad.headers.get('content-type'), 'application/problem+json; charset=utf-8');
  assert.equal(bad.body.code, 'method_not_allowed');
});

test('problem responses use Vercel-compatible JSON headers', async () => {
  const res = mockResponse();
  delete res.type;
  healthHandler({ method: 'POST' }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.get('content-type'), 'application/problem+json; charset=utf-8');
  assert.equal(res.body.status, 405);
});

test('markdown homepage handler returns a self-contained crawlable representation', async () => {
  const res = mockResponse();
  await markdownHomepageHandler({ method: 'GET' }, res);
  assert.equal(res.statusCode, 200);
  assert.match(res.headers.get('content-type'), /^text\/markdown/);
  assert.match(res.body, /^# MET Mastery/);
  assert.match(res.body, /Michigan English Test/);
  assert.match(res.body, /\/docs/);
});

test('Vercel routing avoids soft 404s and supports markdown negotiation', async () => {
  const config = JSON.parse(await read('vercel.json'));
  const rewrites = config.rewrites;
  assert.ok(rewrites.some((rule) => rule.destination === '/api/markdown-homepage' && rule.has?.[0]?.key === 'accept'));
  assert.ok(rewrites.some((rule) => rule.source === '/' && rule.destination === '/app.html'));
  assert.ok(rewrites.some((rule) => rule.source === '/mcp' && rule.destination === '/api/mcp'));
  assert.ok(rewrites.some((rule) => rule.source === '/.well-known/mcp' && rule.destination === '/api/mcp'));
  assert.doesNotMatch(JSON.stringify(rewrites), /"destination":"\/index\.html"/);
  assert.match(JSON.stringify(config.headers), /Vary/);
});
