// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import "./tailwind.postcss";

import GitBookHint from "./components/gitbook-hint.vue";
import GitBookEmbed from "./components/gitbook-embed.vue";
import GitBookTab from "./components/gitbook-tab.vue";
import GitbookTabs from "./components/gitbook-tabs.vue";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app, router, siteData }) {
    app
      .component("gitbook-hint", GitBookHint)
      .component("gitbook-embed", GitBookEmbed)
      .component("gitbook-tabs", GitbookTabs)
      .component("gitbook-tab", GitBookTab);
  },
} satisfies Theme;
