# fumadocs-test-reports

Framework-native test report presenters and shared React UI primitives for Fumadocs.

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

React 19.2+ and Fumadocs UI 16.16.2+ are peer dependencies. The parser entry does not import React or Fumadocs UI.

Import the stylesheet after your Fumadocs styles:

```css
@import 'fumadocs-test-reports/css/preset.css';
```

## Architecture

During 0.x development, changes replace the current API and data model directly. Deprecated APIs and version-dependent compatibility branches are not retained.

```text
TUnit JSON → parse → TUnit native fields → TUnit presenter → shared UI primitives
```

Each framework owns its parser, native types and presenter. Shared UI primitives accept display props, such as text, a visual tone or a duration. Future presenters can combine these primitives with their framework-specific traces, steps or artifacts.

Public entries:

- `/tunit`: `parseTUnitReport`, `TUnitParseError` and native `TUnit*` types.
- `/tunit/ui`: `TUnitReport` and `TUnitReportLink`.
- `/ui`: `StatusBadge`, `Duration`, `ErrorDetail` and `StdoutPanel`.
- `/css/preset.css`: report-specific layout and status styles using Fumadocs theme variables.

## Native TUnit data

`parseTUnitReport` accepts decoded `.tunit-report.json` sidecar JSON, schema version 1. It validates the fields consumed by the presenter, then returns the input object unchanged. The caller owns file reads, network requests and routing.

Names and values remain native: `assemblyName`, `groups[].tests`, `displayName`, `output`, `errorOutput`, `exception.innerException`, `retryAttempt`, `spanId` and `parentSpanId`. Unknown fields, arbitrary status strings and explicit null values remain present. The parser adds no fields, defaults or status mappings.

The minimum shape contains `schemaVersion`, `assemblyName`, `groups` and each group's `className` and `tests`. A test requires `id`, `displayName` and `status`. Metadata and optional payloads are checked when supplied. Invalid known fields, duplicate test IDs or unsupported schema versions throw `TUnitParseError`; its `path` identifies the JSON field.

The presenter reads TUnit's supplied `summary` counters. For minimal reports without these counters, it derives display counts from the native tests. Retries remain attempt history within a test. Timestamp text is displayed as supplied, and duration values are milliseconds.

`TUnitReport` provides search, native outcome filters, details, output, retry attempts and a TUnit trace timeline. `selectedTestId` and `onTestSelect` let the host implement permalinks. `TUnitReportLink` embeds a link to the same native report in a document.

The presenter reuses Fumadocs Tabs, Accordion, Card, CodeBlock, Callout and button variants. Custom styles cover the test list, metrics, status badges and trace bars. Native components provide tab keyboard navigation, disclosure controls and code-copy buttons.

Report layout uses container queries: test columns and metrics adapt to the report's available width, including space consumed by a host sidebar or table of contents. Match your Fumadocs layout with its corresponding page components. Spacious and Glass also require their layout styles, imported as `fumadocs-ui/css/generated/spacious.css` or `fumadocs-ui/css/generated/glass.css`.

Use the host's `<DocsPage full>` for a dedicated report page. Spacious's native page width is 760 px by default; `full` sets the limit to 1200 px, while the report adapts to the available space inside it.

Flux in `@fumadocs/base-ui@16.16.2` has a page-container width issue: its centred outer layout can shrink the page when content uses inline-size containment. The workspace example applies a dependency patch that adds `w-full` to Flux's native `main`; it keeps the native page limits and alignment. This patch is not included in the published report package. A host using this affected Flux version needs the same dependency fix. Other demonstrated layouts use their native page configuration directly.

Both support `locale="en"` (default) and `locale="zh"`. Fumadocs layouts and Next.js routing belong to the host application.

## Shared UI primitives

```tsx
import { StatusBadge, Duration, ErrorDetail, StdoutPanel } from 'fumadocs-test-reports/ui';

<StatusBadge status="failed" tone="danger" />;
<Duration value={42} />;
<ErrorDetail message="Expected 400, received 200" stack="at example.test.ts:12" />;
<StdoutPanel content="Connection refused" title="Standard error" />;
```

`StatusBadge` displays the caller's text with a visual tone. The presenter decides what a native status means. `Duration` treats a missing or null value as unknown and displays a recorded zero as zero. Error and output components render plain, escaped text; the presenter owns exception nesting and retry semantics.

This version implements TUnit. Additional frameworks will have their own native parsers and presenters. Dashboard, history and cross-framework search are future features.

References: [TUnit's native report model](https://github.com/thomhurst/TUnit/blob/main/src/TUnit.Engine/Reporters/Html/HtmlReportDataModel.cs), [its sidecar writer](https://github.com/thomhurst/TUnit/blob/main/src/TUnit.Engine/Reporters/Aggregation/ReportDataJson.cs), and [Fumadocs OpenAPI's package layout](https://github.com/fuma-nama/fumadocs/tree/dev/packages/openapi).

## Local release

Run the workspace checks from the repository root:

```sh
pnpm test --run
pnpm types:check
pnpm build
pnpm lint
pnpm lint:format
```

Review the public package from `packages/test-reports`:

```sh
npm publish --dry-run --ignore-scripts
```

`pnpm pack` rebuilds the package through `prepack`. Published files are limited to `dist`, `css`, the package README, license and manifest. Example reports and test fixtures stay in the repository.

After logging in to npm, publish from `packages/test-reports`:

```sh
pnpm publish --access public --no-git-checks
```

The manifest specifies the public npm registry. Publishing requires npm account access and any authentication challenge configured for that account.
