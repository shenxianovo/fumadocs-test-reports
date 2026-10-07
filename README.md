# fumadocs-test-reports

A test report integration for Fumadocs. The package reads native reports and displays them with framework presenters and shared UI primitives.

See [package use and architecture](packages/test-reports/README.md).

## Development

Run these commands from the workspace root:

```sh
pnpm install
pnpm build
pnpm dev:docs
```

Open <http://127.0.0.1:3010/zh/docs> or <http://127.0.0.1:3010/en/docs>.

For layout examples, open `/{lang}/layouts/{name}`. Use `docs`, `spacious`, `notebook`, `flux`, or `glass` for `{name}`. Each example uses the layout's own `<DocsPage full>`.

Check the report layout:

1. Check that the report fills the page content width.
2. Check the vertical alignment of each row's status badge, test name, and duration.
3. Open a group to show its test rows.
4. Open a test row. Check that its details fill the list width.
5. Change the window width. Check that long names, counts, and details fit inside the page.

To build package changes during development, run `pnpm --filter fumadocs-test-reports dev` in a second terminal.

See [layout checks and the Flux dependency fix](apps/docs/README.md).

Run the workspace checks:

```sh
pnpm test --run
pnpm types:check
pnpm lint
pnpm lint:format
```

## Repository structure

| Directory               | Contents                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| `packages/test-reports` | Native report parsers, native report models, framework presenters, translations, and shared UI primitives. |
| `apps/docs`             | The documentation app, which uses the built test report integration.                                       |

The documentation app contains these reports:

- The real Heartbeat native report and its original TUnit HTML report.
- The complete Fumadocs native report and its original Vitest HTML report.
- Separate example data with labels that identify the data as examples.

The sidebar contains links to both native HTML reports.

## Update the Fumadocs native report

Keep the upstream checkout outside this workspace. The default location is `../fumadocs-upstream`.

Prepare the upstream checkout as specified in its contribution guide. Install its dependencies and build its packages.

Use the official Vitest JSON and HTML reporters in the same test run. Run all upstream Vitest projects. Keep the exported bytes unchanged. Copy the JSON report to `packages/test-reports/test/fixtures/vitest/fumadocs.json`. Copy the HTML report to `apps/docs/public/reports/vitest-report.html`.

A separate provenance file records this information:

- The upstream commit and test scope.
- The exact Vitest and `@vitest/ui` versions.
- The process exit code.
- The SHA-256 hash of each exported file.

The HTML reporter uses `singleFile: true`. The file `apps/docs/public/reports/vitest-report.html` thus needs no separate asset directory.

The HTML reporter requires `@vitest/ui`. Its version must match the upstream Vitest version.

A temporary configuration can change only the upstream reporters. Keep integration files and dependency changes outside the upstream checkout.

If tests fail, keep the failure results in the native reports. Record the process exit code in the provenance file. Examine the changed fixtures before you commit them.
