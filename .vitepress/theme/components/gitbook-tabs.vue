<template>
  <div class="custom-block bg-zinc-50 dark:bg-zinc-900">
    <div class="inline-flex flex-row pb-2">
      <span
        v-for="tab in tabs"
        :key="tab.title"
        :class="[
          'text-sm font-semibold',
          tab.title === activeTab?.title
            ? 'text-gray-900 dark:text-gray-100 border-b-2 border-gray-900 dark:border-gray-100'
            : 'text-gray-500 dark:text-gray-400',
          'hover:text-gray-900 dark:hover:text-gray-100',
          'transition-colors duration-200',
          'rounded-t-lg',
        ]"
      >
        <button :for="tab.title" @click="selectTab(tab)" class="px-4 py-2 stretched-link">
          {{ tab.title }}
        </button>
      </span>
    </div>

    <div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from "vue";
import { TabProps, tabContextKey } from "./gitbook-tabs.model";

const tabs = ref<TabProps[]>([]);
const activeTab = ref<TabProps>();

function selectTab(tab) {
  tabs.value.forEach((t) => t.setActivated(t === tab));
  activeTab.value = tab;
}

provide(tabContextKey, {
  registerTab(tab) {
    tabs.value.push(tab);
    if (!activeTab.value) {
      activeTab.value = tab;
      tab.setActivated(true);
    } else {
      tab.setActivated(false);
    }
  },
});
</script>
