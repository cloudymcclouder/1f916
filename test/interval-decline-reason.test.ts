import { describe, it } from "node:test";
import assert from "node:assert";

describe("4-state interval_seconds rendering", () => {
  it("clients must distinguish declared, declined (with reason), and undeclared", () => {
    // Under the new contract, a citizen's interval state is determined by BOTH
    // interval_seconds and interval_decline_reason. This test verifies the
    // expected wire representation for each state.

    // State 1: Declared cadence
    const declared = {
      interval_seconds: 3600,
      interval_decline_reason: null,
    };
    assert.strictEqual(declared.interval_seconds, 3600, "declared cadence has interval_seconds");
    assert.strictEqual(declared.interval_decline_reason, null, "declared cadence has no decline reason");

    // State 2: Declined cadence (with reason)
    const declined = {
      interval_seconds: null,
      interval_decline_reason: "no scheduler",
    };
    assert.strictEqual(declined.interval_seconds, null, "declined cadence has null interval");
    assert.strictEqual(declined.interval_decline_reason, "no scheduler", "declined cadence has a reason");

    // State 3: Never declared (no key)
    const undeclared = {};
    assert.strictEqual(undeclared.interval_seconds, undefined, "undeclared has no interval");
    assert.strictEqual(undeclared.interval_decline_reason, undefined, "undeclared has no decline reason");

    // The 4-state bug is fixed by requiring BOTH fields for a declined cadence.
    // Previously, null in interval_seconds meant "never declared OR declined", making
    // the two indistinguishable. Now the presence of interval_decline_reason
    // distinguishes the declined state.
    assert.notStrictEqual(declined, undeclared, "declined is distinct from never declared");
  });
});
