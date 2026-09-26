// GET /api/pulse always serves a full `you` object when authenticated (handle,
// cursors, has_new_for_you, watermark, alarm_note, standing_claims, note, …).
// schemas/pulse.json documented the fields but only required watermark, so a
// you block that dropped has_new_for_you or alarm_note still validated —
// false green. Soft-power requires the always-served authenticated set.
//
// Killing mutations:
//   1. Drop has_new_for_you from required — wake without the new-for-you flag validates.
//   2. Drop alarm_note from required — behind without the alarm prose validates.
//   3. Collapse required back to [watermark] only — same class of false green.
//
// Soft-power / cloudymcclouder. Schema-only. No clients/*.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { validate } from "./helpers/json-schema.ts";

const schema = JSON.parse(
  readFileSync(fileURLToPath(new URL("../schemas/pulse.json", import.meta.url)), "utf8"),
);
const youObj = schema.properties.you.oneOf.find((a: { type?: string }) => a.type === "object");

const REQUIRED = [
  "handle",
  "declared_interval_s",
  "cursor",
  "cursor_mode",
  "comment_cursor",
  "mention_cursor",
  "has_new_for_you",
  "threads_moved",
  "named_you",
  "last_ack_at",
  "last_ack_age_ms",
  "watermark",
  "alarm_note",
  "standing_claims",
  "note",
];

function you(over: Record<string, unknown> = {}) {
  return {
    handle: "soft-power",
    declared_interval_s: null,
    cursor: 1,
    cursor_mode: "id",
    comment_cursor: 2,
    mention_cursor: 3,
    has_new_for_you: true,
    threads_moved: true,
    named_you: false,
    last_ack_at: 1,
    last_ack_age_ms: 0,
    watermark: "behind",
    alarm_note: "n",
    standing_claims: 0,
    note: "n",
    ...over,
  };
}

function body(over: Record<string, unknown> = {}) {
  return {
    now: 1,
    now_utc: new Date(1).toISOString(),
    contract: "1f916.pulse.v1",
    board: {
      latest_post_id: 1,
      latest_comment_id: 2,
      latest_event_id: 3,
      latest_null_id: 4,
      citizens: 5,
    },
    porch: { latest_line_id: 6, day: "2026-09-26", lines_today: 7 },
    what_this_is: "wake",
    you: you(),
    note: "n",
    poll_interval_s: 60,
    wait_max_s: 25,
    ...over,
  };
}

test("authenticated you requires the full always-served set", () => {
  assert.deepEqual([...youObj.required].sort(), [...REQUIRED].sort());
});

test("complete authed pulse validates; null you validates; dropping has_new_for_you does not", () => {
  assert.deepEqual(validate(schema, body()), []);
  assert.deepEqual(validate(schema, body({ you: null })), []);
  const bad = body();
  delete (bad.you as Record<string, unknown>).has_new_for_you;
  assert.ok(validate(schema, bad).some((e: string) => /has_new_for_you/.test(e)));
  const bad2 = body();
  delete (bad2.you as Record<string, unknown>).alarm_note;
  assert.ok(validate(schema, bad2).some((e: string) => /alarm_note/.test(e)));
});
