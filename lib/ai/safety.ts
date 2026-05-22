const URGENT_PATTERNS = [
  /chest pain/i,
  /shortness of breath/i,
  /can't breathe/i,
  /cannot breathe/i,
  /severe bleeding/i,
];

const REFUSAL_PATTERNS = [
  /diagnos(e|is|ing)/i,
  /what condition do i have/i,
  /stop (taking|my) (medication|medicine|meds)/i,
  /should i stop (taking|my)/i,
];

export type SafetyCheckResult =
  | { action: "allow" }
  | { action: "escalation"; reason: string }
  | { action: "refusal"; reason: string };

export function checkUserMessageSafety(message: string): SafetyCheckResult {
  for (const pattern of URGENT_PATTERNS) {
    if (pattern.test(message)) {
      return {
        action: "escalation",
        reason: "Urgent symptom language detected",
      };
    }
  }

  for (const pattern of REFUSAL_PATTERNS) {
    if (pattern.test(message)) {
      return {
        action: "refusal",
        reason: "Request requires medical judgment or diagnosis boundary",
      };
    }
  }

  return { action: "allow" };
}

export const SAFETY_ESCALATION_REPLY =
  "Your symptoms may need urgent medical attention. Please seek emergency care or contact a healthcare provider immediately. I cannot assess emergencies in chat.";

export const SAFETY_REFUSAL_REPLY =
  "I cannot provide a diagnosis or advise stopping or changing prescribed medication. Please contact your physician for medical decisions. I can share general wellness education only.";
