import { appendFileSync, readFileSync } from 'node:fs';

/** Only a registry 404 means a version is available for publication. */
export async function checkRelease(manifest, fetchVersion = fetch) {
  const { name, version } = manifest;
  if (manifest.private || !name || !version) {
    throw new Error('Publication requires a public package with a name and version.');
  }

  const response = await fetchVersion(
    `https://registry.npmjs.org/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,
    { signal: AbortSignal.timeout(30_000) },
  );
  if (!response.ok && response.status !== 404) {
    throw new Error(`Cannot check ${name}@${version}: npm returned HTTP ${response.status}.`);
  }

  return {
    publish: response.status === 404,
    tag: version.split('+')[0].includes('-') ? 'next' : 'latest',
  };
}

if (import.meta.main) {
  const manifest = JSON.parse(
    readFileSync(new URL('../../packages/test-reports/package.json', import.meta.url), 'utf8'),
  );
  const result = await checkRelease(manifest);
  appendFileSync(process.env.GITHUB_OUTPUT, `publish=${result.publish}\ntag=${result.tag}\n`);
  console.log(
    result.publish
      ? `${manifest.name}@${manifest.version} will be published with the ${result.tag} tag.`
      : `${manifest.name}@${manifest.version} is already published; skipping.`,
  );
}
