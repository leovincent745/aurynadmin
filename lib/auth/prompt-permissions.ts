import type { UserRole } from "@prisma/client";

/** Actions enforced on prompt-system APIs and UI. */
export type PromptPermission =
  | "create"
  | "edit"
  | "validate"
  | "submit-review"
  | "approve"
  | "activate"
  | "rollback"
  | "archive"
  | "physician-approval";

/** Prompt System capabilities returned to the client and enforced on mutating APIs. */
export interface PromptSystemPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canRunValidation: boolean;
  canSubmitReview: boolean;
  canApproveReview: boolean;
  canActivate: boolean;
  canRollback: boolean;
  canArchive: boolean;
  canRecordPhysicianApproval: boolean;
  /** @deprecated Use canActivate — kept for existing UI */
  canPublish: boolean;
}

const DENIED: PromptSystemPermissions = {
  canView: false,
  canCreate: false,
  canEdit: false,
  canRunValidation: false,
  canSubmitReview: false,
  canApproveReview: false,
  canActivate: false,
  canRollback: false,
  canArchive: false,
  canRecordPhysicianApproval: false,
  canPublish: false,
};

function grant(partial: Partial<PromptSystemPermissions>): PromptSystemPermissions {
  const canActivate = partial.canActivate ?? false;
  return {
    ...DENIED,
    canView: true,
    ...partial,
    canActivate,
    canPublish: partial.canPublish ?? canActivate,
  };
}

const FULL_EDITOR: Omit<PromptSystemPermissions, "canView" | "canPublish"> = {
  canCreate: true,
  canEdit: true,
  canRunValidation: true,
  canSubmitReview: true,
  canApproveReview: true,
  canActivate: true,
  canRollback: true,
  canArchive: true,
  canRecordPhysicianApproval: true,
};

/**
 * Role → permission matrix for the Prompt System.
 *
 * | Role        | create | edit | validate | submit | approve | activate | rollback | archive |
 * |-------------|--------|------|----------|--------|---------|----------|----------|---------|
 * | super_admin | ✓      | ✓    | ✓        | ✓      | ✓       | ✓        | ✓        | ✓       |
 * | admin       | ✓      | ✓    | ✓        | ✓      | ✓       | ✓        | ✓        | ✓       |
 * | developer   | ✓      | ✓    | ✓        | ✓      | —       | —        | —        | —       |
 * | reviewer    | —      | —    | —        | —      | ✓       | —        | —        | —       |
 * | physician   | —      | —    | —        | —      | —       | —        | —        | —       |
 * | viewer      | —      | —    | —        | —      | —       | —        | —        | —       |
 */
export function getPromptSystemPermissions(role: UserRole): PromptSystemPermissions {
  switch (role) {
    case "super_admin":
    case "admin":
      return grant({ ...FULL_EDITOR, canActivate: true, canPublish: true });
    case "developer":
      return grant({
        canCreate: true,
        canEdit: true,
        canRunValidation: true,
        canSubmitReview: true,
      });
    case "reviewer":
      return grant({ canApproveReview: true });
    case "physician":
      return grant({ canRecordPhysicianApproval: true });
    case "viewer":
      return grant({});
    default:
      return { ...DENIED };
  }
}

const PERMISSION_MAP: Record<PromptPermission, keyof PromptSystemPermissions> = {
  create: "canCreate",
  edit: "canEdit",
  validate: "canRunValidation",
  "submit-review": "canSubmitReview",
  approve: "canApproveReview",
  activate: "canActivate",
  rollback: "canRollback",
  archive: "canArchive",
  "physician-approval": "canRecordPhysicianApproval",
};

export function hasPromptPermission(
  permissions: PromptSystemPermissions,
  permission: PromptPermission,
): boolean {
  return Boolean(permissions[PERMISSION_MAP[permission]]);
}

export function canEditPromptSystem(role: UserRole): boolean {
  return getPromptSystemPermissions(role).canEdit;
}

export function canAccessPromptSystemConsole(role: UserRole): boolean {
  return getPromptSystemPermissions(role).canView;
}
