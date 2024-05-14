import { readFile } from "node:fs/promises";

import { defineConfig, type DefaultTheme } from "vitepress";
import taskLists from "markdown-it-task-lists";
import escape from "escape-html";

import gitBookPlugin from "./markdown.mts";
import summaryToSidebar from "./summary.mts";

// https://vitepress.dev/reference/site-config
export default async () => {
  const summaryFile = await readFile("./hacktricks/SUMMARY.md", "utf-8");
  const sidebar: DefaultTheme.Sidebar = [];
  const missingFileId = "\0:missing-file";

  return defineConfig({
    srcDir: "hacktricks",
    rewrites: {
      "README.md": "index.md",
      ":path(.*)/README.md": ":path/index.md",
    },
    title: "HackTricks Press",
    description: "VitePress verison of book.hacktricks.xyz",
    themeConfig: {
      // https://vitepress.dev/reference/default-theme-config
      sidebar,
      outline: "deep",
      lastUpdated: {},
    },

    ignoreDeadLinks: true,

    vite: {
      plugins: [
        {
          name: "broken-reference",
          resolveId(source, importer, options) {
            console.warn("missing file", source, "importer", importer);
            return missingFileId;
          },
          load(id) {
            if (id === missingFileId) {
              return "export default {}";
            }
          },
        },
      ],
      assetsInclude: ["**/.gitbook/**/*"],
    },

    markdown: {
      config(md) {
        md.use(taskLists);
        md.use(gitBookPlugin);

        md.renderer.rules["gitbook-embed"] = (tokens, idx) => {
          const { url } = tokens[idx].meta;
          return `<gitbook-embed url="${url}" />`;
        };

        md.renderer.rules["gitbook-file"] = (tokens, idx) => {
          const { src } = tokens[idx].meta;
          return `<gitbook-file src="${src}" />`;
        };

        md.renderer.rules["gitbook-page-ref"] = (tokens, idx) => {
          const { page } = tokens[idx].meta;
          return `<gitbook-page-ref page="${page}" />`;
        };

        md.renderer.rules["gitbook-hint-open"] = (tokens, idx) => {
          const { style } = tokens[idx].meta;
          return `<gitbook-hint type="${style}" >`;
        };
        md.renderer.rules["gitbook-hint-close"] = () => {
          return "</gitbook-hint>";
        };

        md.renderer.rules["gitbook-content-ref-open"] = (tokens, idx) => {
          const { url } = tokens[idx].meta;
          return `<gitbook-content-ref url="${url}">`;
        };
        md.renderer.rules["gitbook-content-ref-close"] = () => {
          return "</gitbook-content-ref>";
        };

        md.renderer.rules["gitbook-tabs-open"] = () => "<gitbook-tabs>";
        md.renderer.rules["gitbook-tabs-close"] = () => "</gitbook-tabs>";
        md.renderer.rules["gitbook-tab-open"] = (tokens, idx) => {
          const { title } = tokens[idx].meta;
          return `<gitbook-tab title="${title}">`;
        };
        md.renderer.rules["gitbook-tab-close"] = () => "</gitbook-tab>";

        function escapeText(
          token: Parameters<typeof md.renderer.renderToken>[0][number]
        ) {
          if (token.type === "html_inline" && !token.content.startsWith("&")) {
            token.content = escape(token.content);
          }
          if (["code", "p"].includes(token.tag)) {
            token.attrSet("v-pre", "");
          }
          for (const child of token.children ?? []) {
            escapeText(child);
          }
        }

        const defaultRender = md.renderer.render;
        md.renderer.render = (tokens, options, env) => {
          for (const token of tokens) {
            escapeText(token);
          }
          return defaultRender(tokens, options, env);
        };

        if (sidebar.length === 0) summaryToSidebar(md, sidebar, summaryFile);
      },
    },
  });
};
