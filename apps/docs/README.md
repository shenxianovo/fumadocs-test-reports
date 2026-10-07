# Integration documentation

Run `pnpm dev:docs` from the workspace root. Then open <http://127.0.0.1:3010/zh/docs>.

Each example uses a native Fumadocs layout with the matching page components. Separate report pages use `<DocsPage full>`.

Report styles arrange content inside the available page width. The host selects the layout and controls its dimensions.

## Flux dependency fix

In `@fumadocs/base-ui@16.16.2`, Flux's outer container uses `items-center`. Its page `main` has no explicit width.

A child with `container-type: inline-size` does not supply its intrinsic inline size to the parent. These settings can make the page too narrow, even with `full` enabled.

This workspace applies `patches/@fumadocs__base-ui@16.16.2.patch` through `pnpm-workspace.yaml`. The patch adds `w-full` to the native Flux `main`.

The patch keeps the outer alignment and page padding. Native article width limits stay at 900 px normally and 1200 px with `full`. The test report integration has no layout-name checks or host selectors.

The published package does not include this dependency patch. Remove the workspace patch after an upstream update corrects the container width.

## Minimum reproduction

Use the native Flux `DocsLayout`, `DocsPage`, `DocsTitle`, and `DocsBody` with the normal stylesheet:

```tsx
<DocsLayout tree={{ name: 'Example', children: [] }}>
  <DocsPage full>
    <DocsTitle>Flux example</DocsTitle>
    <DocsBody>
      <div className="flex flex-col gap-24 text-sm @container">
        <div className="flex flex-col gap-x-6 gap-y-4 @4xl:flex-row @4xl:items-start">
          <div className="min-w-0 flex-1">Operation</div>
          <div className="@4xl:w-[400px]">Example</div>
        </div>
      </div>
    </DocsBody>
  </DocsPage>
</DocsLayout>
```

This example uses the container and column structure of the default Fumadocs OpenAPI layout. It reproduces the narrow page without the test report integration.

The native page container must supply the available width. Its children can then use container queries.

See these upstream references:

