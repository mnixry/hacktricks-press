import type { MarkdownOptions } from "vitepress";

export type MarkdownIt = Parameters<NonNullable<MarkdownOptions["config"]>>[0];

function parseParams(params: string): Record<string, string> {
  const meta = {};
  for (const { groups } of params.matchAll(
    /(?<key>\w+)=(?<value>".+?(?<!\\)"|'.+?(?<!\\)'|\S+)/g
  )) {
    const { key, value } = groups!;
    try {
      meta[key] = JSON.parse(value);
    } catch {
      meta[key] = value;
    }
  }
  return meta;
}

const GITBOOK_INLINE_TYPES = [
  "embed", // {% embed url="https://www.youtube.com/watch?v=..." %}
  "file", // {% file src="./index.js" %}
  "page-ref", // {% page-ref page="./" %}
];

const GITBOOK_BLOCK_TYPES = [
  "hint", // {% hint style="tip" %} ... {% endhint %}
  "code", // {% code title="index.js" overflow="wrap" lineNumbers="true" %} ... {% endcode %}
  "tabs", // {% tabs %} ... {% endtabs %}
  "tab", // {% tab title="Title" %} ... {% endtab %}
  "content-ref", // {% content-ref url="./" %} ... {% endcontent-ref %}
];

const GITBOOK_BLOCK_REGEX = new RegExp(
  /^{%\s*(?<type>TYPES)\s+(?<params>.*?)\s*%}/.source.replace(
    "TYPES",
    [...GITBOOK_INLINE_TYPES, ...GITBOOK_BLOCK_TYPES].join("|")
  )
);

function gitBookBlock(md: MarkdownIt) {
  md.block.ruler.before(
    "fence",
    "gitbook",
    (state, startLine, endLine, silent) => {
      const pos = state.bMarks[startLine] + state.tShift[startLine];
      const max = state.eMarks[startLine];
      if (pos >= max) return false;

      const match = state.src.slice(pos, max).match(GITBOOK_BLOCK_REGEX);
      if (!match) return false;

      const { type, params } = match.groups!;

      if (silent) return true;

      // Search for the end tag
      let nextLine = startLine,
        autoClosed = false;
      for (; nextLine < endLine; nextLine++) {
        const endTag = state.src
          .slice(state.bMarks[nextLine])
          .match(new RegExp(`^{%\\s*end${type}\\s*%}`));
        if (endTag) {
          autoClosed = true;
          break;
        }
      }

      const meta = parseParams(params);

      if (GITBOOK_INLINE_TYPES.includes(type) && !autoClosed) {
        // If it's an inline type and have no closing tag, assume it is a block
        // that contains only one line
        const openToken = state.push(`gitbook-${type}`, "div", 0);
        openToken.meta = meta;
        openToken.block = true;
        openToken.map = [startLine, startLine + 1];
        state.line = startLine + 1;
        return true;
      }

      const oldParent = state.parentType;
      const oldLineMax = state.lineMax;
      state.parentType = "gitbook" as any;
      state.lineMax = nextLine;

      const openToken = state.push(`gitbook-${type}-open`, "div", 1);
      openToken.meta = meta;
      openToken.block = true;
      openToken.map = [startLine, nextLine];

      state.md.block.tokenize(state, startLine + 1, nextLine);

      const closeToken = state.push(`gitbook-${type}-close`, "div", -1);
      closeToken.block = true;

      state.parentType = oldParent;
      state.lineMax = oldLineMax;
      state.line = nextLine + (autoClosed ? 1 : 0);

      return true;
    }
  );
}

export default function gitBookPlugin(md: MarkdownIt) {
  md.use(gitBookBlock);
}
