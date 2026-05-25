import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { redactSecrets, sanitizeErrorSummary } from "@/lib/ai/redact-secrets";

describe("redactSecrets", () => {
  it("redacts OpenAI keys and DATABASE_URL", () => {
    const input =
      "Failed: sk-proj-abc123secret and DATABASE_URL=postgres://user:pass@host/db";
    const out = redactSecrets(input);
    assert.ok(!out.includes("sk-proj-abc123secret"));
    assert.ok(!out.includes("postgres://user:pass"));
    assert.ok(out.includes("[redacted]"));
  });

  it("redacts session and generic API env patterns", () => {
    const input = "SESSION_SECRET=supersecret OPENAI_API_KEY=sk-abc1234567890";
    const out = redactSecrets(input);
    assert.ok(!out.includes("supersecret"));
    assert.ok(!out.includes("sk-abc1234567890"));
  });
});

describe("sanitizeErrorSummary", () => {
  it("returns null for empty input", () => {
    assert.equal(sanitizeErrorSummary(""), null);
    assert.equal(sanitizeErrorSummary(null), null);
  });

  it("redacts before returning", () => {
    const out = sanitizeErrorSummary("Error Bearer eyJhbGciOiJIUzI1NiJ9.xyz");
    assert.ok(out?.includes("[redacted]"));
    assert.ok(!out?.includes("eyJhbGciOiJIUzI1NiJ9"));
  });
});
