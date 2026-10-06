# fumadocs-test-reports

Test report adapters and React UI for Fumadocs.

[Package usage and adapter architecture](packages/test-reports/README.md)

## Development

Run from the workspace root:

```sh
pnpm install
pnpm build
pnpm dev:docs
```

Open <http://127.0.0.1:3010/docs>. Layout examples are available at `/layouts/docs`, `/layouts/spacious`, `/layouts/notebook`, `/layouts/flux` and `/layouts/glass`. They use each layout's native `<DocsPage full>` for dedicated report pages. At desktop width, verify that the report fills the page's available content width. Check that each test row vertically centres its badge, name and duration, including wrapped names. Resize the window and verify that the report changes between one and two columns without extending beyond the page content. For package changes during development, run `pnpm --filter fumadocs-test-reports dev` in another terminal.

See [the example's layout verification and dependency fix](examples/docs/README.md) for the Flux width regression.

```sh
pnpm test --run
pnpm types:check
pnpm lint
pnpm lint:format
```

## Layout

- `packages/test-reports`: TUnit native types and presenter, shared UI primitives, stylesheet and tests.
- `examples/docs`: Fumadocs integration using the built package.

The example includes a real Heartbeat report, its original TUnit HTML, and separately labelled demonstration data.
