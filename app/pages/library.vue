<script setup>
import { Library, History, Clock, ThumbsUp, FolderHeart, Lock } from 'lucide-vue-next'

const { t } = useI18n()
const { loggedIn, user } = useUserSession()

const sections = [
  { id: 'history', icon: History, label: 'sidebar.history' },
  { id: 'watch-later', icon: Clock, label: 'sidebar.watch_later' },
  { id: 'playlists', icon: FolderHeart, label: 'sidebar.liked_videos' }
]
</script>

<template>
  <div class="library-page">
    <div class="library-header">
      <div class="header-content">
        <Library :size="32" color="var(--primary)" />
        <h1>{{ t('sidebar.library') }}</h1>
      </div>
    </div>

    <div v-if="!loggedIn" class="auth-required glass animate-fade-in">
      <Lock :size="48" color="var(--text-muted)" />
      <h2>{{ t('placeholders.library_title') }}</h2>
      <p>{{ t('placeholders.library_empty') }}</p>
      <NuxtLink to="/login" class="btn-primary login-btn">
        {{ t('header.login') }}
      </NuxtLink>
    </div>

    <div v-else class="library-content animate-fade-in">
      <div v-for="section in sections" :key="section.id" class="library-section">
        <div class="section-header">
          <component :is="section.icon" :size="20" />
          <h2>{{ t(section.label) }}</h2>
          <NuxtLink to="#" class="see-all">{{ t('sidebar.see_all') }}</NuxtLink>
        </div>
        
        <div class="empty-section-placeholder glass">
          <p>{{ t('placeholders.section_empty', { section: t(section.label) }) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.library-page {
  max-width: 1200px;
  margin: 0 auto;
}

.library-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.auth-required {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  text-align: center;
  border-radius: 24px;
  gap: 16px;
}

.auth-required h2 {
  font-size: 24px;
  margin-top: 16px;
}

.auth-required p {
  color: var(--text-muted);
  max-width: 400px;
  margin-bottom: 8px;
}

.login-btn {
  padding: 12px 32px;
}

.library-content {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  flex: 1;
}

.see-all {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
}

.empty-section-placeholder {
  height: 200px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-style: italic;
  border: 2px dashed var(--border-color);
  background: transparent;
}
</style>
