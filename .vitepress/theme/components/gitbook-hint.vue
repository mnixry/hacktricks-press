<template>
  <div
    :class="[
      'custom-block',
      'flex flex-row justify-start items-baseline',
      ALERT_CLASS_MAP[type],
    ]"
  >
    <p class="custom-block-title pr-2">
      {{ ALERT_CLASS_EMOJI_MAP[type] }}
    </p>
    <p>
      <slot />
    </p>
  </div>
</template>
<script setup lang="ts">
const ALERT_CLASS_MAP = {
  info: "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-50",
  success: "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-50",
  warning:
    "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-50",
  danger: "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-50",
};

const ALERT_CLASS_EMOJI_MAP = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  danger: "❌",
};

defineProps<{
  type: string;
}>();
</script>
