/** Native JSON reporter fields. Extra source fields remain at their original paths. */
export interface VitestJsonAssertionResult {
  ancestorTitles: string[];
  fullName: string;
  title: string;
  status: string;
  duration?: number | null;
  failureMessages: string[] | null;
  location?: { line: number; column: number; [key: string]: unknown } | null;
  meta?: Record<string, unknown>;
  tags?: string[];
  [key: string]: unknown;
}

export interface VitestJsonTestFile {
  name: string;
  status: string;
  message: string;
  startTime: number;
  endTime: number;
  assertionResults: VitestJsonAssertionResult[];
  [key: string]: unknown;
}

export interface VitestJsonReport {
  numFailedTests: number;
  numFailedTestSuites: number;
  numPassedTests: number;
  numPassedTestSuites: number;
  numPendingTests: number;
  numPendingTestSuites: number;
  numTodoTests: number;
  numTotalTests: number;
  numTotalTestSuites: number;
  startTime: number;
  success: boolean;
  testResults: VitestJsonTestFile[];
  [key: string]: unknown;
}
