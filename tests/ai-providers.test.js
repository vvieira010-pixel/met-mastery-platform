// Regression tests: OPENAI_API_KEY and PERPLEXITY_API_KEY extend the AI cascade.
// Pure ASCII only (node --test cannot parse non-ASCII in source).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { providerConfig, modelPriority, providerCensus } from '../api/_routes/_ai-providers.js';

test('OPENAI_API_KEY is picked up as a configured provider', () => {
  process.env.OPENAI_API_KEY = 'sk-test-openai';
  const { keys, models } = providerConfig();
  assert.equal(keys.openai.length, 1);
  assert.ok(models.openai.length > 0);
  delete process.env.OPENAI_API_KEY;
});

test('PERPLEXITY_API_KEY is picked up as a configured provider', () => {
  process.env.PERPLEXITY_API_KEY = 'pplx-test';
  const { keys, models } = providerConfig();
  assert.equal(keys.perplexity.length, 1);
  assert.ok(models.perplexity.length > 0);
  delete process.env.PERPLEXITY_API_KEY;
});

test('modelPriority includes openai and perplexity attempts', () => {
  process.env.OPENAI_API_KEY = 'sk-test-openai';
  process.env.PERPLEXITY_API_KEY = 'pplx-test';
  const order = modelPriority();
  const providers = new Set(order.map(([, provider]) => provider));
  assert.ok(providers.has('openai'));
  assert.ok(providers.has('perplexity'));
  delete process.env.OPENAI_API_KEY;
  delete process.env.PERPLEXITY_API_KEY;
});

test('census reports openai configured when its key is present', () => {
  process.env.OPENAI_API_KEY = 'sk-test-openai';
  const census = providerCensus();
  assert.equal(census.providers.openai.configured, true);
  assert.equal(census.providers.openai.keys, 1);
  delete process.env.OPENAI_API_KEY;
});

test('openai/perplexity are skipped (not errored) when no keys are set', () => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.PERPLEXITY_API_KEY;
  const { keys } = providerConfig();
  assert.equal(keys.openai.length, 0);
  assert.equal(keys.perplexity.length, 0);
});
