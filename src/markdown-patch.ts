import { Markdown, stripTerminalSequences } from "@earendil-works/pi-tui";
import { stripCodeFenceRows } from "./markdown-patch-core.ts";

type RenderToken = (
  this: MarkdownPrivate,
  token: { type?: string },
  width: number,
  nextTokenType?: string,
  styleContext?: unknown,
) => string[];

type MarkdownPrivate = {
  renderToken: RenderToken;
  defaultTextStyle?: unknown;
};

export interface MarkdownPatch {
  installed: boolean;
  reason?: string;
  restore(): void;
}

const PATCH_KEY = Symbol.for("pi-content-compact.markdown-render-patch");
type PatchState = {
  restore(): void;
};

type MarkdownPrototype = MarkdownPrivate & {
  [PATCH_KEY]?: PatchState;
};

export function installMarkdownPatch(): MarkdownPatch {
  const prototype = Markdown.prototype as unknown as MarkdownPrototype;
  prototype[PATCH_KEY]?.restore();

  const originalRenderToken = prototype.renderToken;
  if (typeof originalRenderToken !== "function") {
    return {
      installed: false,
      reason: "Pi TUI Markdown renderer does not expose renderToken.",
      restore: () => {},
    };
  }

  const patchedRenderToken: RenderToken = function (
    token,
    width,
    nextTokenType,
    styleContext,
  ): string[] {
    const rendered = originalRenderToken.call(this, token, width, nextTokenType, styleContext);
    if (token?.type !== "code" || this.defaultTextStyle !== undefined) return rendered;
    return stripCodeFenceRows(rendered, stripTerminalSequences);
  };

  prototype.renderToken = patchedRenderToken;

  let state: PatchState;
  const restore = (): void => {
    if (prototype.renderToken === patchedRenderToken) {
      prototype.renderToken = originalRenderToken;
    }
    if (prototype[PATCH_KEY] === state) delete prototype[PATCH_KEY];
  };
  state = { restore };
  prototype[PATCH_KEY] = state;

  return { installed: true, restore };
}
