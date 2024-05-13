import type MarkdownIt from "markdown-it";

const GITBOOK_BLOCK_REGEX = /^{%\s*(?<type>[\w-]+)\s+(?<params>.*?)\s*%}/;
const GITBOOK_BLOCK_END_REGEX = /^{%\s*end(?<type>[\w-]+)\s*%}/;

const GITBOOK_INLINE_TYPES = [
  "embed", // {% embed url="https://www.youtube.com/watch?v=..." %}
] as const;

function parseParams(params: string) {
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

function gitBookInline(md: MarkdownIt) {
  md.inline.ruler.before("text", "gitbook", (state, silent) => {
    const pos = state.pos;
    const max = state.posMax;
    if (pos >= max) return false;

    const match = state.src.slice(pos).match(GITBOOK_BLOCK_REGEX);
    if (!match) return false;

    const { type, params } = match.groups!;
    if (!GITBOOK_INLINE_TYPES.includes(type as any)) return false;

    if (silent) return true;

    const token = state.push(`gitbook-${type}`, "div", 0);
    token.meta = parseParams(params);
    state.pos += match[0].length;
    return true;
  });
}

const GITBOOK_BLOCK_TYPES = [
  "hint", // {% hint style="tip" %} ... {% endhint %}
  "code", // {% code title="index.js" overflow="wrap" lineNumbers="true" %} ... {% endcode %}
  "tabs", // {% tabs %} ... {% endtabs %}
  "tab", // {% tab title="Title" %} ... {% endtab %}
  "content-ref", // {% content-ref url="./" %} ... {% endcontent-ref %}
] as const;

function gitBookBlock(md: MarkdownIt) {
  md.block.ruler.before(
    "fence",
    "gitbook",
    (state, startLine, endLine, silent) => {
      const pos = state.bMarks[startLine] + state.tShift[startLine];
      const max = state.eMarks[startLine];
      if (pos >= max) return false;

      const match = state.src.slice(pos).match(GITBOOK_BLOCK_REGEX);
      if (!match) return false;

      const { type, params } = match.groups!;
      if (!GITBOOK_BLOCK_TYPES.includes(type as any)) return false;

      if (silent) return true;

      // Search for the end tag
      let nextLine = startLine,
        autoClosed = false;
      for (; nextLine < endLine; nextLine++) {
        const endTag = state.src
          .slice(state.bMarks[nextLine])
          .match(GITBOOK_BLOCK_END_REGEX);
        if (endTag && endTag.groups!.type === type) {
          autoClosed = true;
          break;
        }
      }

      const oldParent = state.parentType;
      const oldLineMax = state.lineMax;
      state.parentType = "gitbook" as any;
      state.lineMax = nextLine;

      const openToken = state.push(`gitbook-${type}-open`, "div", 1);
      openToken.meta = parseParams(params);
      openToken.block = true;
      openToken.map = [startLine, nextLine];

      state.md.block.tokenize(state, startLine + 1, nextLine);

      const closeToken = state.push(`gitbook-${type}-close`, "div", -1);
      closeToken.block = true;

      state.parentType = oldParent;
      state.lineMax = oldLineMax;
      state.line = nextLine + (autoClosed ? 1 : 0);

      return true;
    },
    {
      alt: ["paragraph", "reference", "blockquote", "list"],
    }
  );
}

export default function gitBookPlugin(md: MarkdownIt) {
  md.use(gitBookInline).use(gitBookBlock);
}
