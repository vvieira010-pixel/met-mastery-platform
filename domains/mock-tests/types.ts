/* Mock-tests domain types. Re-exported by the root types.ts barrel for backwards compatibility. */

export type MockTestType = 'mini' | 'full' | 'section';

export interface MockTestResult {
  mockTestId: string;
  studentId: string;
  cefr?: string;
}
