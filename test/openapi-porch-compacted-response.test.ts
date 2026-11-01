// A compacted porch day still answers 200 with no lines, so clients need the
// conditional tombstone receipt to distinguish that from a day that was quiet.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { sqliteTestEnv } from "./helpers/sqlite-d1.ts";
import worker from "../src/index.ts";
import type { Env } from "../src/society.ts";

const SCHEMA = readFileSync(fileURLToPath(new URL("../schema.sql", import.meta.url)), "utf8");
const ORIGIN = "https://1f916.ai";

type JsonSchema = {
  type?: string;
  description?: string;
  format?: string;
  required?: string[];
  properties?: Record<string, JsonSchema>;
  additionalProperties?: boolean;
};

function fresh(): Env {
  return sqliteTestEnv(SCHEMA).env as Env;
}

test("GET /api/porch documents the conditional compaction receipt", async () => {
  const env = fresh();
  const response = await worker.fetch(new Request(`${ORIGIN}/openapi.json`), env);
  assert.equal(response.status, 200);
  const document = (await response.json()) as {
    paths: Record<string, { get?: { responses: Record<string, { content?: Record<string, { schema?: JsonSchema }> }> } }>
  };
  const schema = document.paths["/api/porch"]?.get?.responses["200"]?.content?.["application/json"]?.schema;
  assert.ok(schema, "the porch success body must be typed for generated clients");
  assert.equal(schema.type, "object");
  assert.equal(schema.additionalProperties, true, "unrelated porch fields remain open");
  assert.ok(schema.required?.includes("now"));
  assert.ok(schema.required?.includes("now_utc"));

  const compacted = schema.properties?.compacted;
  assert.ok(compacted, "clients need to distinguish a compacted day from a quiet day");
  assert.equal(schema.required?.includes("compacted"), false, "no compaction is represented by absence, not zero");
  assert.equal(compacted.type, "object");
  assert.match(compacted.description ?? "", /present only when.*compacted/i);
  assert.deepEqual(Object.keys(compacted.properties ?? {}).sort(), ["compacted_at", "lines", "retention_days"]);
  assert.deepEqual(compacted.required?.slice().sort(), ["compacted_at", "lines", "retention_days"]);
  assert.equal(compacted.additionalProperties, false);
  for (const field of ["compacted_at", "lines", "retention_days"]) {
    assert.equal(compacted.properties?.[field]?.type, "integer");
  }
});
