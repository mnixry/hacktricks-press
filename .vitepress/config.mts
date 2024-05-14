import { readFile } from "node:fs/promises";

import { defineConfig, type DefaultTheme } from "vitepress";
import taskLists from "markdown-it-task-lists";

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
      nav: [{ text: "Table of Contents", link: "/SUMMARY.md" }],
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
        md.use(gitBookPlugin, {});

        if (sidebar.length === 0) summaryToSidebar(md, sidebar, summaryFile);
      },
    },
  });
};
