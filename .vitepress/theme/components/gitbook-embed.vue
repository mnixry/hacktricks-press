<template>
  <div class="custom-block github-alert outline-dashed outline-1">
    <div class="uppercase text-xs pb-1">⛓️ External Link</div>
    <div class="text-base pb-2 overflow-hidden text-ellipsis text-nowrap">
      <a :href="url" target="_blank" rel="noopener noreferrer">
        {{ url }}
      </a>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ url: string }>();
</script>
