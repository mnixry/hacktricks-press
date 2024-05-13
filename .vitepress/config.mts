import { defineConfig } from "vitepress";
import taskLists from "markdown-it-task-lists";
import gitBookPlugin from "./markdown.mts";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "HackTricks Press",
  description: "VitePress verison of book.hacktricks.xyz",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
  },

  markdown: {
    config(md) {
      md.use(taskLists);
      md.use(gitBookPlugin as any);

      const MD_INLINE_TYPES = [
        "embed", // {% embed url="https://www.youtube.com/watch?v=..." %}
      ];

      const MD_BLOCK_TYPES = [
        "hint", // {% hint style="tip" %} ... {% endhint %}
        "code", // {% code title="index.js" overflow="wrap" lineNumbers="true" %} ... {% endcode %}
        "tabs", // {% tabs %} ... {% endtabs %}
        "tab", // {% tab title="Title" %} ... {% endtab %}
        "content-ref", // {% content-ref url="./" %} ... {% endcontent-ref %}
      ];

      // for (const type of MD_BLOCK_TYPES) {
      //   md.renderer.rules[`gitbook-${type}-open`] = (
      //     tokens,
      //     idx,
      //     options,
      //     env,
      //     self
      //   ) => {
      //     const token = tokens[idx];
      //     return `<div class="${token.meta.style} custom-block github-alert">`;
      //   };

      //   md.renderer.rules[`gitbook-${type}-close`] = (
      //     tokens,
      //     idx,
      //     options,
      //     env,
      //     self
      //   ) => {
      //     const token = tokens[idx];
      //     return `</div>`;
      //   };
      // }

      // for (const type of MD_INLINE_TYPES) {
      //   md.renderer.rules[`gitbook-${type}`] = (
      //     tokens,
      //     idx,
      //     options,
      //     env,
      //     self
      //   ) => {
      //     const token = tokens[idx];
      //     return `<span class="gitbook-${type}" />`;
      //   };
      // }

      md.renderer.rules['gitbook-hint-open'] = (tokens,idx) => {
        const { style } = tokens[idx].meta;
        return `<GitBookHint style="${style}">`;
      }

      md.renderer.rules['gitbook-hint-close'] = () => {
        return '</GitBookHint>';
      }
    },
  },
});
