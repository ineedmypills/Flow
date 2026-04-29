<script setup>
import { Home, Compass, PlaySquare, Clock, ThumbsUp, History, Library, Flame, Zap, PlusCircle } from 'lucide-vue-next'

const mainItems = [
  { icon: Home, label: 'sidebar.home', to: '/' },
  { icon: Flame, label: 'sidebar.trending', to: '/trending' },
  { icon: Compass, label: 'sidebar.explore', to: '/explore' },
]

const libraryItems = [
  { icon: Library, label: 'sidebar.library', to: '/library' },
  { icon: History, label: 'sidebar.history', to: '/history' },
  { icon: PlaySquare, label: 'sidebar.your_videos', to: '/my-videos' },
  { icon: Clock, label: 'sidebar.watch_later', to: '/watch-later' },
]
</script>

<template>
  <aside class="sidebar glass-flow">
    <div class="sidebar-header">
      <NuxtLink to="/upload" class="upload-btn-flow">
        <PlusCircle :size="20" />
        <span>{{ $t('sidebar.create_new') }}</span>
      </NuxtLink>
    </div>

    <nav class="nav-section">
      <NuxtLink v-for="item in mainItems" :key="item.label" :to="item.to" class="nav-item" active-class="active">
        <component :is="item.icon" :size="20" class="nav-icon" />
        <span class="nav-label">{{ $t(item.label) }}</span>
        <div class="active-indicator"></div>
      </NuxtLink>
    </nav>
    
    <div class="sidebar-divider"></div>
    
    <nav class="nav-section">
      <h3 class="section-title">{{ $t('sidebar.library') }}</h3>
      <NuxtLink v-for="item in libraryItems" :key="item.label" :to="item.to" class="nav-item" active-class="active">
        <component :is="item.icon" :size="20" class="nav-icon" />
        <span class="nav-label">{{ $t(item.label) }}</span>
        <div class="active-indicator"></div>
      </NuxtLink>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: calc(100vh - 140px);
  position: sticky;
  top: 132px;
  left: 24px;
  margin-left: 24px;
  margin-bottom: 24px;
  border-radius: 40px;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
  z-index: 100;
}

.sidebar-header {
  padding: 0 12px 24px;
}

.upload-btn-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 56px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 20px;
  color: #081316;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 245, 212, 0.2);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.upload-btn-flow:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0, 245, 212, 0.3);
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 11px;
  font-weight: 900;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 3px;
  margin: 20px 24px 12px;
  opacity: 0.5;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 24px;
  border-radius: 22px;
  color: var(--text-muted);
  font-weight: 700;
  font-size: 15px;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.04);
  transform: translateX(8px);
}

.nav-icon {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 2;
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
  color: var(--primary);
  filter: drop-shadow(0 0 10px var(--primary-glow));
}

.nav-label {
  z-index: 2;
}

.nav-item.active {
  color: #fff;
  background: rgba(0, 245, 212, 0.08);
}

.nav-item.active .nav-icon {
  color: var(--primary);
  filter: drop-shadow(0 0 12px var(--primary-glow));
}

.active-indicator {
  position: absolute;
  left: 0;
  top: 20%;
  height: 60%;
  width: 5px;
  background: var(--primary);
  border-radius: 0 4px 4px 0;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 0 20px var(--primary);
}

.nav-item.active .active-indicator {
  opacity: 1;
  height: 40%;
  top: 30%;
}

.sidebar-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  margin: 24px 12px;
}

@media (max-width: 1400px) {
  .sidebar {
    width: 100px;
    padding: 32px 14px;
  }
  
  .nav-label, .section-title, .upload-btn-flow span {
    display: none;
  }
  
  .nav-item {
    justify-content: center;
    padding: 16px;
  }
  
  .upload-btn-flow {
    width: 56px;
    height: 56px;
    padding: 0;
    margin: 0 auto;
  }
}

@media (max-width: 1024px) {
  .sidebar {
    display: none;
  }
}
</style>
