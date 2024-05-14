<template>
  <div class="custom-block github-alert outline outline-1">
    <div class="uppercase text-xs pb-1">📖 Read more</div>
    <div class="text-base pb-2 overflow-hidden text-ellipsis text-nowrap">
      <slot />
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ url: string }>();
</script>
