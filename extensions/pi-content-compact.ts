import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { compactAssistantMarkdown } from "../src/markdown.ts";
import { installMarkdownPatch } from "../src/markdown-patch.ts";

export default function piContentCompact(pi: ExtensionAPI): void {
  const markdownPatch = installMarkdownPatch();

  pi.registerMarkdownTransformer(
    (markdown) => compactAssistantMarkdown(markdown),
    { messageTypes: ["assistant"] },
  );

  pi.on("session_start", (_event, ctx) => {
    if (ctx.mode === "tui" && !markdownPatch.installed) {
      ctx.ui.notify(
        markdownPatch.reason ?? "Could not install the compact Markdown renderer.",
        "warning",
      );
    }
  });

  pi.on("session_shutdown", () => {
    markdownPatch.restore();
  });
}
