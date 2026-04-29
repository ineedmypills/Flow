<script setup>
import { Shield, Eye, EyeOff, Trash2, CheckCircle, AlertCircle } from 'lucide-vue-next'

const { t } = useI18n()
const { user, loggedIn } = useUserSession()
if (!loggedIn.value || user.value?.role !== 'ADMIN') {
  navigateTo('/')
}

const { data: videos, refresh } = await useFetch('/api/admin/videos')

const toggleStatus = async (video) => {
  const newStatus = video.status === 'PUBLIC' ? 'RESTRICTED' : 'PUBLIC'
  try {
    await $fetch(`/api/admin/videos/${video.id}/status`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
    refresh()
  } catch (e) {
    alert(t('admin.alerts.update_failed'))
  }
}

  const deleteVideo = async (id) => {
  if (!confirm(t('admin.alerts.delete_confirm'))) return
  try {
    await $fetch(`/api/admin/videos/${id}`, { method: 'DELETE' })
    refresh()
  } catch (e) {
    alert(t('admin.alerts.delete_failed'))
  }
}

// 3D Tilt Logic for Stat Cards
const tiltCards = ref([])
const handleMouseMove = (e, index) => {
  const card = tiltCards.value[index]
  if (!card) return
  
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  const rotateX = (y - centerY) / 10
  const rotateY = (centerX - x) / 10
  
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
}

const resetTilt = (index) => {
  const card = tiltCards.value[index]
  if (!card) return
  card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-header animate-fade-in" style="animation-delay: 0.1s">
      <div class="header-title">
        <div class="icon-glow">
          <Shield :size="40" color="var(--primary)" />
        </div>
        <div>
          <h1 class="glitch-text">{{ t('admin.dashboard') }}</h1>
          <p class="subtitle">{{ t('admin.safety') }}</p>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div 
        v-for="(stat, index) in [
          { value: videos?.length || 0, label: t('admin.stats.total_videos') },
          { value: videos?.filter(v => v.status === 'RESTRICTED').length || 0, label: t('admin.stats.restricted') }
        ]" 
        :key="index"
        ref="tiltCards"
        class="stat-card glass animate-fade-in"
        :style="{ animationDelay: `${0.2 + (index * 0.1)}s` }"
        @mousemove="handleMouseMove($event, index)"
        @mouseleave="resetTilt(index)"
      >
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
        <div class="stat-glow"></div>
      </div>
    </div>

    <div class="video-table-container glass animate-fade-in" style="animation-delay: 0.4s">
      <table class="video-table">
        <thead>
          <tr>
            <th>{{ t('admin.table.video') }}</th>
            <th>{{ t('admin.table.author') }}</th>
            <th>{{ t('admin.table.date') }}</th>
            <th>{{ t('admin.table.status') }}</th>
            <th>{{ t('admin.table.views') }}</th>
            <th>{{ t('admin.table.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(video, index) in videos" 
            :key="video.id"
            class="table-row animate-fade-in"
            :style="{ animationDelay: `${0.5 + (index * 0.05)}s` }"
          >
            <td>
              <div class="video-cell">
                <div class="mini-thumb">
                  <img v-if="video.thumbnailUrl" :src="video.thumbnailUrl" />
                  <div class="thumb-overlay"></div>
                </div>
                <span class="video-title">{{ video.title }}</span>
              </div>
            </td>
            <td class="author-cell">@{{ video.author }}</td>
            <td>{{ new Date(video.createdAt).toLocaleDateString() }}</td>
            <td>
              <span :class="['status-badge', video.status.toLowerCase()]">
                <span class="dot"></span>
                {{ video.status }}
              </span>
            </td>
            <td>
              <div class="views-cell">
                <Eye :size="14" class="text-muted" />
                {{ video.views }}
              </div>
            </td>
            <td>
              <div class="table-actions">
                <button @click="toggleStatus(video)" :title="video.status === 'PUBLIC' ? t('admin.actions.restrict') : t('admin.actions.unrestrict')" class="action-btn">
                  <component :is="video.status === 'PUBLIC' ? EyeOff : Eye" :size="18" />
                </button>
                <button @click="deleteVideo(video.id)" :title="t('admin.actions.delete')" class="action-btn delete">
                  <Trash2 :size="18" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.admin-header {
  margin-bottom: 40px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 24px;
}

.icon-glow {
  width: 64px;
  height: 64px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.1);
}

.glitch-text {
  font-size: 32px;
  background: linear-gradient(to bottom, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-muted);
  font-size: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  position: relative;
  padding: 32px;
  border-radius: 24px;
  overflow: hidden;
  transition: transform 0.1s ease-out;
  will-change: transform;
}

.stat-content {
  position: relative;
  z-index: 2;
}

.stat-value {
  font-size: 48px;
  font-weight: 900;
  color: #fff;
  line-height: 1;
  margin-bottom: 8px;
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}

.stat-label {
  font-size: 14px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}

.stat-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.video-table-container {
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
}

.video-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.video-table th {
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-bottom: 1px solid var(--border-color);
}

.table-row {
  transition: all 0.3s ease;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.video-table td {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
  vertical-align: middle;
}

.video-cell {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mini-thumb {
  position: relative;
  width: 80px;
  aspect-ratio: 16/9;
  background: var(--surface-color);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.thumb-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
}

.video-title {
  font-weight: 600;
  color: var(--text-main);
}

.author-cell {
  color: var(--primary);
  font-weight: 500;
}

.views-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid transparent;
}

.status-badge .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge.public {
  background: rgba(16, 185, 129, 0.08);
  color: var(--success);
  border-color: rgba(16, 185, 129, 0.15);
}

.status-badge.public .dot { background: var(--success); box-shadow: 0 0 10px var(--success); }

.status-badge.restricted {
  background: rgba(244, 63, 94, 0.08);
  color: var(--accent);
  border-color: rgba(244, 63, 94, 0.15);
}

.status-badge.restricted .dot { background: var(--accent); box-shadow: 0 0 10px var(--accent); }

.table-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
}

.action-btn:hover {
  background: var(--surface-hover);
  color: var(--text-main);
  transform: translateY(-2px);
  border-color: var(--primary);
}

.action-btn.delete:hover {
  background: rgba(244, 63, 94, 0.1);
  color: var(--accent);
  border-color: var(--accent);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
