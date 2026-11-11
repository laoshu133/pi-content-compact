# pi-content-compact

`pi-content-compact` is a small Pi package that makes assistant Markdown easier to scan while preserving separate code blocks and Pi's native syntax highlighting.

![pi-content-compact before and after comparison](docs/compact-comparison.svg)

## Key features

- **Display-only transformation** — changes the Markdown passed to Pi's interactive renderer and leaves session files, model context, exports, and original messages unchanged.
- **Assistant-only scope** — registers a transformer for `assistant` Markdown and leaves user messages, thinking blocks, tool results, and other extension surfaces alone.
- **Compact single-line values** — turns complete single-line fenced values such as paths, commands, PIDs, and log files into inline code.
- **Plain-text fence support** — handles unlabeled blocks and `text`, `txt`, `plain`, and `plaintext` labels when they contain one value.
- **Native code rendering** — keeps multi-line and language-labeled blocks separate, including JSON, TypeScript, Bash, and other syntax-highlighted content.
- **Renderer-level code blocks** — wraps Pi's private `Markdown.prototype.renderToken` with a guarded, reversible patch so fenced code blocks keep native highlighting while their visible fence rows disappear.
- **Public transformer fallback** — uses `registerMarkdownTransformer` for single-line values and restores the native renderer if Pi's private method is unavailable.
- **Safe lifecycle** — restores the original renderer during extension shutdown and reload, and leaves user messages, thinking, tools, header, footer, and editor outside its scope.
- **Safe malformed-input behavior** — incomplete fences and unsupported formats pass through unchanged.
- **No runtime dependencies** — Pi provides the host packages; the package only contains the extension and its tests.

For example, this assistant output:

````markdown
- 工作目录：

  ```text
  /Users/xiaomi/works/gd-ai-fde
  ```

- stdout：

  ```text
  /tmp/service.stdout.log
  ```
````

is displayed as:

````markdown
- 工作目录：`/Users/xiaomi/works/gd-ai-fde`
- stdout：`/tmp/service.stdout.log`
````

Multi-line blocks remain independent:

````markdown
```json
{
  "event": "stream.open",
  "id": 103
}
```
````

## Install from GitHub

```bash
pi install git:github.com/laoshu133/pi-content-compact
```

After updating the package while Pi is running, use `/reload`.

For local development:

```bash
pi install .
npm test
npm run check
```

The package is discovered through [`package.json`](package.json), which exposes `extensions/pi-content-compact.ts` as its Pi extension entry point.
