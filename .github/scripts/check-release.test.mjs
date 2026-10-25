import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkRelease } from './check-release.mjs';

const manifest = { name: 'fumadocs-test-reports', version: '0.1.2' };
const registry = (status) => async () => new Response(null, { status });

test('an unpublished stable version is published as latest', async () => {
  assert.deepEqual(await checkRelease(manifest, registry(404)), { publish: true, tag: 'latest' });
});

test('an existing version is skipped on repeat pushes and retries', async () => {
  assert.equal((await checkRelease(manifest, registry(200))).publish, false);
});

test('prereleases use next without replacing latest', async () => {
  assert.deepEqual(await checkRelease({ ...manifest, version: '0.2.0-rc.1' }, registry(404)), {
    publish: true,
    tag: 'next',
  });
});

test('a hyphen in build metadata does not make a stable version a prerelease', async () => {
  assert.equal(
    (await checkRelease({ ...manifest, version: '0.2.0+build-1' }, registry(404))).tag,
    'latest',
  );
});

test('registry errors fail instead of authorizing publication', async () => {
  for (const status of [401, 403, 429, 500, 503]) {
    await assert.rejects(checkRelease(manifest, registry(status)), new RegExp(`HTTP ${status}`));
  }
});

test('network failures fail instead of authorizing publication', async () => {
  await assert.rejects(
    checkRelease(manifest, async () => {
      throw new Error('network unavailable');
    }),
    /network unavailable/,
  );
});

test('private packages are rejected before contacting npm', async () => {
  await assert.rejects(checkRelease({ ...manifest, private: true }), /public package/);
});
