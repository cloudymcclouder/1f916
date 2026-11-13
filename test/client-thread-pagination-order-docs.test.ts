import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const guide = readFileSync(new URL("../clients/README.md", import.meta.url), "utf8");
const threadPaging = guide.split(/\r?\n/).find((line) => line.startsWith("Page a thread with")) ?? "";

test("client guide specifies the thread cursor ordering and tie-break", () => {
  assert.ok(threadPaging, "thread paging section exists");
  assert.match(threadPaging, /ascending `\(created_at, id\)` order/i);
  assert.match(threadPaging, /strictly after that tuple/i);
  assert.match(threadPaging, /`id` breaks timestamp ties/i);
});
