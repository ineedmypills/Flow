<script setup>
import { Upload, FileVideo, Image as ImageIcon, X, Sparkles, CheckCircle2 } from 'lucide-vue-next'

const { t } = useI18n()
const { user, loggedIn } = useUserSession()
if (!loggedIn.value) navigateTo('/login')

const loading = ref(false)
const videoFile = ref(null)
const thumbFile = ref(null)
const videoPreview = ref(null)
const thumbPreview = ref(null)

const form = reactive({
  title: '',
  description: ''
})

const generatedThumbs = ref([])
const selectedGeneratedThumb = ref(null)

const generateThumbnails = async (file) => {
  generatedThumbs.value = []
  selectedGeneratedThumb.value = null
  
  const video = document.createElement('video')
  video.src = URL.createObjectURL(file)
  
  await new Promise(resolve => {
    video.onloadedmetadata = () => {
      resolve()
    }
  })

  const times = [
    video.duration * 0.1,
    video.duration * 0.5,
    video.duration * 0.9
  ]

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  for (const time of times) {
    video.currentTime = time
    await new Promise(resolve => {
      video.onseeked = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        generatedThumbs.value.push(canvas.toDataURL('image/jpeg'))
        resolve()
      }
    })
  }
  
  // Auto-select first one if user hasn't uploaded one
  if (generatedThumbs.value.length > 0 && !thumbFile.value) {
    selectedGeneratedThumb.value = 0
  }
  
  URL.revokeObjectURL(video.src)
}

const onVideoChange = async (e) => {
  const file = e.target.files[0]
  if (file) {
    videoFile.value = file
    videoPreview.value = URL.createObjectURL(file)
    await generateThumbnails(file)
  }
}

const onThumbChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    thumbFile.value = file
    thumbPreview.value = URL.createObjectURL(file)
    selectedGeneratedThumb.value = null // Clear generated selection if manual upload
  }
}

const handleUpload = async () => {
  if (!videoFile.value || !form.title) return
  
  loading.value = true
  const formData = new FormData()
  formData.append('title', form.title)
  formData.append('description', form.description)
  formData.append('video', videoFile.value)
  
  if (thumbFile.value) {
    formData.append('thumbnail', thumbFile.value)
  } else if (selectedGeneratedThumb.value !== null) {
    const dataUrl = generatedThumbs.value[selectedGeneratedThumb.value]
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    formData.append('thumbnail', blob, 'thumbnail.jpg')
  }

  try {
    await $fetch('/api/videos/upload', {
      method: 'POST',
      body: formData
    })
    navigateTo('/')
  } catch (e) {
    alert(e.data?.message || t('upload.error'))
  } finally {
    loading.value = false
  }
}

// Remove 3D Tilt Logic
const previewRef = ref(null)
const handlePreviewMove = () => {}
const resetPreview = () => {}
</script>

