<script setup>
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Send, Users, MessageSquare, Play, Volume2, Maximize, Settings, Heart, Sparkles } from 'lucide-vue-next'

const { t } = useI18n()
const route = useRoute()
const { user, loggedIn } = useUserSession()
const { data: video } = await useFetch(`/api/videos/${route.params.id}`)

useHead({
  title: computed(() => video.value ? `${video.value.title} - Flow` : t('pages.watch'))
})

const { data: comments, refresh: refreshComments } = await useFetch(`/api/comments?videoId=${route.params.id}`)
const { data: recommendations } = await useFetch('/api/videos', {
  query: { limit: 10 }
})

const newComment = ref('')
const submittingComment = ref(false)
const isSubscribed = ref(false)
const isLiked = ref(false)

const { formatViews, timeAgo } = useFormat()

const addComment = async () => {
  if (!newComment.value || !loggedIn.value) return
  submittingComment.value = true
  try {
    await $fetch('/api/comments', {
      method: 'POST',
      body: { videoId: route.params.id, content: newComment.value }
    })
    newComment.value = ''
    refreshComments()
  } finally {
    submittingComment.value = false
  }
}

const handleInteraction = async (type) => {
  if (!loggedIn.value) return navigateTo('/login')
  if (type === 'LIKE') isLiked.value = !isLiked.value
  await $fetch(`/api/videos/${route.params.id}/interaction`, {
    method: 'POST',
    body: { type }
  })
}

