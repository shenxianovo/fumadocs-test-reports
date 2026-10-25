# fumadocs-test-reports

A test report integration for Fumadocs. Use framework presenters to display native reports in your documentation. Use shared UI primitives to build other report views.

## Quick start

```tsx
import { parseTUnitReport } from 'fumadocs-test-reports/tunit';
import { TUnitReport, TUnitReportLink } from 'fumadocs-test-reports/tunit/ui';
import input from './run.tunit-report.json';

const report = parseTUnitReport(input);

<TUnitReport report={report} />;
<TUnitReportLink report={report} href="/docs/reports/run" />;
```

Install the package in your Fumadocs application:

```sh
pnpm add fumadocs-test-reports
```

Use these peer dependencies:

- React 19.2 or later.
- Fumadocs Core 16.16.2 or later.
- Fumadocs UI 16.16.2 or later.

The parser entry points do not import React or Fumadocs UI.

Import the stylesheet after the Fumadocs styles:

```css
@import 'fumadocs-test-reports/css/preset.css';
```

## Architecture

During 0.x development, changes replace the current API and native report models directly. The package does not keep deprecated APIs or compatibility branches for earlier versions.

```text
TUnit JSON → parser → native report model → framework presenter → shared UI primitives
```

Each report format has its own parser, native report model, and framework presenter. Shared UI primitives receive display props, such as text, tone, or duration. Framework presenters can add traces, steps, or artifacts from their native reports.

| Entry point       | Exports                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| `/tunit`          | `parseTUnitReport`, `TUnitParseError`, and native `TUnit*` types.          |
| `/tunit/ui`       | `TUnitReport` and `TUnitReportLink`.                                       |
| `/vitest`         | `parseVitestReport`, `VitestParseError`, and native `VitestJson*` types.   |
| `/vitest/ui`      | `VitestReport`, `VitestReportLink`, and display selection types.           |
| `/i18n`           | `testReportTranslations()`, `zhCN()`, and translation key types.           |
| `/ui`             | `StatusBadge`, `StatusIcon`, `Duration`, `ErrorDetail`, and `StdoutPanel`. |
| `/css/preset.css` | Report layout and status styles that use Fumadocs theme variables.         |

## TUnit native report model

`parseTUnitReport` accepts decoded `.tunit-report.json` data with schema version 1. The parser checks the fields that the framework presenter uses. It then returns the same input object.

The caller reads files, sends network requests, and controls routes.

The parser keeps native field names and values. These include `assemblyName`, `groups[].tests`, `displayName`, `output`, `errorOutput`, `exception.innerException`, `retryAttempt`, `spanId`, and `parentSpanId`.

Unknown fields, custom status strings, and explicit null values remain in the native report. The parser does not add fields, default values, or status mappings.

The native report must contain these fields:

- At the root: `schemaVersion`, `assemblyName`, and `groups`.
- In each group: `className` and `tests`.
- In each test: `id`, `displayName`, and `status`.

The parser also checks metadata and optional data when present. Invalid known fields, duplicate test IDs, or unsupported schema versions cause a `TUnitParseError`. The error's `path` identifies the JSON field.

The framework presenter reads the supplied TUnit `summary` counts. If the native report has no summary, the framework presenter calculates display counts from the tests.

Retry attempts remain part of a test's attempt history. The framework presenter keeps timestamp text unchanged. Duration values are in milliseconds.

### TUnit framework presenter

`TUnitReport` shows search, outcome filters, inline details, output, retry attempts, and a trace timeline. Each row uses Fumadocs Accordion. Details open below the row and use the full list width.

Groups start closed. Each group heading shows the number of visible test rows. Use Expand all or Collapse all to control the groups.

Search and outcome filters open matching groups. A selected test link opens its group. Closing a group keeps the test selection. Outcome filters and group actions share one toolbar. The controls can wrap at narrow widths.

A group shows Passed only when all its tests passed. Vitest files must also have a passing file outcome and no collection error. This label uses the complete group, before search or outcome filters apply.

Both framework presenters use native Fumadocs Accordion for groups and test rows. Test names use the host's font size and family.

Only one test can be open at a time. Test details start closed unless the host supplies a selected test. The report uses document scroll, with no separate list or detail scroll boxes.

`TUnitReportLink` adds a link to the native report in a document.

### Headers and selection

Set `showHeader={false}` if the host already displays a page title. Both framework presenters use colors from the host's Fumadocs theme variables.

Use `selectedTestId` and `onTestSelect` to control selection and report links.

