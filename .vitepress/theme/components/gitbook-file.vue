<template>
  <div class="custom-block github-alert outline-dotted outline-1">
    <div class="uppercase text-xs pb-1">⬇️ File Download</div>
    <div class="text-base pb-2 overflow-hidden text-ellipsis text-nowrap">
      <a :href="withBase(src)" target="_blank" rel="noopener noreferrer">
        {{ src.split("/").pop() }}
      </a>
    </div>
  </div>
</template>
<script setup lang="ts">
import { withBase } from "vitepress";

defineProps<{ src: string }>();
</script>