<template>
  <div class="upload-page">
    <div class="background-elements">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <div class="upload-container">
      <header class="upload-header stagger-1">
        <div class="badge-premium">
          <Sparkles :size="14" />
          <span>{{ t('upload.creator_studio') || 'Creator Studio' }}</span>
        </div>
        <h1 class="glitch-title" :data-text="t('upload.title')">{{ t('upload.title') }}</h1>
        <p class="subtitle">{{ t('upload.subtitle') }}</p>
      </header>

      <div class="upload-grid">
        <!-- Main Form Section -->
        <section class="upload-main-card glass-premium stagger-2">
          <div class="form-content">
            <div class="input-premium-group">
              <label class="premium-label">{{ t('upload.video_title') }}</label>
              <div class="input-wrapper">
                <input 
                  v-model="form.title" 
                  type="text" 
                  class="input-premium" 
                  :placeholder="t('upload.video_title_placeholder')" 
                  required 
                />
                <div class="input-glow"></div>
              </div>
            </div>

            <div class="input-premium-group">
              <label class="premium-label">{{ t('upload.description') }}</label>
              <div class="input-wrapper">
                <textarea 
                  v-model="form.description" 
                  class="input-premium" 
                  :placeholder="t('upload.description_placeholder')" 
                  rows="5"
                ></textarea>
                <div class="input-glow"></div>
              </div>
            </div>

            <div class="file-selection-grid">
              <!-- Thumbnail Selection -->
              <div class="picker-column">
                <label class="premium-label">{{ t('upload.thumbnail') }}</label>
                
                <div class="thumbnail-options-grid">
                  <!-- Custom Upload Option -->
                  <div 
                    class="drop-zone-premium mini" 
                    :class="{ 'has-file': thumbPreview }"
                    @click="$refs.thumbInput.click()"
                  >
                    <div v-if="thumbPreview" class="preview-overlay">
                      <img :src="thumbPreview" class="thumb-img" />
                      <div class="selection-indicator">
                        <CheckCircle2 :size="16" />
                      </div>
                    </div>
                    <div v-else class="placeholder-content">
                      <Upload :size="20" />
                      <span>{{ t('upload.upload') || 'Загрузить' }}</span>
                    </div>
                  </div>

                  <!-- Generated Options -->
                  <div 
                    v-for="(thumb, idx) in generatedThumbs" 
                    :key="idx"
                    class="generated-thumb-card"
                    :class="{ active: selectedGeneratedThumb === idx && !thumbFile }"
                    @click="selectedGeneratedThumb = idx; thumbFile = null; thumbPreview = null"
                  >
                    <img :src="thumb" />
                    <div class="selection-indicator">
                      <CheckCircle2 :size="16" />
                    </div>
                  </div>
                </div>

                <input ref="thumbInput" type="file" hidden accept="image/*" @change="onThumbChange" />
              </div>

              <!-- Video Picker -->
              <div class="picker-column">
                <label class="premium-label">{{ t('upload.video_file') }}</label>
                <div 
                  class="drop-zone-premium video-zone" 
                  :class="{ 'has-file': videoFile, 'is-loading': loading }"
                  @click="$refs.videoInput.click()"
                >
                  <div v-if="videoFile" class="video-picked-content">
                    <div class="icon-orb primary pulse-glow">
                      <FileVideo :size="32" />
                    </div>
                    <span class="filename">{{ videoFile.name }}</span>
                    <div class="file-badge">
                      <CheckCircle2 :size="14" />
                      <span>Ready to Upload</span>
                    </div>
                    <button class="remove-btn-premium" @click.stop="videoFile = null; videoPreview = null">
                      <X :size="18" />
                    </button>
                  </div>
                  <div v-else class="placeholder-content">
                    <div class="icon-orb primary">
                      <Upload :size="28" />
                    </div>
                    <span class="main-text">{{ t('upload.choose_video') }}</span>
                    <span class="sub-text">{{ t('upload.video_hint') }}</span>
                  </div>
                  <div class="drop-zone-glow"></div>
                </div>
                <input ref="videoInput" type="file" hidden accept="video/*" @change="onVideoChange" />
              </div>
            </div>

            <button 
              @click="handleUpload" 
              class="btn-publish-premium" 
              :disabled="loading || !videoFile || !form.title"
            >
              <div class="btn-content">
                <Upload v-if="!loading" :size="20" />
                <div v-else class="loader-dots"><span></span><span></span><span></span></div>
                <span>{{ loading ? t('upload.uploading') : t('upload.publish') }}</span>
              </div>
              <div class="btn-shine"></div>
            </button>
          </div>
        </section>

        <!-- Preview Section -->
        <aside class="upload-sidebar stagger-3">
          <div class="sidebar-sticky" v-if="videoPreview">
            <div class="preview-header">
              <h3 class="sidebar-title">{{ t('upload.live_preview') || 'Live Preview' }}</h3>
              <div class="live-indicator">
                <span class="dot"></span>
                <span>LIVE</span>
              </div>
            </div>
            
            <div 
              ref="previewRef"
              class="preview-card-premium" 
              @mousemove="handlePreviewMove"
              @mouseleave="resetPreview"
            >
              <div class="preview-video-wrapper">
                <video :src="videoPreview" controls class="preview-video"></video>
                <div class="preview-badge">{{ t('upload.preview_title') }}</div>
                <div class="preview-card-shine"></div>
              </div>
              
              <div class="preview-details">
                <h4 class="preview-title">{{ form.title || t('upload.video_title') }}</h4>
                <div class="preview-meta">
                  <div class="meta-item">
                    <div class="avatar-small">{{ user.username?.charAt(0).toUpperCase() }}</div>
                    <span>{{ user.username }}</span>
                  </div>
                </div>
                <p class="preview-desc">{{ form.description || t('upload.no_description') }}</p>
              </div>
            </div>
          </div>

          <div class="upload-guidelines glass stagger-4" v-else>
            <h3 class="sidebar-title">{{ t('upload.guidelines_title') || 'Загрузка контента' }}</h3>
            <ul class="tips-list">
              <li>
                <div class="tip-icon"><Sparkles :size="16" /></div>
                <p>{{ t('upload.guide_1') || 'Используйте яркие названия для привлечения внимания.' }}</p>
              </li>
              <li>
                <div class="tip-icon"><CheckCircle2 :size="16" /></div>
                <p>{{ t('upload.guide_2') || 'Качественные обложки повышают интерес зрителей.' }}</p>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.thumbnail-options-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 8px;
}