| Prop value or event   | Behavior                                                      |
| --------------------- | ------------------------------------------------------------- |
| Omit `selectedTestId` | The framework presenter controls local selection.             |
| Supply a string       | The host selects that test.                                   |
| Supply `null`         | The host closes all rows.                                     |
| Open a row            | `onTestSelect` receives the native test or display selection. |
| Close a row           | `onTestSelect` receives `undefined`.                          |

Search and outcome filters can hide the open row. They do not select a different row. Clear the search or filter to show the selected row again.

```tsx
<TUnitReport
  report={report}
  showHeader={false}
  selectedTestId={searchParams.get('test')}
  onTestSelect={(test) => {
    const params = new URLSearchParams(searchParams);
    if (test) params.set('test', test.id);
    else params.delete('test');
    // The host updates its URL with params, preserving scroll position.
  }}
/>
```

### Fumadocs controls and layout

Framework presenters use Fumadocs Tabs, Accordion, Card, and CodeBlock. These controls supply keyboard navigation, row expansion, and code-copy buttons.

Report styles control the run summary, status filters, test rows, status marks, error panels, and the trace waterfall. Container queries adjust rows and counts to the available report width. The host sidebar and table of contents can reduce this width.

Use page components that match the Fumadocs layout. Import the required layout styles for Spacious and Glass:

- `fumadocs-ui/css/generated/spacious.css`.
- `fumadocs-ui/css/generated/glass.css`.

Use `<DocsPage full>` for a separate report page. Spacious has a default page width limit of 760 px. The `full` prop changes this limit to 1200 px. The framework presenter uses the space available inside the page.

Flux in `@fumadocs/base-ui@16.16.2` can make the page too narrow when a child uses inline-size containment. The documentation app applies a dependency patch that adds `w-full` to the native Flux `main`.

The patch keeps native page limits and alignment. The published test report integration does not include this patch. Hosts that use the affected Flux version need the same dependency fix. Other layout examples use their native page configuration.

## Vitest native report model

Export a native report with the official Vitest JSON reporter:

```sh
vitest run --reporter=default --reporter=json --outputFile.json=./vitest-report.json
```

Read the native report and display it:

```tsx
import { parseVitestReport } from 'fumadocs-test-reports/vitest';
import { VitestReport, VitestReportLink } from 'fumadocs-test-reports/vitest/ui';
import input from './vitest-report.json';

const report = parseVitestReport(input);
<VitestReport report={report} title="My tests" />;
<VitestReportLink report={report} href="/docs/reports/run" title="My tests" />;
```

The supported version is Vitest 5.0.3. The complete Fumadocs test run supplies the verification data.

The native report has no schema version field. Verify other producer versions with real exports before you add support. Public types describe the fields that the framework presenter uses. The types do not depend on the Vitest runtime package.

The parser keeps other source fields at their original paths. These fields can include snapshot, coverage, and benchmark data.

`parseVitestReport` accepts decoded JSON and returns the same input object. It checks the required structure, counts, and fields used for display.

Optional fields can be absent if the native report model permits this. Invalid supplied values cause a `VitestParseError` with a field path. Unknown fields and outcome strings remain unchanged.

Summary counts can differ from the visible details. A native report can contain only some test details.

### Vitest framework presenter

The framework presenter shows files, test ancestry, outcomes, durations, failure messages, source locations, tags, and supplied metadata. It also shows file collection errors when the file has no test assertions.

`numTotalTestSuites` includes nested suites. Use `testResults.length` for the file count. The framework presenter does not use root `numPendingTests` as a skipped-test count.

The Vitest JSON reporter does not export standard output, standard error, attempt history, or traces. These features need a different native report format.

The `success` field gives the reporter's result. It does not replace the process exit code. The fixture's separate provenance file records that exit code.

### Vitest selection

The native report has no unique test IDs. The framework presenter uses positions to identify rows within one export:

- `0:2` identifies file index 0 and assertion index 2.
- `0:file` identifies a collection error in file index 0.

These display identifiers permit selection of tests with duplicate names. The framework presenter does not add the identifiers to the native report. Identifiers can change between test runs.

When a row opens, `onTestSelect` receives the identifier and references to the native file and optional assertion. When the row closes, the callback receives `undefined`.

The inline Accordion layout, header prop, and selection props use the same rules as `TUnitReport`.

## Internationalization

Framework presenters read the same translation provider as Fumadocs UI. Register the test report integration's translation extension. Add the supplied Simplified Chinese preset if needed:

