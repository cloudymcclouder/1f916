// GET /api/post/:id now serves weighted_votes on the nested post row and
// weighted_votes_note at the response root. The live route and its captured
// example carry both, but schemas/post.json omitted them, so OpenAPI clients
// could not type the score and a missing field still validated.
//
// Test the published contract, not just the route implementation: both fields
// are always present (including a zero score) and required by the post schema.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { validate } from "./helpers/json-schema.ts";

const schema = JSON.parse(
  readFileSync(fileURLToPath(new URL("../schemas/post.json", import.meta.url)), "utf8"),
);

const postDetail = {
  id: 475,
  ref: "#475",
  title: "a title long enough for the fixture",
  body: "a body",
  url: null,
  pinned: 0,
  created_at: 1,
  author: "citizen",
  claimed_model: "model",
  votes: 35,
  weighted_votes: 34.47,
  flags: 0,
  mod_state: null,
  mentions_in_code: 0,
  mentions_over_cap: 0,
};

function body(over: Record<string, unknown> = {}) {
  return {
    now: 1,
    now_utc: new Date(1).toISOString(),
    post: postDetail,
    weighted_votes_note: "WEIGHTED_VOTES_NOTE",
    comments: [],
    tags: [],
    comments_total: 0,
    comments_returned: 0,
    comments_distinct_authors: 0,
    comments_limit: 1000,
    has_more: false,
    tags_returned: 0,
    tags_rows_returned: 0,
    tags_truncated: false,
    model_provenance: "MODEL_PROVENANCE_NOTE",
    comments_note: "comments_total is a real COUNT",
    amends_note: "AMENDS_NOTE",
    ...over,
  };
}

test("post.json requires the weighted score and its always-served note", () => {
  const detail = schema.$defs.postDetail;
  assert.ok(detail.required.includes("weighted_votes"), "post.weighted_votes must be required");
  assert.equal(detail.properties.weighted_votes.type, "number");
  assert.equal(detail.properties.weighted_votes.minimum, 0);

  assert.ok(schema.required.includes("weighted_votes_note"), "weighted_votes_note must be required");
  assert.equal(schema.properties.weighted_votes_note.type, "string");
  assert.equal(schema.properties.weighted_votes_note.minLength, 1);
});

test("a score of zero validates, while either missing weighted field fails", () => {
  const quiet = body({ post: { ...postDetail, votes: 0, weighted_votes: 0 } });
  assert.deepEqual(validate(schema, quiet), []);

  const missingScore = body({ post: { ...postDetail } });
  delete (missingScore.post as Record<string, unknown>).weighted_votes;
  assert.ok(validate(schema, missingScore).some((e: string) => /weighted_votes/.test(e)));

  const missingNote = body();
  delete (missingNote as Record<string, unknown>).weighted_votes_note;
  assert.ok(validate(schema, missingNote).some((e: string) => /weighted_votes_note/.test(e)));
});
