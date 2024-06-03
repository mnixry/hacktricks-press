import type { DefaultTheme } from "vitepress";
import type { MarkdownIt } from "./markdown.mts";

export default function summaryToSidebar(
  md: MarkdownIt,
  sidebar: DefaultTheme.SidebarItem[],
  content: string
) {
  const tokens = md.parse(content, {});

  let headingLevel = 0;
  let listLevel = 0;

  for (const [index, token] of tokens.entries()) {
    if (token.type === "heading_open") {
      const endToken = tokens
        .slice(index)
        .findIndex(
          (t) => t.type === "heading_close" && t.level === token.level
        );
      const title = tokens
        .slice(index + 1, index + endToken)
        .find((t) => t.type === "inline")?.content;

      const [, titleLevel] = token.tag.match(/^h(\d)$/)!;

      headingLevel = parseInt(titleLevel);

      let parent = sidebar;
      for (let i = 1; i < headingLevel; i++) {
        const [last] = parent.slice(-1);
        if (last) {
          last.items ??= [];
          parent = last.items;
        }
      }

      parent.push({
        text: title,
        items: [],
      });
    }

    if (token.type === "list_item_open") {
      const endToken = tokens
        .slice(index)
        .findIndex(
          (t) => t.type === "list_item_close" && t.level === token.level
        );
      const inlineLink = tokens
        .slice(index + 1, index + endToken)
        .find((t) => t.type === "inline");

      listLevel++;

      const [linkOpen, linkText] = inlineLink?.children!;
      const href = linkOpen.attrGet("href");
      const text = linkText.content;

      let parent = sidebar;
      for (let i = 1; i < headingLevel + listLevel; i++) {
        const [last] = parent.slice(-1);
        if (last) {
          last.items ??= [];
          parent = last.items;
        }
      }
      parent.push({
        text,
        link: href!,
        collapsed: true,
      });
    }

    if (token.type === "list_item_close") {
      listLevel--;
    }
  }
}
