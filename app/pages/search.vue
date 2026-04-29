<script setup>
const route = useRoute()
const query = computed(() => route.query.q || '')

const { data: videos, refresh, pending } = await useFetch('/api/videos/search', {
  query: { q: query }
})

watch(() => route.query.q, () => {
  refresh()
})
</script>

<template>
  <div class="search-page">
    <header class="page-header">
      <h1 v-if="query">{{ $t('search.results_for', { query }) }}</h1>
      <h1 v-else>{{ $t('search.search_results') }}</h1>
      <p v-if="videos && !pending" class="results-count">{{ videos.length }} {{ $t('search.videos_found') }}</p>
    </header>

    <div v-if="pending" class="loading-state">
      <div class="loader"></div>
    </div>

    <div v-else-if="videos?.length" class="video-grid">
      <VideoCard v-for="video in videos" :key="video.id" :video="video" />
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🔍</div>
      <h2>{{ $t('search.no_results') }}</h2>
      <p>{{ $t('search.try_different') }}</p>
      <NuxtLink to="/" class="btn-primary">{{ $t('search.browse_all') }}</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.results-count {
  color: var(--text-muted);
  font-size: 14px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.empty-state h2 {
  margin-bottom: 12px;
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 32px;
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
