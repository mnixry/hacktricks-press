<template>
  <gitbook-content-ref :url="page" no-slot />
</template>
<script setup lang="ts">
import gitbookContentRef from "./gitbook-content-ref.vue";

defineProps<{ page: string }>();
</script>
