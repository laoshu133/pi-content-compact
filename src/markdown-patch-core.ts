export function stripCodeFenceRows(
  lines: string[],
  stripSequences: (line: string) => string = (line) => line,
): string[] {
  if (lines.length < 2) return lines;

  const opening = stripSequences(lines[0] ?? "").trim();
  if (!/^(`{3,}|~{3,})/.test(opening)) return lines;

  let closingIndex = -1;
  for (let index = lines.length - 1; index > 0; index--) {
    const plain = stripSequences(lines[index] ?? "").trim();
    if (/^(`{3,}|~{3,})[ \t]*$/.test(plain)) {
      closingIndex = index;
      break;
    }
  }
  if (closingIndex < 1) return lines;

  // Keep the highlighted body and any spacing that the native renderer put
  // after the code block, while removing only the visible fence rows.
  return [...lines.slice(1, closingIndex), ...lines.slice(closingIndex + 1)];
}
