<template>
  <div
    class="custom-block outline outline-1 outline-gray-400 dark:outline-gray-600"
  >
    <div class="uppercase text-xs">📖 Read more</div>
    <div v-if="noSlot || inferredTitle" class="py-2">
      <div class="text-base overflow-hidden text-ellipsis text-nowrap">
        <a :href="props.url.replace(/\.md$/, '.html')">
          {{ inferredTitle ?? props.url.split("/").pop() }}
        </a>
      </div>
      <div class="text-xs text-gray-500 dark:text-gray-400 py-2">
        {{ props.url }}
      </div>
    </div>
    <div v-else class="py-2 text-base">
      <slot />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from "vitepress";
import { useSidebar, DefaultTheme } from "vitepress/theme";
import { computed } from "vue";

const props = defineProps<{ url: string; noSlot?: boolean }>();

const { path } = useRoute();
const { sidebar } = useSidebar();

function findPageTitle(
  sidebar: DefaultTheme.SidebarItem[],
  url: string
): string | undefined {
  for (const item of sidebar) {
    if (item.link?.includes(url)) {
      return item.text;
    }
    if (item.items) {
      const title = findPageTitle(item.items, url);
      if (title) return title;
    }
  }
}

function join(...args: string[]) {
  const parts = args.flatMap((arg) => arg.split("/"));
  const newParts = [] as string[];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") newParts.pop();
    else newParts.push(part);
  }
  if (parts[0] === "") newParts.unshift("");
  return newParts.join("/") || (newParts.length ? "/" : ".");
}

const inferredTitle = computed(() => {
  let trimmedPath = path;
  if (trimmedPath.length && !trimmedPath.endsWith("/"))
    trimmedPath = join(trimmedPath, "..");
  let fullPath = join(trimmedPath, props.url);
  if (fullPath.startsWith("/")) fullPath = fullPath.slice(1);
  return findPageTitle(sidebar.value, fullPath);
});
</script>
