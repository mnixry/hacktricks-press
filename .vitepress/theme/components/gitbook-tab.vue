<template>
  <div v-show="activated">
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import { tabContextKey } from "./gitbook-tabs.model";

const props = defineProps<{ title: string }>();
const context = inject(tabContextKey);

const activated = ref(false);

onMounted(() => {
  if (!context) {
    throw new Error("tab must be used inside tab context");
  }
  context.registerTab({
    title: props.title,
    setActivated: (value: boolean) => (activated.value = value),
  });
});
</script>
