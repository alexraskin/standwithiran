// node --test infrastructure/terraform/modules/cloudfront/router.test.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const handler = new Function(`${readFileSync(new URL('./router.js', import.meta.url), 'utf8')}; return handler;`)();
const req = (uri, host = 'standwithiran.org', querystring = {}) =>
  handler({ request: { uri, querystring, headers: { host: { value: host } } } });

test('rewrites directory URLs', () => {
  assert.equal(req('/').uri, '/index.html');
  assert.equal(req('/fa/').uri, '/fa/index.html');
  assert.equal(req('/fa').uri, '/fa/index.html');
  assert.equal(req('/sitemap.xml').uri, '/sitemap.xml');
  assert.equal(req('/_astro/x.css').uri, '/_astro/x.css');
});

test('redirects www to apex, keeping path and query', () => {
  const r = req('/fa/', 'www.standwithiran.org', { a: { value: '1' } });
  assert.equal(r.statusCode, 301);
  assert.equal(r.headers.location.value, 'https://standwithiran.org/fa/?a=1');
});