// 3D Tilt for Player & Elements
const playerRef = ref(null)
const handlePlayerMove = (e) => {
  const player = playerRef.value
  if (!player) return
  const rect = player.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const rotateX = (y - rect.height / 2) / 100
  const rotateY = (rect.width / 2 - x) / 100
  player.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`
}
const resetPlayerTilt = () => {
  if (playerRef.value) playerRef.value.style.transform = 'perspective(2000px) rotateX(0) rotateY(0) scale(1)'
}
</script>

<template>
  <div class="watch-page" v-if="video">
    <!-- Ambient Background Blur -->
    <div class="ambient-glow" :style="{ backgroundImage: `url(${video.thumbnailUrl || '/placeholder-thumb.jpg'})` }"></div>
    
    <div class="content-layout">
      <main class="main-content">
        <!-- Immersive Video Player Container -->
        <div 
          ref="playerRef"
          class="player-wrapper glass-premium"
          @mousemove="handlePlayerMove"
          @mouseleave="resetPlayerTilt"
        >
          <div class="player-inner">
            <video :src="video.url" autoplay class="video-element"></video>
            
            <div class="player-overlay">
              <div class="overlay-top">
                <div class="video-badge glass">{{ video.quality || '4K ULTRA HD' }}</div>
              </div>
              
              <div class="overlay-center">
                <button class="center-play-btn">
                  <Play :size="48" fill="currentColor" />
                </button>
              </div>

              <div class="overlay-bottom glass">
                <div class="progress-bar">
                  <div class="progress-bg"></div>
                  <div class="progress-fill" style="width: 35%"></div>
                  <div class="progress-handle"></div>
                </div>
                <div class="controls-row">
                  <div class="controls-left">
                    <button class="control-btn"><Play :size="20" fill="currentColor" /></button>
                    <button class="control-btn"><Volume2 :size="20" /></button>
                    <span class="time-display">04:20 / 12:34</span>
                  </div>
                  <div class="controls-right">
                    <button class="control-btn"><Settings :size="20" /></button>
                    <button class="control-btn"><Maximize :size="20" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Video Info Section -->
        <section class="video-info animate-in">
          <div class="info-header">
            <h1 class="video-title">{{ video.title }}</h1>
            <div class="video-stats">
              <span class="stat-item">
                <Users :size="16" />
                {{ formatViews(video.views) }} {{ t('common.views') }}
              </span>
              <span class="stat-divider"></span>
              <span class="stat-item">{{ new Date(video.createdAt).toLocaleDateString() }}</span>
            </div>
          </div>

          <div class="interaction-bar glass-premium">
            <div class="author-card">
              <div class="author-avatar-group">
                <div class="author-avatar">
                  {{ video.author?.charAt(0).toUpperCase() }}
                  <div class="avatar-status"></div>
                </div>
              </div>
              <div class="author-meta">
                <span class="author-name">{{ video.author }}</span>
                <span class="subscriber-count">1.2M {{ t('watch.subscribers') }}</span>
              </div>
              <button 
                class="subscribe-btn" 
                :class="{ subscribed: isSubscribed }"
                @click="isSubscribed = !isSubscribed"
              >
                {{ isSubscribed ? t('watch.subscribed') || 'Subscribed' : t('watch.subscribe') }}
              </button>
            </div>

            <div class="action-group">
              <div class="interaction-pill glass">
                <button 
                  class="pill-btn like" 
                  :class="{ active: isLiked }"
                  @click="handleInteraction('LIKE')"
                >
                  <ThumbsUp :size="18" :fill="isLiked ? 'currentColor' : 'none'" />
                  <span>42K</span>
                </button>
                <div class="pill-divider"></div>
                <button class="pill-btn dislike" @click="handleInteraction('DISLIKE')">
                  <ThumbsDown :size="18" />
                </button>
              </div>
              
              <button class="action-pill glass">
                <Share2 :size="18" />
                <span>{{ t('watch.share') }}</span>
              </button>
              
              <button class="action-pill glass icon-only">
                <MoreHorizontal :size="18" />
              </button>
            </div>
          </div>

          <div class="description-section glass-premium" :class="{ expanded: true }">
            <p class="description-text">{{ video.description }}</p>
            <div class="tag-cloud">
              <span v-for="tag in ['#motion', '#content', '#flow']" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </section>

        <!-- Comments Section -->
        <section class="comments-area animate-in" style="animation-delay: 0.2s">
          <div class="comments-header">
            <div class="header-main">
              <MessageSquare :size="24" />
              <h2>{{ comments?.length || 0 }} {{ t('watch.comments') }}</h2>
            </div>
            <div class="sort-dropdown glass">
              <span>{{ t('watch.sort_by') || 'Sort by' }}</span>
            </div>
          </div>

          <div class="comment-input-block glass-premium" v-if="loggedIn">
            <div class="input-avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
            <div class="input-wrapper">
              <textarea 
                v-model="newComment" 
                :placeholder="t('watch.add_comment')"
                rows="1"
                @input="e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }"
              ></textarea>
              <div class="input-actions">
                <button class="btn-cancel" @click="newComment = ''">{{ t('common.cancel') || 'Cancel' }}</button>
                <button 
                  class="btn-submit" 
                  :disabled="!newComment || submittingComment"
                  @click="addComment"
                >
                  {{ t('watch.comment') || 'Comment' }}
                </button>
              </div>
            </div>
          </div>

          <div class="comments-feed">
            <div 
              v-for="(comment, index) in comments" 
              :key="comment.id" 
              class="comment-card glass"
              :style="{ animationDelay: `${0.3 + index * 0.1}s` }"
            >
              <div class="comment-avatar">{{ comment.user.charAt(0).toUpperCase() }}</div>
              <div class="comment-body">
                <div class="comment-top">
                  <span class="user-handle">@{{ comment.user }}</span>
                  <span class="time-stamp">{{ t('common.seconds_ago', { count: 5 }) }}</span>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
                <div class="comment-footer">
                  <div class="vote-group">
                    <button class="vote-btn"><ThumbsUp :size="14" /> 12</button>
                    <button class="vote-btn"><ThumbsDown :size="14" /></button>
                  </div>
                  <button class="reply-btn">{{ t('watch.reply') }}</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Sidebar Recommendations -->
      <aside class="sidebar-recommendations">
        <div class="sidebar-header">
          <Sparkles :size="20" class="text-primary" />
          <h3>{{ t('watch.up_next') }}</h3>
        </div>
        
        <div class="rec-scroll-area">
          <NuxtLink 
            v-for="(rec, index) in recommendations?.filter(v => v.id != video.id)" 
            :key="rec.id" 
            :to="`/watch/${rec.id}`" 
            class="rec-card-premium glass"
            :style="{ animationDelay: `${0.4 + index * 0.1}s` }"
          >
            <div class="rec-thumb-box">
              <img :src="rec.thumbnailUrl || '/placeholder-thumb.jpg'" :alt="rec.title" />
              <div class="rec-duration">12:34</div>
              <div class="rec-hover-overlay">
                <Play :size="20" fill="currentColor" />
              </div>
            </div>
            <div class="rec-content">
              <h4 class="rec-title">{{ rec.title }}</h4>
              <div class="rec-meta-group">
                <span class="rec-author">{{ rec.author }}</span>
                <div class="rec-stats">
                  <span>{{ formatViews(rec.views) }}</span>
                  <span class="dot"></span>
                  <span>3d ago</span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.watch-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: #050508;
  padding-top: calc(var(--header-height) + 40px);
  padding-bottom: 100px;
}

.ambient-glow {
  position: fixed;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background-size: cover;
  background-position: center;
  filter: blur(120px) brightness(0.15) saturate(1.5);
  opacity: 0.6;
  z-index: 0;
  pointer-events: none;
}

.content-layout {
  position: relative;
  z-index: 1;
  max-width: 1720px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 40px;
  padding: 0 40px;
}

/* Main Content Styles */
.main-content {
  min-width: 0;
}

.player-wrapper {
  position: relative;
  border-radius: 40px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 50px 100px rgba(0,0,0,0.8);
  margin-bottom: 40px;
  transition: transform 0.1s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.player-inner {
  position: relative;
  aspect-ratio: 16/9;
  width: 100%;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.player-overlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.4s ease;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.5) 100%);
}

.player-wrapper:hover .player-overlay {
  opacity: 1;
}

.overlay-top {
  position: absolute;
  top: 30px;
  left: 30px;
}

.video-badge {
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 2px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
}

.overlay-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.center-play-btn {
  width: 90px;
  height: 90px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 0 50px var(--primary-glow);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.center-play-btn:hover {
  transform: scale(1.15);
  box-shadow: 0 0 70px var(--primary-glow);
}

.overlay-bottom {
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;
  padding: 20px;
  border-radius: 24px;
  background: rgba(10, 10, 15, 0.6);
}

.progress-bar {
  position: relative;
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  margin-bottom: 20px;
  cursor: pointer;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  box-shadow: 0 0 15px var(--primary-glow);
}

/* Controls Row */
.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Info Section Styles */
.video-info {
  margin-bottom: 40px;
}

.video-title {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -1px;
  margin-bottom: 12px;
  line-height: 1.2;
}

.video-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text-muted);
  font-weight: 700;
  font-size: 14px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-divider {
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.3;
}

.interaction-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-radius: 32px;
  margin: 32px 0;
  background: rgba(255,255,255,0.02);
}

.author-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.author-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: #fff;
  font-size: 22px;
  position: relative;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}

.avatar-status {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 14px;
  height: 14px;
  background: var(--success);
  border: 3px solid #0a0a0f;
  border-radius: 50%;
}

.author-meta {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}

.subscriber-count {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 600;
}

.subscribe-btn {
  background: #fff;
  color: #000;
  padding: 12px 28px;
  border-radius: 16px;
  font-weight: 800;
  margin-left: 12px;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.subscribe-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 15px 30px rgba(255, 255, 255, 0.2);
}

.subscribe-btn.subscribed {
  background: rgba(255,255,255,0.08);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.1);
}

.action-group {
  display: flex;
  gap: 12px;
}

.interaction-pill {
  display: flex;
  align-items: center;
  border-radius: 20px;
  padding: 4px;
  background: rgba(255,255,255,0.03);
}

.pill-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 800;
  transition: all 0.3s ease;
}

.pill-btn:hover {
  background: rgba(255,255,255,0.06);
}

.pill-btn.active {
  color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}

.pill-divider {
  width: 1px;
  height: 20px;
  background: rgba(255,255,255,0.1);
}

.action-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 800;
  background: rgba(255,255,255,0.03);
  transition: all 0.3s ease;
}

.action-pill:hover {
  background: rgba(255,255,255,0.08);
  transform: translateY(-2px);
}

.icon-only {
  padding: 12px;
}

.description-section {
  padding: 32px;
  border-radius: 32px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.03);
}

.description-text {
  font-size: 16px;
  line-height: 1.7;
  color: rgba(255,255,255,0.8);
  white-space: pre-wrap;
  margin-bottom: 24px;
}

.tag-cloud {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tag {
  color: var(--primary);
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
}

.tag:hover {
  text-decoration: underline;
}

/* Comments Section */
.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-main h2 {
  font-size: 24px;
  font-weight: 900;
}

.comment-input-block {
  display: flex;
  gap: 20px;
  padding: 24px;
  border-radius: 32px;
  background: rgba(255,255,255,0.02);
  margin-bottom: 48px;
}

.input-avatar {
  width: 48px;
  height: 48px;
  background: var(--primary);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: #fff;
  flex-shrink: 0;
}

.input-wrapper {
  flex: 1;
}

.input-wrapper textarea {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 2px solid rgba(255,255,255,0.05);
  padding: 8px 0;
  color: #fff;
  font-size: 16px;
  resize: none;
  transition: border-color 0.3s ease;
  margin-bottom: 16px;
}

.input-wrapper textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 8px 20px;
  font-weight: 700;
  color: var(--text-muted);
}

.btn-submit {
  background: var(--primary);
  color: #fff;
  padding: 8px 24px;
  border-radius: 12px;
  font-weight: 800;
  transition: all 0.3s ease;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comments-feed {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.comment-card {
  display: flex;
  gap: 20px;
  padding: 24px;
  border-radius: 28px;
  background: rgba(255,255,255,0.02);
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.comment-card:hover {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.05);
}

.comment-avatar {
  width: 48px;
  height: 48px;
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;
}

.user-handle {
  font-weight: 900;
  font-size: 15px;
  color: #fff;
  margin-right: 12px;
}

.time-stamp {
  font-size: 13px;
  color: var(--text-muted);
}

.comment-text {
  margin: 12px 0;
  line-height: 1.6;
  color: rgba(255,255,255,0.9);
}

.comment-footer {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}

.vote-group {
  display: flex;
  gap: 16px;
}

.vote-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
}

.reply-btn {
  font-size: 13px;
  font-weight: 800;
  color: var(--primary);
}

/* Sidebar Recommendations Styles */
.sidebar-recommendations {
  position: sticky;
  top: calc(var(--header-height) + 40px);
  height: calc(100vh - var(--header-height) - 80px);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.sidebar-header h3 {
  font-size: 20px;
  font-weight: 900;
}

.rec-scroll-area {
  overflow-y: auto;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rec-scroll-area::-webkit-scrollbar {
  width: 4px;
}

.rec-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
}

.rec-card-premium {
  display: flex;
  gap: 16px;
  padding: 12px;
  border-radius: 24px;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  border: 1px solid transparent;
}

.rec-card-premium:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.08);
  transform: translateX(8px);
}

.rec-thumb-box {
  position: relative;
  width: 180px;
  aspect-ratio: 16/9;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(0,0,0,0.4);
}

.rec-thumb-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.rec-card-premium:hover img {
  transform: scale(1.1);
}

.rec-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0,0,0,0.8);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 900;
  backdrop-filter: blur(4px);
}

.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
  display: flex;
  flex-direction: column;
  gap: 15px;
  opacity: 0;
  transition: all 0.4s ease;
  z-index: 10;
}

.video-container:hover .video-controls {
  opacity: 1;
}

.controls-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.controls-left, .controls-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.control-btn {
  color: white;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.control-btn:hover {
  opacity: 1;
  transform: scale(1.1);
  color: var(--primary);
}

.progress-container {
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--primary);
  box-shadow: 0 0 15px var(--primary-glow);
  width: 45%;
}

.time-display {
  font-size: 13px;
  font-weight: 600;
  color: white;
  font-family: monospace;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  max-width: 1720px;
  margin: 0 auto;
}

.rec-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(99, 102, 241, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.rec-card-premium:hover .rec-hover-overlay {
  opacity: 1;
}

.rec-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.rec-title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #fff;
}

.rec-meta-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rec-author {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 700;
}

.rec-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  opacity: 0.6;
}

.rec-stats .dot {
  width: 3px;
  height: 3px;
  background: currentColor;
  border-radius: 50%;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-in {
  animation: fadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1) both;
}

@media (max-width: 1400px) {
  .content-layout {
    grid-template-columns: 1fr;
    padding: 0 24px;
  }
  .sidebar-recommendations {
    position: static;
    height: auto;
  }
  .rec-scroll-area {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .video-title { font-size: 24px; }
  .interaction-bar { flex-direction: column; align-items: flex-start; gap: 24px; }
  .action-group { width: 100%; justify-content: space-between; }
  .rec-scroll-area { grid-template-columns: 1fr; }
}
</style>
