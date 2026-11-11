import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { compactAssistantMarkdown } from "../src/markdown.ts";

export default function piContentCompact(pi: ExtensionAPI): void {
  pi.registerMarkdownTransformer(
    (markdown) => compactAssistantMarkdown(markdown),
    { messageTypes: ["assistant"] },
  );
}
