import path from "node:path";

import type { MarkdownOptions } from "vitepress";
import escape from "escape-html";

export type MarkdownIt = Parameters<NonNullable<MarkdownOptions["config"]>>[0];
export type Token = ReturnType<MarkdownIt["parse"]>[0];

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

export const GITBOOK_TYPES = [...GITBOOK_INLINE_TYPES, ...GITBOOK_BLOCK_TYPES];

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
          .slice(state.bMarks[nextLine], state.eMarks[nextLine])
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
        const openToken = state.push(`gitbook_${type}`, "div", 0);
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

      const openToken = state.push(`gitbook_${type}_open`, "div", 1);
      openToken.meta = meta;
      openToken.block = true;
      openToken.map = [startLine, nextLine];

      state.md.block.tokenize(state, startLine + 1, nextLine);

      const closeToken = state.push(`gitbook_${type}_close`, "div", -1);
      closeToken.block = true;

      state.parentType = oldParent;
      state.lineMax = oldLineMax;
      state.line = nextLine + (autoClosed ? 1 : 0);

      return true;
    }
  );
}

const KEY_MAPPING = {
  style: "style-type",
};

function createElement(
  tagName: string,
  attrs: Record<string, string>,
  type: "start" | "end" | "self" = "start"
) {
  return [
    "<",
    type === "end" ? "/" : "",
    tagName,
    ...Object.entries(attrs).map(
      ([key, value]) => ` ${KEY_MAPPING[key] ?? key}="${escape(value)}"`
    ),
    type === "self" ? "/" : "",
    ">",
  ].join("");
}

export default function gitBookPlugin(md: MarkdownIt) {
  md.use(gitBookBlock);

  for (const type of GITBOOK_INLINE_TYPES) {
    //* Apply the rule for inline types
    md.renderer.rules[`gitbook_${type}`] = (tokens, idx) =>
      createElement(`gitbook-${type}`, tokens[idx].meta, "self");
  }

  for (const type of GITBOOK_BLOCK_TYPES) {
    //* Apply the rule for block types
    md.renderer.rules[`gitbook_${type}_open`] = (tokens, idx) =>
      createElement(`gitbook-${type}`, tokens[idx].meta, "start");
    md.renderer.rules[`gitbook_${type}_close`] = () =>
      createElement(`gitbook-${type}`, {}, "end");
  }

  //* Escape all text with special meaning for VitePress

  // regex to match all void html elements
  const voidElements =
    /^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b[^>]*\/?>/;

  function escapeText(token: Token) {
    if (
      token.type === "html_inline" &&
      !(token.content.startsWith("&") || voidElements.test(token.content))
    ) {
      token.content = escape(token.content);
    } else if (["code", "p"].includes(token.tag)) {
      token.attrSet("v-pre", "");
    }
    token.children?.forEach(escapeText);
  }

  const defaultRender = md.renderer.render;
  md.renderer.render = (tokens, options, env) => {
    for (const token of tokens) {
      escapeText(token);
    }
    return defaultRender(tokens, options, env);
  };
}
