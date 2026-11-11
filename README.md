# pi-content-compact

A small Pi package that makes assistant Markdown more compact while preserving separate code blocks and Pi's native syntax highlighting.

It uses Pi's public `registerMarkdownTransformer` API and only runs on assistant Markdown. Complete, unlabeled, single-line fenced blocks and plain-text labeled blocks in list items become inline code:

```markdown
- 工作目录：`/Users/xiaomi/works/gd-ai-fde`
- stdout：`/tmp/service.stdout.log`
```

Language-labeled and multi-line code blocks remain separate and use Pi's native renderer. The package does not register tools, replace Bash rendering, patch Pi's TUI classes, or change session contents.

## Install locally

```bash
pi install .
```

After changing the package while Pi is running, use `/reload`.

## Test

```bash
npm test
npm run check
```
