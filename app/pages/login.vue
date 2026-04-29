<script setup>
import { Waves } from 'lucide-vue-next'
definePageMeta({
  layout: false
})

const { t } = useI18n()
const { fetch: fetchSession } = useUserSession()
const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  email: '',
  password: ''
})

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const endpoint = isLogin.value ? '/api/auth/login' : '/api/auth/register'
    const body = isLogin.value 
      ? { identifier: form.username || form.email, password: form.password }
      : { username: form.username, email: form.email, password: form.password }
      
    await $fetch(endpoint, {
      method: 'POST',
      body
    })
    
    await fetchSession()
    navigateTo('/')
  } catch (e) {
    error.value = e.data?.message || t('login.error_default')
  } finally {
    loading.value = false
  }
}

// 3D Tilt Logic
const cardRef = ref(null)
const tilt = reactive({ x: 0, y: 0 })

const handleMouseMove = (e) => {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  tilt.x = x * 20
  tilt.y = -y * 20
}

const resetTilt = () => {
  tilt.x = 0
  tilt.y = 0
}
</script>

<template>
  <div class="auth-page">
    <div class="app-bg-wrapper">
      <div class="app-bg-blob blob-1"></div>
      <div class="app-bg-blob blob-2"></div>
      <div class="app-bg-blob blob-3"></div>
    </div>

    <div 
      ref="cardRef"
      class="auth-card glass-premium animate-stagger in-view"
      @mousemove="handleMouseMove"
      @mouseleave="resetTilt"
      :style="{ transform: `perspective(1200px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }"
    >
      <div class="auth-header">
        <NuxtLink to="/" class="logo">
          <div class="logo-orb">
            <Waves :size="32" />
          </div>
          <div class="logo-text-wrapper">
            <span class="logo-text">Flow</span>
          </div>
        </NuxtLink>
        <h1 class="text-gradient">{{ isLogin ? t('login.submit_login') : t('login.submit_signup') }}</h1>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="error" class="error-msg">{{ error }}</div>
        
        <div class="input-group">
          <label>{{ isLogin ? t('login.username_or_email') : t('login.username') }}</label>
          <input v-model="form.username" type="text" class="input-premium" :placeholder="t('login.placeholder_username')" required />
        </div>

        <div v-if="!isLogin" class="input-group">
          <label>{{ t('login.email') }}</label>
          <input v-model="form.email" type="email" class="input-premium" :placeholder="t('login.placeholder_email')" required />
        </div>

        <div class="input-group">
          <label>{{ t('login.password') }}</label>
          <input v-model="form.password" type="password" class="input-premium" placeholder="••••••••" required />
        </div>

        <button type="submit" class="btn-premium auth-submit" :disabled="loading">
          <span v-if="loading">{{ t('login.processing') }}</span>
          <template v-else>
            {{ isLogin ? t('login.submit_login') : t('login.submit_signup') }}
          </template>
        </button>
      </form>

      <div class="auth-footer">
        <span>{{ isLogin ? t('login.no_account') : t('login.have_account') }}</span>
        <button @click="isLogin = !isLogin" class="toggle-btn">
          {{ isLogin ? t('login.create_one') : t('login.login_here') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.auth-card {
  width: 100%;
  max-width: 480px;
  padding: 56px;
  border-radius: 40px;
  z-index: 10;
  transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);
  will-change: transform;
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.auth-header .logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  text-decoration: none;
}

.logo-orb {
  position: relative;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 22px;
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
  top: 8px;
  left: 8px;
  width: 18px;
  height: 18px;
  background: white;
  filter: blur(5px);
  border-radius: 50%;
  opacity: 0.5;
}

.orb-rings {
  position: absolute;
  inset: -10px;
  border: 2px solid rgba(0, 245, 212, 0.15);
  border-radius: 26px;
  animation: rotate-orb 15s infinite linear;
}

.orb-glow {
  position: absolute;
  inset: -6px;
  background: var(--primary);
  filter: blur(20px);
  opacity: 0.2;
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
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -2px;
  background: linear-gradient(to bottom, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.auth-header h1 {
  font-size: 36px;
  margin-bottom: 12px;
}

.auth-header p {
  color: var(--text-muted);
  font-size: 16px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-group label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding-left: 4px;
}

.auth-submit {
  width: 100%;
  height: 56px;
  font-size: 16px;
  margin-top: 12px;
}

.error-msg {
  padding: 16px;
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: var(--accent);
  border-radius: 16px;
  font-size: 14px;
  text-align: center;
  margin-bottom: 8px;
}

.auth-footer {
  text-align: center;
  margin-top: 40px;
  font-size: 15px;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.toggle-btn {
  color: var(--primary);
  font-weight: 800;
  font-size: 16px;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  color: var(--primary-hover);
  text-shadow: 0 0 10px var(--primary-glow);
}
</style>