.drop-zone-premium.mini {
  height: 100px;
  border-radius: 16px;
}

.drop-zone-premium.mini .placeholder-content {
  gap: 4px;
}

.drop-zone-premium.mini .placeholder-content span {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.generated-thumb-card {
  height: 100px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  background: rgba(255,255,255,0.03);
}

.generated-thumb-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.generated-thumb-card:hover img {
  opacity: 0.8;
}

.generated-thumb-card.active {
  border-color: var(--primary);
  box-shadow: 0 0 20px var(--primary-glow);
}

.generated-thumb-card.active img {
  opacity: 1;
}

.selection-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--primary);
  color: #081316;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.generated-thumb-card.active .selection-indicator,
.drop-zone-premium.has-file .selection-indicator {
  opacity: 1;
  transform: scale(1);
}

.upload-page {
  min-height: 100vh;
  padding: 60px 20px;
  position: relative;
  overflow: hidden;
}

.background-elements {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.blob {
  position: absolute;
  filter: blur(100px);
  opacity: 0.1;
  border-radius: 50%;
  animation: blob-float 25s infinite alternate ease-in-out;
}

.blob-1 { width: 600px; height: 600px; background: var(--primary); top: -100px; left: -100px; }
.blob-2 { width: 500px; height: 500px; background: var(--accent); bottom: -100px; right: -100px; animation-delay: -5s; }
.blob-3 { width: 400px; height: 400px; background: #00e5ff; top: 30%; right: 10%; animation-delay: -10s; }

@keyframes blob-float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(100px, 80px) scale(1.2); }
}

.upload-container {
  max-width: 1300px;
  margin: 0 auto;
}

/* Header Section */
.upload-header {
  margin-bottom: 50px;
  text-align: left;
}

.badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 245, 212, 0.1);
  border: 1px solid rgba(0, 245, 212, 0.2);
  border-radius: 100px;
  color: var(--primary);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.glitch-title {
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 12px;
  background: linear-gradient(to bottom, #fff 0%, #00f5d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.04em;
}

.subtitle {
  font-size: 18px;
  color: var(--text-muted);
  max-width: 600px;
}

/* Grid Layout */
.upload-grid {
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 40px;
  align-items: start;
}

/* Main Card */
.upload-main-card {
  padding: 50px;
  border-radius: 40px;
  background: rgba(15, 15, 25, 0.4);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

/* Input Groups */
.input-premium-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.premium-label {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.8;
  padding-left: 4px;
}

.input-wrapper {
  position: relative;
}

.input-premium {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 18px 24px;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.input-premium:focus {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--primary);
  box-shadow: 0 0 40px rgba(0, 245, 212, 0.1);
  outline: none;
}

.input-glow {
  position: absolute;
  inset: -1px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.input-premium:focus + .input-glow {
  opacity: 0.4;
}

/* File Selection */
.file-selection-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 32px;
}

.drop-zone-premium {
  height: 240px;
  background: rgba(255, 255, 255, 0.02);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.drop-zone-premium:hover {
  border-color: var(--primary);
  background: rgba(0, 245, 212, 0.04);
  transform: translateY(-6px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.drop-zone-premium.has-file {
  border: none;
}

.icon-orb {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.4s ease;
}

.icon-orb.primary {
  background: rgba(0, 245, 212, 0.1);
  color: var(--primary);
  border-color: rgba(0, 245, 212, 0.2);
}

.drop-zone-premium:hover .icon-orb {
  transform: scale(1.1) rotate(5deg);
  background: rgba(0, 245, 212, 0.2);
  color: #fff;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 1;
}

.main-text {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.sub-text {
  font-size: 13px;
  color: var(--text-muted);
}

.preview-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-picked-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
}

.filename {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  text-align: center;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 100px;
  color: var(--success);
  font-size: 12px;
  font-weight: 700;
}

.remove-btn-premium {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
  transition: all 0.3s ease;
}

.remove-btn-premium:hover {
  background: var(--accent);
  transform: scale(1.1);
}

/* Sidebar & Preview */
.upload-sidebar {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.sidebar-sticky {
  position: sticky;
  top: 100px;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 255, 209, 0.1);
  padding: 4px 10px;
  border-radius: 100px;
  color: var(--primary);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.live-indicator .dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
  animation: pulse-simple 1.5s infinite;
}

@keyframes pulse-simple {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}

.preview-card-premium {
  background: rgba(15, 15, 25, 0.6);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.preview-card-premium:hover {
  transform: translateY(-8px);
}

.preview-video-wrapper {
  position: relative;
  aspect-ratio: 16/9;
  background: #000;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-details {
  padding: 24px;
}

.preview-title {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 16px;
  color: #fff;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.avatar-small {
  width: 24px;
  height: 24px;
  background: var(--primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
}

.preview-meta span {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
}

.preview-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Tips Card */
.tips-card {
  padding: 32px;
  border-radius: 32px;
}

.tips-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.tips-list li {
  display: flex;
  gap: 16px;
}

.tip-icon {
  width: 36px;
  height: 36px;
  background: rgba(0, 245, 212, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.tips-list p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Publish Button */
.btn-publish-premium {
  width: 100%;
  height: 64px;
  background: var(--primary);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 15px 40px rgba(0, 245, 212, 0.3);
}

.btn-publish-premium:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 25px 60px rgba(0, 245, 212, 0.5);
  background: var(--primary-hover);
}

.btn-publish-premium:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.btn-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #fff;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine-loop 4s infinite;
}

@keyframes shine-loop {
  0% { left: -100%; }
  20% { left: 100%; }
  100% { left: 100%; }
}

/* Animations */
.stagger-1 { animation: fadeUp 0.8s 0.1s both; }
.stagger-2 { animation: fadeUp 0.8s 0.2s both; }
.stagger-3 { animation: fadeUp 0.8s 0.3s both; }
.stagger-4 { animation: fadeUp 0.8s 0.4s both; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1100px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }
  .upload-sidebar {
    order: -1;
  }
  .sidebar-sticky {
    position: static;
  }
}

@media (max-width: 640px) {
  .file-selection-grid {
    grid-template-columns: 1fr;
  }
  .glitch-title {
    font-size: 42px;
  }
  .upload-main-card {
    padding: 24px;
  }
}
</style>
