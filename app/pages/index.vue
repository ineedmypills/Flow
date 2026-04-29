<script setup>
import { TrendingUp, Clock, PlayCircle, Sparkles } from 'lucide-vue-next'

const { t } = useI18n()
const { data: videos } = await useFetch('/api/videos')

const categories = [
  { id: 'all', name: t('home.categories.all'), icon: Sparkles },
  { id: 'trending', name: t('home.categories.trending'), icon: TrendingUp },
  { id: 'recent', name: t('home.categories.recent'), icon: Clock },
  { id: 'recommended', name: t('home.categories.recommended'), icon: PlayCircle }
]

const activeCategory = ref('all')
const activeCategoryName = computed(() => {
  return categories.find(c => c.id === activeCategory.value)?.name || t('home.categories.all')
})

useHead({
  title: computed(() => `Flow - ${t('pages.home')}`)
})

// Intersection observer for stagger animation
const observer = ref(null)
const gridRef = ref(null)

onMounted(() => {
  observer.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view')
      }
    })
  }, { threshold: 0.1 })
  
  if (gridRef.value) {
    observer.value.observe(gridRef.value)
  }
})
</script>

<template>
  <div class="home-page">
    <div class="page-header animate-in">
      <nav class="categories-bar glass">
        <button 
          v-for="cat in categories" 
          :key="cat.id"
          class="category-chip"
          :class="{ active: activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          <component :is="cat.icon" :size="16" />
          <span>{{ cat.name }}</span>
        </button>
      </nav>
    </div>

    <div class="section-header">
      <h2 class="section-title">{{ activeCategoryName }}</h2>
      <div class="header-line"></div>
    </div>

    <div ref="gridRef" class="video-grid animate-stagger" v-if="videos?.length">
      <VideoCard 
        v-for="video in videos" 
        :key="video.id" 
        :video="video" 
        class="video-card-item"
      />
    </div>

    <div v-else class="empty-state glass">
      <div class="empty-icon float">🎬</div>
      <h2>{{ $t('home.no_videos') }}</h2>
      <p>{{ $t('home.be_first') }}</p>
      <NuxtLink to="/upload" class="btn-primary" style="margin-top: 24px;">{{ $t('home.upload_now') }}</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 1600px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.page-header {
  margin-bottom: 48px;
}

/* Categories Bar */
.categories-bar {
  display: flex;
  gap: 12px;
  padding: 8px;
  border-radius: 20px;
  width: fit-content;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.category-chip:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  transform: translateY(-2px);
}

.category-chip.active {
  background: var(--primary);
  color: var(--bg-color);
  box-shadow: 0 8px 20px var(--primary-glow);
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}

.section-title {
  font-size: 24px;
  font-weight: 800;
  white-space: nowrap;
}

.header-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(255,255,255,0.1), transparent);
}

/* Video Grid */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 40px 32px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 24px;
  text-align: center;
  border-radius: 40px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.btn-primary {
  background: var(--primary);
  color: #081316;
  padding: 16px 36px;
  border-radius: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  box-shadow: 0 10px 30px rgba(0, 245, 212, 0.2);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.btn-primary:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 245, 212, 0.3);
}

@media (max-width: 1024px) {
  .video-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
}

@media (max-width: 768px) {
  .video-grid { grid-template-columns: 1fr; }
  .categories-bar { width: 100%; overflow-x: auto; }
}
</style>
