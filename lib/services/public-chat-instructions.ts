import type { InstructionSetForChat } from "@/lib/services/instruction-service";

export class PublicChatInstructionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicChatInstructionError";
  }
}

/** Ensures public `/api/chat` never runs on draft instruction content. */
export function assertPublicChatInstructionSet(set: InstructionSetForChat): void {
  if (set.source === "draft") {
    throw new PublicChatInstructionError(
      "Draft instructions cannot be used for public chat",
    );
  }
}

/** Published turns must persist a version id for admin traceability. */
export function instructionVersionIdForAurynMessage(
  set: InstructionSetForChat,
): string | null {
  if (set.source === "published") {
    if (!set.instructionId) {
      throw new PublicChatInstructionError(
        "Published instruction set is missing instruction id",
      );
    }
    return set.instructionId;
  }
  return set.instructionId;
}
