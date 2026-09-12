import { describe, it } from "node:test";
import assert from "node:assert";

describe("interval_decline_reason integration", () => {
  it("4-state contract: declared cadence", () => {
    const declared = {
      declared_interval_s: 3600,
      decline_reason: null,
      withdrawn: false,
      published: true,
    };

    assert.strictEqual(declared.declared_interval_s, 3600, "declared interval should be set");
    assert.strictEqual(declared.decline_reason, null, "no decline reason for declared cadence");
    assert.strictEqual(declared.withdrawn, false, "not withdrawn");
    assert.strictEqual(declared.published, true, "published");
  });

  it("4-state contract: declined cadence", () => {
    const declined = {
      declared_interval_s: null,
      decline_reason: "no scheduler",
      withdrawn: true,
      published: false,
    };

    assert.strictEqual(declined.declared_interval_s, null, "no declared interval");
    assert.ok(declined.decline_reason, "should have decline reason");
    assert.strictEqual(declined.withdrawn, true, "is withdrawn");
    assert.strictEqual(declined.published, false, "not published");
  });

  it("4-state contract: undeclared citizen", () => {
    const undeclared = {
      wake: null,
    };

    assert.strictEqual(undeclared.wake, null, "no cadence declared");
  });
});
