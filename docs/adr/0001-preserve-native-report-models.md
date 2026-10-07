# Keep exported native report models

The test report integration reads native reports from test frameworks and reporting tools. Each supported format has its own parser, native report model, and framework presenter.

The parser keeps source fields. The framework presenter interprets outcomes, attempts, traces, and other details from that native report model.

A common model for all frameworks would need more shared fields as support increases. Shared UI primitives permit reuse of display behavior while each framework presenter keeps its own data rules.

TUnit and Vitest JSON have separate parsers and framework presenters. Vitest support starts with the official JSON reporter export. Fields absent from that export are outside this native report format's capabilities.

The lists share styles and shared UI primitives. Group structure, test selection, and details remain specific to each framework presenter. Extract higher-level display components when both framework presenters need the same behavior.

JUnit XML can become another native report format. It does not define the native report models of other frameworks.

Parsers check the known fields that framework presenters use. They return the same source object. Unknown fields and outcome strings remain at their original paths.

Optional fields can be absent if the native report model permits this. Invalid known fields cause an error with a JSON path. The parser does not silently remove tests.

Summary counts can differ from visible details. An export can contain only some test details.

Dashboard, history, and search across frameworks can use separate data projections in the future. These projections will serve those features. Framework presenters will continue to use their native report models for test details.
