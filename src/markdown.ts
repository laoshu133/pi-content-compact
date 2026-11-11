export interface MarkdownTransformContext {
  messageType: string;
  isStreaming: boolean;
  availableWidth: number;
}

interface Fence {
  character: "`" | "~";
  length: number;
  indent: string;
}

interface SingleLineBlock {
  openLine: string;
  contentLine: string;
  closeLine: string;
  nextIndex: number;
}

interface FencedBlock {
  openLine: string;
  info: string;
  contentLines: string[];
  closeLine: string;
  nextIndex: number;
  fence: Fence;
}

const FENCE_OPEN = /^(\s*)(`{3,}|~{3,})([^\r\n]*)$/;
const LIST_ITEM = /^(\s*(?:[-+*]|\d+[.)])\s+.+?)\s*$/;
const LIST_ITEM_WITH_LABEL = /^(\s*(?:[-+*]|\d+[.)])\s+.+?[:：])\s*$/;

/**
 * Compact the display-only Markdown sent to Pi's assistant renderer.
 *
 * The transformation is deliberately conservative:
 * - only complete, unlabeled, single-line fenced blocks are changed;
 * - multi-line or language-labeled blocks keep Pi's native renderer;
 * - malformed or unclosed fences pass through unchanged;
 * - the original session Markdown is never modified.
 */
export function compactAssistantMarkdown(markdown: string): string {
  if (!markdown || (!markdown.includes("```") && !markdown.includes("~~~"))) return markdown;

  const lines = markdown.split("\n");
  const output: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    const block = findSingleLineBlock(lines, index);
    if (!block) {
      output.push(lines[index] ?? "");
      continue;
    }

    const content = normalizeSingleLineContent(block.contentLine, block.openLine);
    const previousIndex = findPreviousNonBlankIndex(output);
    const previous = previousIndex >= 0 ? output[previousIndex] ?? "" : "";
    const previousIsListLabel = LIST_ITEM_WITH_LABEL.test(previous);

    if (previousIsListLabel) {
      // A list item such as "- 工作目录：" becomes one compact line.
      while (output.length > previousIndex + 1) output.pop();
      output[previousIndex] = `${previous.trimEnd()}${labelSeparator(previous)}${codeSpan(content)}`;
    } else {
      // Keep a standalone single-line value readable if it is not attached to a label.
      output.push(`${leadingWhitespace(block.openLine)}${codeSpan(content)}`);
    }

    index = block.nextIndex - 1;

    // Consecutive list items do not need Markdown's source blank line after a
    // compacted value. Remove only those blank lines that lead to another item.
    if (previousIsListLabel) {
      while (index + 1 < lines.length && isBlank(lines[index + 1])) {
        const next = lines[index + 2];
        if (next !== undefined && LIST_ITEM.test(next)) {
          index++;
        } else {
          break;
        }
      }
    }
  }

  return output.join("\n");
}

function findFencedBlock(lines: string[], start: number): FencedBlock | undefined {
  const openMatch = FENCE_OPEN.exec(lines[start] ?? "");
  if (!openMatch) return undefined;

  const fence: Fence = {
    character: openMatch[2]!.startsWith("`") ? "`" : "~",
    length: openMatch[2]!.length,
    indent: openMatch[1] ?? "",
  };
  const info = openMatch[3]?.trim().toLowerCase() ?? "";
  const contentLines: string[] = [];

  for (let index = start + 1; index < lines.length; index++) {
    if (isClosingFence(lines[index] ?? "", fence)) {
      return {
        openLine: lines[start] ?? "",
        info,
        contentLines,
        closeLine: lines[index] ?? "",
        nextIndex: index + 1,
        fence,
      };
    }
    contentLines.push(lines[index] ?? "");
  }

  return undefined;
}

function findSingleLineBlock(lines: string[], start: number): SingleLineBlock | undefined {
  const block = findFencedBlock(lines, start);
  if (!block || block.contentLines.length !== 1) return undefined;

  // Plain-text labels do not provide syntax highlighting and are safe to compact
  // when the block contains a single value such as a path or command.
  if (block.info && !/^(?:text|txt|plain|plaintext)$/i.test(block.info)) return undefined;

  const contentLine = block.contentLines[0];
  if (isBlank(contentLine)) return undefined;

  return {
    openLine: block.openLine,
    contentLine,
    closeLine: block.closeLine,
    nextIndex: block.nextIndex,
  };
}

function isClosingFence(line: string, fence: Fence): boolean {
  const match = /^(\s*)(`+|~+)[ \t]*$/.exec(line);
  if (!match) return false;
  const run = match[2]!;
  return run[0] === fence.character && run.length >= fence.length;
}

function normalizeSingleLineContent(line: string, openLine: string): string {
  const indent = leadingWhitespace(openLine);
  const withoutFenceIndent = indent && line.startsWith(indent) ? line.slice(indent.length) : line;
  return withoutFenceIndent.trim();
}

function codeSpan(value: string): string {
  const longestRun = Math.max(0, ...Array.from(value.matchAll(/`+/g), (match) => match[0].length));
  const fence = "`".repeat(longestRun + 1);
  const padding = value.startsWith("`") || value.endsWith("`") ? " " : "";
  return `${fence}${padding}${value}${padding}${fence}`;
}

function labelSeparator(value: string): string {
  return value.trimEnd().endsWith("：") ? "" : " ";
}

function findPreviousNonBlankIndex(lines: string[]): number {
  for (let index = lines.length - 1; index >= 0; index--) {
    if (!isBlank(lines[index])) return index;
  }
  return -1;
}

function leadingWhitespace(value: string): string {
  return /^\s*/.exec(value)?.[0] ?? "";
}

function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim() === "";
}
