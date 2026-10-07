# Keep the upstream checkout separate from the test report integration

Fumadocs tests supply real Vitest native reports for this test report integration. Keep the upstream checkout beside this repository. The upstream checkout has its own dependencies and test configuration.

The test report integration reads exported native report files. Its package and documentation stay independent of upstream development. The upstream monorepo remains outside this workspace.

The documentation app moved from `examples/docs` to `apps/docs`. It keeps the layout examples and report regression checks.

Test report integration code stays in `packages/test-reports`. Export tools and report fixtures stay in this repository. Separate provenance files record the source of each native report export.

The export tool reads a separately prepared upstream checkout. It runs all upstream Vitest projects. It writes the original native report files and separate provenance data.