```tsx
import { defineI18n } from 'fumadocs-core/i18n';
import { uiTranslations, i18nProvider } from 'fumadocs-ui/i18n';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { testReportTranslations, zhCN } from 'fumadocs-test-reports/i18n';

const i18n = defineI18n({ defaultLanguage: 'en', languages: ['en', 'zh'] });
const translations = i18n
  .translations()
  .extend(uiTranslations())
  .extend(testReportTranslations())
  .preset('zh', zhCN())
  .add({ zh: { 'Passed(test reports)': '通过' } });

<RootProvider i18n={i18nProvider(translations, lang)}>
  <TUnitReport report={tunitReport} />
  <VitestReport report={vitestReport} />
</RootProvider>;
```

The host selects locale codes. It can add languages and change labels. If the host supplies no translations, UI labels use English.

Both framework presenters use this provider. During 0.x development, the package removed the old `locale` prop and `TUnitReportLocale` export.

Translations apply to UI labels and known outcome labels. Native test names, exception messages, output, and metadata remain unchanged.

The host controls Fumadocs layouts, Fumadocs UI translations, and application routes. See [Fumadocs translations](https://www.fumadocs.dev/docs/ui/translations).

## Shared UI primitives

```tsx
import {
  StatusBadge,
  StatusIcon,
  Duration,
  ErrorDetail,
  StdoutPanel,
} from 'fumadocs-test-reports/ui';

<StatusBadge status="failed" tone="danger" />;
<StatusIcon status="failed" tone="danger" />;
<Duration value={42} />;
<ErrorDetail message="Expected 400, received 200" stack="at example.test.ts:12" />;
<StdoutPanel content="Connection refused" title="Standard error" />;
```

`StatusBadge` displays the caller's text with a tone. `StatusIcon` displays only the tone's mark and keeps the caller's text as its accessible label. The framework presenter interprets the native status.

`Duration` shows an unknown duration for a missing or null value. It shows a recorded zero as zero.

`ErrorDetail` and `StdoutPanel` display escaped text. The framework presenter controls nested exceptions and interprets retry attempts.

This version supports TUnit and Vitest JSON. Other native report formats will have their own parsers and framework presenters. Dashboard, history, and search across frameworks are future features.

See these source references:

- [TUnit native report model](https://github.com/thomhurst/TUnit/blob/main/src/TUnit.Engine/Reporters/Html/HtmlReportDataModel.cs).
- [TUnit sidecar writer](https://github.com/thomhurst/TUnit/blob/main/src/TUnit.Engine/Reporters/Aggregation/ReportDataJson.cs).
- [Fumadocs OpenAPI package structure](https://github.com/fuma-nama/fumadocs/tree/dev/packages/openapi).

## Automated releases

The [Publish to npm workflow](../../.github/workflows/publish.yml) runs on pushes to `main`. It checks `packages/test-reports/package.json` against the public npm registry. An already published version is skipped. A new version is published only after tests, type checks, lint, formatting, and the workspace build pass. Registry or network errors fail the workflow rather than triggering publication.

Stable versions use the `latest` npm tag. Prereleases, such as `0.2.0-rc.1`, use `next`.

### One-time npm setup

Open the package's [npm settings](https://www.npmjs.com/package/fumadocs-test-reports/access), add a GitHub Actions trusted publisher, and enter:

| Field                | Value                                       |
| -------------------- | ------------------------------------------- |
| Organization or user | `shenxianovo`                               |
| Repository           | `fumadocs-test-reports`                     |
| Workflow filename    | `publish.yml`                               |
| Environment          | Leave empty                                 |
| Allowed actions      | Enable direct publishing with `npm publish` |

Trusted publishing uses GitHub's OIDC identity; no `NPM_TOKEN` secret is required. The workflow uses Node.js 24 with a compatible npm CLI. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for setup details.

### Publish a version

Update only the publishable package's version, then commit and push to `main`:

```sh
cd packages/test-reports
npm version patch --no-git-tag-version
cd ../..
git add packages/test-reports/package.json
git commit -m "chore: release fumadocs-test-reports"
git push origin main
```

CI does not bump versions automatically. The private root package's version does not control publication. To retry a failed release, rerun the workflow or use **Actions → Publish to npm → Run workflow** on `main`. The same registry check prevents publishing an existing version again.

## Local release checks

Run the workspace checks from the repository root:

```sh
pnpm test --run
pnpm types:check
pnpm build
pnpm lint
pnpm lint:format
```

From `packages/test-reports`, examine the files for publication:

```sh
npm pack --dry-run --ignore-scripts
```

`pnpm pack` builds the package through `prepack`. The published package contains `dist`, `css`, the package README, license, and manifest. Native report examples and test fixtures stay in the repository.

Log in to npm. Then publish from `packages/test-reports`:

```sh
pnpm publish --access public --no-git-checks
```

The manifest specifies the public npm registry. Publication requires npm account access and the account's authentication checks.
