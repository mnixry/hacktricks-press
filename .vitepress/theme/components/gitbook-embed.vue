<template>
  <div v-if="isTrustedDomain" class="gitbook-embed">
    <iframe
      :src="props.url"
      frameborder="0"
      allowfullscreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    ></iframe>
  </div>
  <div v-else>
    <p>Embedding content from this domain is not allowed.</p>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";

const TRUSTED_DOMAINS = ["gitbook.com", "gitbook.io"];

const props = defineProps<{ url: string }>();

const isTrustedDomain = computed(() => {
  const url = new URL(props.url);
  return TRUSTED_DOMAINS.includes(url.hostname);
});
</script>
