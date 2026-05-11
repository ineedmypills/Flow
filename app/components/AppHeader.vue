<script setup>
import { Search, Bell, Video, LogOut, LayoutDashboard, User, Command, Zap, Settings, HelpCircle, Waves } from 'lucide-vue-next'
const { user, loggedIn, clear } = useUserSession()
const { t } = useI18n()
const searchQuery = ref('')
const isSearchFocused = ref(false)

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}

const logout = async () => {
  await clear()
  navigateTo('/login')
}

// Interactive Hover Effect
const headerRef = ref(null)
const handleHeaderMove = (e) => {
  if (!headerRef.value) return
  const rect = headerRef.value.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  headerRef.value.style.setProperty('--x', `${x}%`)
  headerRef.value.style.setProperty('--y', `${y}%`)
}
</script>

<template>
  <header 
    ref="headerRef"
    class="header glass-flow" 
    :class="{ 'search-active': isSearchFocused }"
    @mousemove="handleHeaderMove"
  >
    <div class="header-glow"></div>
    
    <div class="header-inner">
      <div class="logo-container">
        <NuxtLink to="/" class="logo">
          <div class="logo-orb">
            <div class="orb-rings"></div>
            <div class="orb-glow"></div>
            <div class="orb-shine"></div>
            <Waves :size="24" />
          </div>
          <div class="logo-text-wrapper">
            <span class="logo-text">Flow</span>
          </div>
        </NuxtLink>
      </div>

      <div class="search-container">
        <div class="search-box" :class="{ focused: isSearchFocused }">
          <div class="search-input-wrapper">
            <Search class="search-icon" :size="18" />
            <input 
              v-model="searchQuery" 
              type="text" 
              :placeholder="$t('header.search')" 
              @keyup.enter="handleSearch"
              @focus="isSearchFocused = true"
              @blur="isSearchFocused = false"
            />
            <div class="search-shortcut" v-if="!isSearchFocused && !searchQuery">
              <Command :size="12" />
              <span>K</span>
            </div>
          </div>
          <div class="search-progress" :class="{ active: isSearchFocused }"></div>
        </div>
      </div>

      <div class="actions">
        <template v-if="loggedIn">
          <div class="action-group">
            <NuxtLink to="/upload" class="action-btn-flow" :title="$t('header.upload')">
              <Video :size="20" />
              <div class="btn-hover-effect"></div>
            </NuxtLink>
            <button class="action-btn-flow" :title="$t('header.notifications')">
              <Bell :size="20" />
              <span class="notification-dot"></span>
              <div class="btn-hover-effect"></div>
            </button>
          </div>
          
          <div class="user-profile">
            <button class="avatar-trigger">
              <div class="avatar-ring">
                <div class="avatar">
                  {{ user.username.charAt(0).toUpperCase() }}
                </div>
              </div>
            </button>
            
            <div class="user-dropdown glass-flow">
              <div class="dropdown-header">
                <div class="header-user-info">
                  <span class="username">{{ user.username }}</span>
                </div>
              </div>
              
              <div class="dropdown-content">
                <NuxtLink to="/my-videos" class="dropdown-item">
                  <div class="item-icon-box">
                    <LayoutDashboard :size="16" />
                  </div>
                  <span>{{ $t('header.user_menu.dashboard') }}</span>
                </NuxtLink>
                
                <NuxtLink to="/profile" class="dropdown-item">
                  <div class="item-icon-box">
                    <User :size="16" />
                  </div>
                  <span>{{ $t('header.user_menu.profile') }}</span>
                </NuxtLink>

                <div class="dropdown-divider"></div>

                <NuxtLink to="/settings" class="dropdown-item">
                  <div class="item-icon-box">
                    <Settings :size="16" />
                  </div>
                  <span>{{ $t('header.user_menu.settings') }}</span>
                </NuxtLink>

                <NuxtLink to="/help" class="dropdown-item">
                  <div class="item-icon-box">
                    <HelpCircle :size="16" />
                  </div>
                  <span>{{ $t('header.user_menu.help') }}</span>
                </NuxtLink>
                
                <div class="dropdown-divider"></div>
                
                <button @click="logout" class="dropdown-item logout">
                  <div class="item-icon-box logout-icon">
                    <LogOut :size="16" />
                  </div>
                  <span>{{ $t('header.logout') }}</span>
                </button>
              </div>
            </div>
          </div>
        </template>
        <NuxtLink v-else to="/login" class="btn-login-flow">
          <div class="btn-inner">
            <span>{{ $t('header.login') }}</span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48px);
  max-width: 1720px;
  height: 84px;
  z-index: 1000;
  border-radius: 32px;
  padding: 0;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: visible;
}

.header-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(0, 245, 212, 0.08), transparent 60%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  border-radius: inherit;
}

.header:hover .header-glow { opacity: 1; }

.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
}

