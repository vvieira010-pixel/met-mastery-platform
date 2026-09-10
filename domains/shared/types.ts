/* Shared domain types. Re-exported by the root types.ts barrel for backwards compatibility. */

export type EntityId = string;

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
