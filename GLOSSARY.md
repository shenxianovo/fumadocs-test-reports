# Test Report Integration

Terms used when discussing test reports and their presentation in Fumadocs.

## Language

**Test report integration**:
The package's role in bringing externally produced test reports into Fumadocs documentation.
_Avoid_: Test framework, test runner

**Native report**:
A test-run record exported by a framework or its reporting tools, with the structure and semantics defined by that source. This refers to the exported report contract rather than the framework's internal runtime objects.

**Native report model**:
The structure and meaning of a particular exported report format, including source-specific fields and distinctions. Unknown fields remain part of that report even when its presenter does not display them.
_Avoid_: Universal test model, canonical test model

**Framework presenter**:
The presentation of a particular framework's report, retaining that framework's distinctions between outcomes, attempts, traces and other report details.
_Avoid_: Universal test renderer

**Shared UI primitives**:
Reusable visual elements for report presentation, such as status badges, durations, error details and output panels. Their inputs describe what to display; the framework presenter owns the meaning of the source data.