/* Logo Section */
.logo {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo-orb {
  position: relative;
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #081316;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 30px rgba(0, 245, 212, 0.2);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logo:hover .logo-orb {
  transform: rotate(8deg) scale(1.1);
  box-shadow: 0 20px 45px rgba(0, 245, 212, 0.3);
}

.orb-shine {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 14px;
  height: 14px;
  background: white;
  filter: blur(4px);
  border-radius: 50%;
  opacity: 0.5;
}

.orb-rings {
  position: absolute;
  inset: -8px;
  border: 1.5px solid rgba(0, 245, 212, 0.15);
  border-radius: 22px;
  animation: rotate-orb 15s infinite linear;
}

.orb-glow {
  position: absolute;
  inset: -4px;
  background: var(--primary);
  filter: blur(15px);
  opacity: 0.15;
  z-index: -1;
}

@keyframes rotate-orb {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.logo-text-wrapper {
  display: flex;
  flex-direction: column;
}

.logo-text {
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -2px;
  background: linear-gradient(to bottom, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: var(--font-display);
}

/* Search Section */
.search-container {
  flex: 0 1 640px;
  margin: 0 40px;
}

.search-box {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 22px;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
}

.search-box.focused {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--primary);
  box-shadow: 0 10px 40px rgba(0, 245, 212, 0.1);
  transform: translateY(-2px);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 54px;
}

.search-icon {
  color: var(--text-muted);
  margin-right: 18px;
  transition: all 0.3s ease;
}

.search-box.focused .search-icon {
  color: var(--primary);
  transform: scale(1.1);
}

.search-box input {
  background: none;
  border: none;
  padding: 0;
  width: 100%;
  height: 100%;
  font-size: 16px;
  color: #fff;
  font-weight: 600;
}

.search-box input:focus { outline: none; }

.search-shortcut {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 800;
}

.search-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 0;
  background: var(--primary);
  transition: width 0.4s ease;
}

.search-progress.active {
  width: 100%;
  box-shadow: 0 0 10px var(--primary);
}

/* Actions Section */
.actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.action-group {
  display: flex;
  gap: 12px;
}

.action-btn-flow {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.action-btn-flow:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  transform: translateY(-4px);
  border-color: rgba(0, 245, 212, 0.3);
}

.btn-hover-effect {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(0, 245, 212, 0.1), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-btn-flow:hover .btn-hover-effect { opacity: 1; }

.notification-dot {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 8px;
  height: 8px;
  background: var(--accent);
  border-radius: 50%;
  border: 2px solid #081316;
  box-shadow: 0 0 10px var(--accent);
}

/* User Profile & Dropdown */
.user-profile {
  position: relative;
}

.avatar-trigger {
  padding: 0;
  background: none;
  border: none;
}

.avatar-ring {
  padding: 3px;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.avatar {
  width: 44px;
  height: 44px;
  background: #081316;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: #fff;
  font-size: 18px;
}

.user-profile:hover .avatar-ring {
  transform: rotate(5deg) scale(1.05);
  box-shadow: 0 12px 25px rgba(0, 245, 212, 0.2);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 20px);
  right: -10px;
  width: 280px;
  background: rgba(8, 19, 22, 0.95);
  border-radius: 28px;
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  pointer-events: none;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7);
  padding: 12px;
  z-index: 2000;
}

.user-dropdown::before {
  content: '';
  position: absolute;
  top: -25px;
  left: 0;
  right: 0;
  height: 25px;
  background: transparent;
}

.user-profile:hover .user-dropdown {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.dropdown-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 12px;
}

.username {
  display: block;
  font-weight: 800;
  font-size: 18px;
  color: #fff;
}

.dropdown-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown-item {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text-muted);
  font-weight: 600;
  transition: all 0.3s ease;
}

.item-icon-box {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  transform: translateX(6px);
}

.dropdown-item:hover .item-icon-box {
  background: rgba(0, 245, 212, 0.1);
  color: var(--primary);
  transform: scale(1.1);
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 8px 12px;
}

.logout {
  color: var(--accent);
}

.logout:hover {
  background: rgba(244, 63, 94, 0.08);
  color: var(--accent);
}

.logout:hover .item-icon-box {
  background: rgba(244, 63, 94, 0.15);
  color: var(--accent);
}

/* Login Button */
.btn-login-flow {
  padding: 1px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.btn-inner {
  background: #081316;
  padding: 12px 32px;
  border-radius: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 15px;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.btn-login-flow:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 20px 40px rgba(0, 245, 212, 0.2);
}

.btn-login-flow:hover .btn-inner {
  background: transparent;
  color: #081316;
}

@media (max-width: 1200px) {
  .search-container { flex: 0 1 400px; margin: 0 20px; }
  .logo-text-wrapper { display: none; }
}

@media (max-width: 850px) {
  .header { width: calc(100% - 32px); height: 74px; top: 16px; }
  .search-container { display: none; }
  .header-inner { padding: 0 24px; }
  .action-group { gap: 8px; }
}
</style>
