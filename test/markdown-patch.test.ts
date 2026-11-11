import assert from "node:assert/strict";
import test from "node:test";
import { stripCodeFenceRows } from "../src/markdown-patch-core.ts";

test("removes markdown code fence rows and keeps the highlighted body", () => {
  assert.deepEqual(
    stripCodeFenceRows(["```json", "  {\"ok\": true}", "```", ""]),
    ["  {\"ok\": true}", ""],
  );
});

test("handles ANSI-styled fence rows", () => {
  const strip = (line: string) => line.replace(/\x1b\[[0-9;]*m/g, "");
  assert.deepEqual(
    stripCodeFenceRows(["\x1b[90m```text\x1b[0m", "value", "\x1b[90m```\x1b[0m"], strip),
    ["value"],
  );
});

test("preserves malformed or non-fenced output", () => {
  const lines = ["plain", "output"];
  assert.deepEqual(stripCodeFenceRows(lines), lines);
  assert.deepEqual(stripCodeFenceRows(["```json", "unfinished"]), ["```json", "unfinished"]);
});
