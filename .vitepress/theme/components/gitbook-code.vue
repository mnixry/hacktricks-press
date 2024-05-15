<template>
  <div class="my-2">
    <div
      v-if="props.title"
      class="inline-flex flex-row pt-2 pb-1 px-3 border-b border-gray-300 dark:border-gray-700 rounded-t"
      style="background-color: var(--vp-code-block-bg)"
    >
      <span
        class="text-xs font-base text-gray-900 dark:text-gray-100  rounded-t-lg"
      >
        {{ props.title }}
      </span>
    </div>
    <div
      v-if="slotVNode?.props"
      v-bind="slotVNode.props"
      :class="[
        lineNumbers ? 'line-numbers-mode' : '',
        overflow === 'wrap' ? 'code-overflow-wrap' : '',
        'code-no-margin',
      ]"
    >
      <component :is="() => slotVNode!.children" />
      <div class="line-numbers-wrapper" aria-hidden="true" v-if="lineNumbers">
        <span class="line-number" v-for="i in new Array(lines).keys()">
          {{ i + 1 }}
          <br />
        </span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { VNode, computed, useSlots } from "vue";

const props = defineProps<{
  title?: string;
  overflow?: string;
  lineNumbers?: boolean;
}>();

const { default: defaultSlot } = useSlots();

const slotVNode = computed(() => {
  if (!defaultSlot) return null;
  const [node] = defaultSlot();
  return node;
});

const lines = computed(() => {
  let lines = 0;
  const count = (node: VNode) => {
    const { type, props, children } = node;
    if (type === "span" && (props?.class as string | null)?.includes("line"))
      lines++;
    if (Array.isArray(children))
      children.forEach((child) => count(child as VNode));
  };
  if (slotVNode.value) count(slotVNode.value);
  return lines;
});
</script>
<style>
.code-overflow-wrap code {
  white-space: pre-wrap !important;
}

.code-no-margin {
  margin: 0 !important;
  border-top-left-radius: 0 !important;
}
</style>
