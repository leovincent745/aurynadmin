/** Schema-driven input/output field definitions for Prompt System IO tabs. */

export type PromptIoFieldKind =
  | "string"
  | "cuid"
  | "number"
  | "boolean"
  | "enum"
  | "array"
  | "server-only";

export interface PromptIoFieldSchema {
  key: string;
  label: string;
  description: string;
  /** Display type label (legacy compat). */
  type: string;
  kind: PromptIoFieldKind;
  required: boolean;
  source: string;
  /** Included in admin test form / JSON editor. */
  editable: boolean;
  validation?: string;
  downstream?: string;
  enumValues?: string[];
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  minItems?: number;
}

export interface PromptPipelineIoSection {
  endpoint: string;
  fields: PromptIoFieldSchema[];
  requiredKeys: string[];
  exampleJson: Record<string, unknown>;
  /** Keys admins can edit when running test payloads. */
  editableKeys: string[];
  /** Version this schema applies to (e.g. chat-response-v1). */
  schemaVersion: string;
  /** Human label: v3 (draft). */
  versionLabel: string;
  /** Instruction row id the schema is bound to. */
  instructionVersionId: string;
}

export interface OutputValidationContext {
  instructionVersionId: string;
  versionNumber: number;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface PayloadValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  normalized: Record<string, unknown> | null;
}
