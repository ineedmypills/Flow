<script setup>
const { t } = useI18n()
definePageMeta({
  middleware: 'auth'
})

const { data: videos, refresh, pending } = await useFetch('/api/user/videos')

const deleteVideo = async (id) => {
  if (!confirm(t('my_videos.delete_confirm'))) return
  
  try {
    await $fetch(`/api/admin/videos/${id}`, { method: 'DELETE' })
    refresh()
  } catch (err) {
    // alert('Failed to delete video')
  }
}
</script>

<template>
  <div class="my-videos-page">
    <header class="page-header animate-fade-in">
      <div class="header-content">
        <h1 class="text-gradient">{{ $t('my_videos.title') }}</h1>
        <p class="subtitle">{{ $t('my_videos.subtitle') }}</p>
      </div>
      <NuxtLink to="/upload" class="btn-premium upload-btn">
        <span>{{ $t('my_videos.upload_new') }}</span>
      </NuxtLink>
    </header>

    <div v-if="pending" class="loading-state">
      <div class="loader"></div>
    </div>

    <div v-else-if="videos?.length" class="video-list">
      <div v-for="(video, index) in videos" :key="video.id" 
           class="video-item glass animate-fade-in"
           :style="{ animationDelay: `${0.1 + index * 0.1}s` }">
        <div class="video-preview">
          <img :src="video.thumbnailUrl || '/placeholder-thumb.jpg'" :alt="video.title" />
          <div class="status-badge" :class="video.status.toLowerCase()">
            {{ video.status }}
          </div>
        </div>
        <div class="video-details">
          <h3>{{ video.title }}</h3>
          <p class="description">{{ video.description || '...' }}</p>
          <div class="stats">
            <span class="views">{{ video.views }} {{ $t('watch.views') }}</span>
            <span class="dot">•</span>
            <span class="date">{{ new Date(video.createdAt).toLocaleDateString() }}</span>
          </div>
        </div>
        <div class="video-actions">
          <NuxtLink :to="`/watch/${video.id}`" class="action-btn view-btn">{{ $t('my_videos.view') }}</NuxtLink>
          <button @click="deleteVideo(video.id)" class="action-btn delete-btn">{{ $t('my_videos.delete') }}</button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📹</div>
      <h2>{{ $t('my_videos.no_videos') }}</h2>
      <p>{{ $t('my_videos.start_sharing') }}</p>
      <NuxtLink to="/upload" class="btn-primary">{{ $t('my_videos.upload_first') }}</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.my-videos-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.header-content h1 {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 900;
  margin-bottom: 4px;
  background: linear-gradient(to right, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.upload-btn {
  padding: 12px 24px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.video-item {
  display: flex;
  gap: 32px;
  padding: 20px;
  border-radius: 24px;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.video-item:hover {
  transform: translateX(10px) scale(1.01);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-float);
}

.video-preview {
  position: relative;
  width: 280px;
  aspect-ratio: 16/9;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
}

.video-item:hover .video-preview {
  transform: scale(1.05);
}

.video-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-badge.public { 
  background: rgba(16, 185, 129, 0.2); 
  color: #10b981; 
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
}

.status-badge.restricted { 
  background: rgba(244, 63, 94, 0.2); 
  color: #f43f5e; 
  box-shadow: 0 0 20px rgba(244, 63, 94, 0.2);
}

.video-details h3 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 12px;
  color: #fff;
}

.description {
  color: var(--text-muted);
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}

.stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
}

.video-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.view-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.delete-btn {
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.2);
  color: #f43f5e;
}

.delete-btn:hover {
  background: #f43f5e;
  color: white;
  box-shadow: 0 4px 15px rgba(244, 63, 94, 0.4);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 40px auto;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .video-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .video-preview {
    width: 100%;
  }
}
</style>