- [Flux outer container](https://github.com/fuma-nama/fumadocs/blob/dev/packages/base-ui/src/layouts/flux/slots/container.tsx).
- [Flux page container](https://github.com/fuma-nama/fumadocs/blob/dev/packages/base-ui/src/layouts/flux/page/slots/container.tsx).
- [OpenAPI page layout](https://github.com/fuma-nama/fumadocs/blob/dev/packages/openapi/src/ui/base.tsx).
- [OpenAPI operation columns](https://github.com/fuma-nama/fumadocs/blob/dev/packages/openapi/src/ui/operation/index.tsx).

## Browser regression checks

The browser determines layout widths. Package tests that render HTML on the server cannot measure these widths.

Repeat these checks after changes to report styles or Fumadocs:

1. Open each `/{lang}/layouts/{name}` page. Check `docs`, `spacious`, `notebook`, `flux`, and `glass`.
2. Set the viewport to 1440 × 900. Check that the list fills the article content width.
3. Open a group and a test row. Check that its details fill the width below the row.
4. Check Flux's widths. `#nd-page` must be 1200 px wide, and `.ftr-report` must be 1136 px wide.
5. Set the viewport to 390 × 844. Check that long names wrap below the status and duration.
6. Check that content stays inside the page at mobile and intermediate widths.
7. Select a failed test. Check its exception and output.
8. Select the retry example. Check its attempt tab.
9. Check search and outcome filters.
10. Open `/zh/docs/reports/heartbeat`. Check the trace tab from the real native report.
11. Use Enter and Space to open and close rows. Check that only one row is open across all groups.
12. Check the URL after selection. Reload the page and check that the same test opens.
13. Close the row. Check that the URL no longer contains the test selection.
14. Change search and filters. Check that these actions do not select another test.
15. Check light and dark themes. Compare Accordion, Tabs, and code-copy controls with the host's native controls.

Before the Flux fix, the report and the OpenAPI reproduction each had a width of only 306 px.

## Vitest and language checks

Open `/zh/docs/reports/fumadocs` for the complete upstream Fumadocs native report. The Vitest JSON fixture and separate provenance file are in `packages/test-reports/test/fixtures/vitest`.

Open `/zh/docs/reports/vitest-sample` for example data. Its label identifies the data as handwritten. The examples include failures, collection errors, duplicate names, and unknown outcomes.

The sidebar's “Vitest native HTML” link opens `/reports/vitest-report.html`. The official `@vitest/ui` reporter exported this file in the same test run as the JSON fixture. The HTML file is unchanged and needs no separate assets.

Compare the native HTML report with the Vitest framework presenter. The static HTML report cannot run tests again. Export both native reports in the same test run when you update them.

For Vitest 5.0.3, both native reports show 87 passing files and 656 passing tests.

| Native HTML report                   | Vitest JSON framework presenter                                |
| ------------------------------------ | -------------------------------------------------------------- |
| Project filters and nested suites.   | Test assertions in file groups.                                |
| Duration sort and slow-test filters. | Search and outcome filters.                                    |
| Test-file source and module graphs.  | Fumadocs controls, host translations, and documentation links. |
| Console output from the HTML export. | Outcome and duration from the JSON export.                     |

The official JSON export has no console logs or file source. For example, the native HTML Console shows a `stderr` entry for one passing `createLocalSource` test. Its name is “a throwing parse is reported and skipped, not fatal”. The JSON export supplies only its outcome and duration.

Check these behaviors:

1. Use search and outcome filters.
2. Select both assertions with the same name. Check that each has its own details and URL selection.
3. Select the file collection error. Check its error details.
4. Set the language control to English. Check that UI labels change and native test names and error text stay unchanged.
5. Repeat the checks at a narrow viewport.

See the root README for the export procedure.

## Inline report layout

Both framework presenters use a list with inline details. Test rows use the full content width. Groups start closed. Their headings show the number of visible test rows. Use Expand all or Collapse all as needed. Native Fumadocs Accordion opens details below each row. Native Tabs select the detail views.

The host displays one page title and sets `showHeader={false}` on the framework presenter. Summary counts use one strip. Labels appear above larger numeric values. Passed and failed counts use the host's semantic colors. The framework presenter has no separate run-status badge. The test report integration uses the current Fumadocs theme colors.

The host uses Geist for normal text and JetBrains Mono for code. Framework presenters use the host's monospace font for file paths and code identifiers. Code blocks and stack output use native Fumadocs code controls. Durations and counts use tabular digits in the normal text font.

Search and outcome filters open matching groups. Test links reveal the selected test's group. Closing a group keeps its test selection. Outcome filters and group actions share one toolbar. The controls can wrap at narrow widths.

A group shows Passed only when all its tests passed. Vitest files must also have a passing file outcome and no collection error. This label uses the complete group, before search or outcome filters apply. Test names inherit typography from the host.

File captions show shortened paths. The caption's title and the expanded details keep the complete source path.

### Group regression procedure

Repeat these checks for both framework presenters:

1. Open a report with no test selection. Check that groups start closed.
2. Use Enter to open a group. Select a test and reload the page. Check that its group and details open.
3. Use Collapse all. Check that the test selection stays in the URL. Use Expand all to show the groups again.
4. Search for a test name. Check that matching groups open. Search for an absent name and check the empty result.
5. Clear search. Check the group outcome labels before and after outcome filters.
6. Check that outcome filters and group actions align at desktop widths. Check wrapping at narrow widths.
7. Compare test-name typography with the host's normal controls. Check that file paths use the host's monospace font.

## Stable document scroll

The host controls the document viewport. In `app/global.css`, `html` uses `scrollbar-gutter: stable`. This reserves space for classic scrollbars on short pages too.

Fumadocs uses the same rule in its [documentation app](https://github.com/fuma-nama/fumadocs/blob/dev/apps/docs/app/global.css). Its [OpenAPI](https://github.com/fuma-nama/fumadocs/blob/dev/examples/openapi/app/global.css), [AsyncAPI](https://github.com/fuma-nama/fumadocs/blob/dev/examples/asyncapi/app/global.css), and [GraphQL](https://github.com/fuma-nama/fumadocs/blob/dev/examples/graphql/app/global.css) examples also set this rule in their host stylesheets.

The [Spacious page](https://github.com/fuma-nama/fumadocs/blob/dev/packages/base-ui/src/layouts/spacious/page/index.tsx) has its own desktop scroll container. It uses `md:scrollbar-gutter-stable` on that container.

This host rule applies to all routes in the documentation app. The published test report integration stylesheet has no `html` rule. It does not set the host's scrollbar policy.

Framework presenters use normal document flow. The host controls global overflow and sidebar dimensions. The test report integration does not add separate scroll boxes for the list or details.

At 1920 × 1080, classic scrollbars used 15 px. A switch between Fumadocs and Heartbeat moved the sidebar content 7.5 px before the fix. Fumadocs had 656 tests; Heartbeat had one test.

The native Docs grid divides spare width between its two sides. The root stylesheet now keeps the available layout width constant. The measured sidebar width, right edge, and title position each change by 0 px.

Overlay scrollbars use no gutter space. See the [scrollbar-gutter reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-gutter).

### Sidebar regression procedure

Set the viewport to 1920 × 1080. Use the native sidebar links to switch from Fumadocs to Heartbeat and back. Check that no page has horizontal overflow. Measure the sidebar width, right edge, and title position on each page. Each measurement must change by no more than 1 px.

This procedure reproduced the shift before the CSS fix. The measurements stayed constant after the fix. Server-rendered package tests cannot measure this browser behavior.

Also check actions that can change document overflow without a route change:

1. Search for a name that matches no test in the long report.
2. Open and close Heartbeat's trace view.
3. Repeat at desktop and mobile widths.
4. Check that the mobile sidebar drawer and theme controls work as native Fumadocs controls.

## URL selection

`components/use-report-selection.ts` controls URL selection for both framework presenter wrappers. It uses Next.js native History support with `useSearchParams`.

The hook keeps the current pathname, other query parameters, hash, and scroll position. Test expansion changes client state. It does not navigate to fetch a different native report.

Use native sidebar links to move between native reports. Framework presenters control their native test IDs and details. The host hook accepts only an optional selection string.
