// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import "./tailwind.postcss";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  async enhanceApp({ app, router, siteData }) {
    app
      .component(
        "gitbook-code",
        (await import("./components/gitbook-code.vue")).default
      )
      .component(
        "gitbook-content-ref",
        (await import("./components/gitbook-content-ref.vue")).default
      )
      .component(
        "gitbook-embed",
        (await import("./components/gitbook-embed.vue")).default
      )
      .component(
        "gitbook-file",
        (await import("./components/gitbook-file.vue")).default
      )
      .component(
        "gitbook-hint",
        (await import("./components/gitbook-hint.vue")).default
      )
      .component(
        "gitbook-page-ref",
        (await import("./components/gitbook-page-ref.vue")).default
      )
      .component(
        "gitbook-tabs",
        (await import("./components/gitbook-tabs.vue")).default
      )
      .component(
        "gitbook-tab",
        (await import("./components/gitbook-tab.vue")).default
      );
  },
} satisfies Theme;
