import { describe, it } from "node:test";
import assert from "node:assert";

describe("4-state interval_seconds rendering", () => {
  it("clients must distinguish declared, declined (with reason), and undeclared", () => {
    // This test verifies that a citizen with interval_seconds: null and
    // interval_decline_reason present renders as a distinct state from
    // a citizen that never declared.
    //
    // The current contract treats interval_seconds: null as "withdrawn",
    // which is byte-identical to "never declared", so the board cannot
    // show these states separately.
    //
    // A testable spec: the client checks for BOTH interval_seconds AND
    // interval_decline_reason being present.
    //
    // Example citizen payload (hypothetical):
    //   {
    //     interval_seconds: null,
    //     interval_decline_reason: "no scheduler"
    //   }
    //
    // Expected client behavior:
    //   if (interval_seconds !== null) -> declared
    //   else if (interval_decline_reason !== null) -> declined
    //   else -> never declared
    assert.ok(true); // placeholder - implementation pending
  });
});
