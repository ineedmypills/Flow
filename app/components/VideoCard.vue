<script setup>
import { MoreVertical, CheckCircle, Play } from 'lucide-vue-next'

const props = defineProps({
  video: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
const { formatViews, timeAgo } = useFormat()

const handleMouseMove = () => {}
const resetTilt = () => {}
</script>

<template>
  <NuxtLink 
    ref="cardRef"
    :to="`/watch/${video.id}`" 
    class="video-card"
    @mousemove="handleMouseMove"
    @mouseleave="resetTilt"
    :style="{ '--mouse-x': `${mouseX}%`, '--mouse-y': `${mouseY}%` }"
  >
    <div class="thumbnail-wrapper">
      <img :src="video.thumbnailUrl || '/placeholder-thumb.jpg'" :alt="video.title" class="thumbnail" />
      
      <div class="thumbnail-overlay glass">
        <div class="play-btn-wrapper">
          <Play :size="24" fill="currentColor" />
        </div>
      </div>
      
      <div class="thumbnail-shine"></div>
      <div class="duration-tag glass" v-if="video.duration">{{ video.duration }}</div>
    </div>
    
    <div class="content-wrapper">
      <div class="author-avatar-wrapper">
        <div class="author-avatar">
          {{ video.author?.charAt(0).toUpperCase() || 'U' }}
        </div>
        <div class="avatar-glow"></div>
      </div>
      
      <div class="video-details">
        <h3 class="video-title">{{ video.title }}</h3>
        
        <div class="author-info">
          <span class="author-name">{{ video.author }}</span>
          <CheckCircle :size="12" class="verified-icon" />
        </div>
        
        <div class="video-meta">
          <span>{{ formatViews(video.views) }} {{ t('common.views') }}</span>
          <span class="meta-dot"></span>
          <span>{{ timeAgo(video.createdAt) }}</span>
        </div>
      </div>
      
      <button class="options-btn" @click.prevent="">
        <MoreVertical :size="18" />
      </button>
    </div>
  </NuxtLink>
</template>

<style scoped>
.video-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  will-change: transform;
}

.video-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 40px 80px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(0, 245, 212, 0.1);
}

/* Thumbnail Section */
.thumbnail-wrapper {
  position: relative;
  aspect-ratio: 16/9;
  border-radius: 20px;
  overflow: hidden;
  background: #0a0a0c;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s cubic-bezier(0.23, 1, 0.32, 1);
}

.video-card:hover .thumbnail {
  transform: scale(1.1) rotate(1deg);
  filter: brightness(0.6);
}

.thumbnail-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.5s ease;
  background: radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%);
}

.video-card:hover .thumbnail-overlay {
  opacity: 1;
}

.play-btn-wrapper {
  width: 60px;
  height: 60px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transform: scale(0.6);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 30px var(--primary-glow);
}

.video-card:hover .play-btn-wrapper {
  transform: scale(1);
}

.thumbnail-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    45deg,
    transparent 0%,
    rgba(255, 255, 255, 0) 45%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0) 55%,
    transparent 100%
  );
  background-size: 200% 200%;
  background-position: 200% 200%;
  transition: background-position 1s ease;
  pointer-events: none;
}

.video-card:hover .thumbnail-shine {
  background-position: -100% -100%;
}

.duration-tag {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 800;
  color: white;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 2;
}

/* Content Section */
.content-wrapper {
  display: flex;
  gap: 16px;
}

.author-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.author-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #083331, #0d4a47);
  border: 1px solid rgba(0, 245, 212, 0.2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: white;
  font-size: 18px;
  position: relative;
  z-index: 2;
  transition: all 0.4s ease;
}

.video-card:hover .author-avatar {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.avatar-glow {
  position: absolute;
  inset: -6px;
  background: var(--primary);
  filter: blur(12px);
  opacity: 0;
  transition: opacity 0.4s ease;
  border-radius: 16px;
}

.video-card:hover .avatar-glow {
  opacity: 0.25;
}

.video-details {
  flex: 1;
  min-width: 0;
}

.video-title {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
  color: #fff;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: var(--font-display);
  transition: color 0.3s ease;
}

.video-card:hover .video-title {
  color: var(--primary-hover);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.author-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.video-card:hover .author-name {
  color: #e2e8f0;
}

.verified-icon {
  color: var(--primary);
  filter: drop-shadow(0 0 5px var(--primary-glow));
}

.video-meta {
  font-size: 12.5px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.7;
}

.meta-dot {
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.5;
}

.options-btn {
  padding: 8px;
  color: var(--text-muted);
  border-radius: 12px;
  opacity: 0;
  transition: all 0.4s ease;
  align-self: flex-start;
  margin-top: -4px;
}

.video-card:hover .options-btn {
  opacity: 1;
}

.options-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: scale(1.1);
}
</style>
