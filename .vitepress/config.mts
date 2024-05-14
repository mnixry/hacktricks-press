import { defineConfig } from "vitepress";

import { DefaultTheme } from "vitepress/theme";
import { readFile } from "node:fs/promises";
import taskLists from "markdown-it-task-lists";
import gitBookPlugin from "./markdown.mts";

// https://vitepress.dev/reference/site-config
export default async () => {
  const summaryFile = await readFile("./hacktricks/SUMMARY.md", "utf-8");
  const sidebar: DefaultTheme.Sidebar = [];

  return defineConfig({
    title: "HackTricks Press",
    description: "VitePress verison of book.hacktricks.xyz",
    themeConfig: {
      // https://vitepress.dev/reference/default-theme-config
      sidebar,
    },

    markdown: {
      config(md) {
        md.use(taskLists);
        md.use(gitBookPlugin as any);

        md.renderer.rules["gitbook-embed"] = (tokens, idx) => {
          const { url } = tokens[idx].meta;
          return `<gitbook-embed url="${url}" />`;
        };

        md.renderer.rules["gitbook-hint-open"] = (tokens, idx) => {
          const { style } = tokens[idx].meta;
          return `<gitbook-hint type="${style}" >`;
        };

        md.renderer.rules["gitbook-hint-close"] = () => {
          return "</gitbook-hint>";
        };

        const summaryTokens = md.parse(summaryFile, {});
        console.log(summaryTokens.filter((t) => t.type));

        let headingLevel = 0;
        let listLevel = 0;
        for (const [index, token] of summaryTokens.entries()) {
          if (token.type === "heading_open") {
            const endToken = summaryTokens
              .slice(index)
              .findIndex(
                (t) => t.type === "heading_close" && t.level === token.level
              );
            const title = summaryTokens
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
              collapsed: headingLevel >= 2,
            });
          }

          if (token.type === "list_item_open") {
            const endToken = summaryTokens
              .slice(index)
              .findIndex(
                (t) => t.type === "list_item_close" && t.level === token.level
              );
            const inlineLink = summaryTokens
              .slice(index + 1, index + endToken)
              .find((t) => t.type === "inline");

            listLevel++;

            const [linkOpen, linkText] = inlineLink?.children!;
            const href = linkOpen.attrGet("href");
            const text = linkText.content;

            console.log({ href, text, token });

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
              link: `hacktricks/${href}`
            });
          }

          if (token.type === "list_item_close") {
            listLevel--;
          }
        }
      },
    },
  });
};
