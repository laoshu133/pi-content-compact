import assert from "node:assert/strict";
import test from "node:test";
import { compactAssistantMarkdown } from "../src/markdown.ts";

test("compacts single-line path blocks in list items", () => {
  const input = [
    "- 工作目录：",
    "",
    "  ```",
    "  /Users/xiaomi/works/gd-ai-fde",
    "  ```",
    "",
    "- 启动程序：",
    "",
    "  ```",
    "  /Users/xiaomi/.bin/pi_a2a",
    "  ```",
  ].join("\n");

  assert.equal(
    compactAssistantMarkdown(input),
    [
      "- 工作目录：`/Users/xiaomi/works/gd-ai-fde`",
      "- 启动程序：`/Users/xiaomi/.bin/pi_a2a`",
    ].join("\n"),
  );
});

test("compacts plain-text labeled blocks", () => {
  const input = [
    "- stdout：",
    "",
    "  ```text",
    "  /tmp/service.stdout.log",
    "  ```",
  ].join("\n");
  assert.equal(compactAssistantMarkdown(input), "- stdout：`/tmp/service.stdout.log`");
});

test("keeps adjacent same-language code blocks separate", () => {
  const input = [
    "```json",
    "{\"event\":\"open\"}",
    "```",
    "",
    "```json",
    "{\"event\":\"close\"}",
    "```",
  ].join("\n");
  assert.equal(compactAssistantMarkdown(input), input);
});

test("does not merge code blocks with different languages", () => {
  const input = ["```json", "{}", "```", "", "```text", "value", "```"].join("\n");
  assert.equal(compactAssistantMarkdown(input), "```json\n{}\n```\n\n`value`");
});

test("keeps labeled code blocks for syntax highlighting", () => {
  const input = "- 配置：\n\n  ```json\n  {\"ok\":true}\n  ```";
  assert.equal(compactAssistantMarkdown(input), input);
});

test("keeps multi-line and unclosed blocks unchanged", () => {
  const multi = ["- 脚本：", "", "  ```", "  echo one", "  echo two", "  ```"].join("\n");
  const unclosed = ["- 脚本：", "", "  ```", "  echo one"].join("\n");
  assert.equal(compactAssistantMarkdown(multi), multi);
  assert.equal(compactAssistantMarkdown(unclosed), unclosed);
});

test("does not alter ordinary prose or non-assistant surfaces indirectly", () => {
  const input = "普通文本\n\n- 项目：`pi`";
  assert.equal(compactAssistantMarkdown(input), input);
});

test("supports tilde fences and backticks inside values", () => {
  const input = ["- 值：", "", "  ~~~", "  `literal`", "  ~~~"].join("\n");
  assert.equal(compactAssistantMarkdown(input), "- 值：`` `literal` ``");
});
