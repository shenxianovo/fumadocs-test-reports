# Documentation example

Run `pnpm dev:docs` from the workspace root and open <http://127.0.0.1:3010/docs>.

The example pairs each native Fumadocs layout with its corresponding page components. Dedicated report pages use `<DocsPage full>`. Report styles arrange content inside the available page width; they do not select a host layout or change its dimensions.

## Flux dependency fix

`@fumadocs/base-ui@16.16.2` renders Flux's outer container with `items-center`, while its page `main` has no explicit width. A child with `container-type: inline-size` does not contribute its content's intrinsic inline size. This combination can shrink the page even with `full` enabled.

The workspace applies `patches/@fumadocs__base-ui@16.16.2.patch` through `pnpm-workspace.yaml`. The patch adds `w-full` to the native Flux `main`. It leaves the outer alignment, page padding, and native article limits unchanged: 900 px normally and 1200 px with `full`. There are no layout-name checks or host selectors in the report package.

The dependency patch is local to this workspace. It is not part of the published report package. Remove it after upgrading to an upstream version that fixes this container width.

## Minimal reproduction

Use the native Flux `DocsLayout`, `DocsPage`, `DocsTitle` and `DocsBody` with its normal stylesheet:

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

This uses the same container and column structure as Fumadocs OpenAPI's default page layout. It reproduces the shrinkage without any test-report components. The native page container should provide the available width before its children apply container queries.

Upstream references: [Flux outer container](https://github.com/fuma-nama/fumadocs/blob/dev/packages/base-ui/src/layouts/flux/slots/container.tsx), [Flux page container](https://github.com/fuma-nama/fumadocs/blob/dev/packages/base-ui/src/layouts/flux/page/slots/container.tsx), [OpenAPI page layout](https://github.com/fuma-nama/fumadocs/blob/dev/packages/openapi/src/ui/base.tsx), and [OpenAPI operation columns](https://github.com/fuma-nama/fumadocs/blob/dev/packages/openapi/src/ui/operation/index.tsx).

## Browser regression checks

Browser layout determines this behavior. The package's server-rendered unit tests do not measure widths. Repeat these checks when changing report styles or upgrading Fumadocs:

1. Open each `/layouts/{name}` page: `docs`, `spacious`, `notebook`, `flux`, and `glass`.
2. At a 1440 × 900 viewport, verify that the report fills the article's content width and displays both test-list and detail columns. Flux's `#nd-page` should be 1200 px wide and `.ftr-report` should be 1136 px wide with the example's native padding. Before the fix, both the report and the OpenAPI-shaped reproduction were only 306 px wide in this example.
3. At 390 × 844, verify that both columns stack and no report content exceeds the page width. At intermediate widths, the report must use its available content width rather than the viewport width to choose its column layout.
4. Select a failed test and check its exception and output. Select the retry example and check its attempt tab. Search and outcome filters should continue to work. Use `/docs/reports/heartbeat` to check trace tabs supplied by the real report.
5. Check the vertical centres of each row's badge, name, and duration, including a wrapped test name.
