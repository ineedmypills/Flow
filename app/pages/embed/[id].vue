<template>
  <div class="embed-container">
    <div v-if="!video" class="embed-loading">
      <div class="loader"></div>
    </div>

    <div
      v-else
      ref="playerRef"
      class="player-wrapper"
      :class="{ 'hide-cursor': !showControls && isPlaying }"
      @mousemove="resetControlsTimeout"
      @mouseleave="showControls = false"
    >
      <video
        ref="videoRef"
        :src="video.url"
        autoplay
        class="video-element"
        @timeupdate="handleTimeUpdate"
        @loadedmetadata="handleLoadedMetadata"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @click="togglePlay"
        @dblclick="toggleFullscreen"
      ></video>

      <div class="player-overlay" :class="{ visible: !isPlaying || showControls }" @click.self="togglePlay">
        <div class="overlay-top">
          <div class="video-badge glass" v-if="video.quality">{{ video.quality }}</div>
        </div>

        <div class="overlay-center" v-if="!isPlaying">
          <button class="center-play-btn" @click="togglePlay">
            <Play :size="48" fill="currentColor" />
          </button>
        </div>

        <div class="video-controls glass" @click.stop>
          <div
            class="progress-container"
            ref="progressContainer"
            @click="seek"
          >
            <div
              class="progress-bar"
              :style="{ width: progress + '%' }"
            ></div>
          </div>

          <div class="controls-main">
            <div class="controls-left">
              <button class="control-btn" @click="togglePlay">
                <Play v-if="!isPlaying" :size="24" fill="currentColor" />
                <Pause v-else :size="24" fill="currentColor" />
              </button>

              <div class="volume-control">
                <button class="control-btn" @click="toggleMute">
                  <VolumeX v-if="isMuted" :size="24" />
                  <Volume2 v-else-if="volume > 0.5" :size="24" />
                  <Volume1 v-else :size="24" />
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  v-model="volume"
                  class="volume-slider"
                >
              </div>

              <div class="time-display">
                {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
              </div>
            </div>

            <div class="controls-right">
              <button class="control-btn">
                <Settings :size="20" />
              </button>
              <button class="control-btn" @click="toggleFullscreen">
                <Maximize :size="20" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Play, Pause, Volume1, Volume2, VolumeX, Maximize, Settings } from 'lucide-vue-next'

definePageMeta({
  layout: false
})

const route = useRoute()
const { data: video } = await useFetch(`/api/videos/${route.params.id}`)

const videoRef = ref(null)
const playerRef = ref(null)
const isPlaying = ref(true)
const isMuted = ref(false)
const volume = ref(1)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)
const showControls = ref(true)
let controlsTimeout = null

// Functions adapted from watch/[id].vue
const resetControlsTimeout = () => {
  showControls.value = true
  if (controlsTimeout) clearTimeout(controlsTimeout)
  if (isPlaying.value) {
    controlsTimeout = setTimeout(() => {
      showControls.value = false
    }, 2000)
  }
}

const togglePlay = () => {
  if (videoRef.value) {
    if (isPlaying.value) {
      videoRef.value.pause()
    } else {
      videoRef.value.play()
    }
  }
}

const toggleMute = () => {
  if (videoRef.value) {
    videoRef.value.muted = !isMuted.value
    isMuted.value = !isMuted.value
    if (isMuted.value) volume.value = 0
    else volume.value = 1
  }
}

const handleTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    progress.value = (currentTime.value / duration.value) * 100
  }
}

const handleLoadedMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
  }
}

const progressContainer = ref(null)
const seek = (e) => {
  if (progressContainer.value && videoRef.value) {
    const rect = progressContainer.value.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    videoRef.value.currentTime = pos * duration.value
  }
}

const toggleFullscreen = async () => {
  if (!document.fullscreenElement) {
    if (playerRef.value?.requestFullscreen) {
      await playerRef.value.requestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      await document.exitFullscreen()
    }
  }
}

const formatTime = (seconds) => {
  if (!seconds) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

watch(volume, (newVolume) => {
  if (videoRef.value) {
    videoRef.value.volume = newVolume
    videoRef.value.muted = newVolume === 0
    isMuted.value = newVolume === 0
  }
})

onMounted(() => {
  resetControlsTimeout()
})
</script>

<style scoped>
.embed-container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #000;
  overflow: hidden;
}

.embed-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--primary, #6366f1);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.player-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
}

.hide-cursor {
  cursor: none;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.player-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  opacity: 0;
  transition: opacity 0.4s ease;
  display: flex;
  flex-direction: column;
}

.player-overlay.visible {
  opacity: 1;
}

.overlay-top {
  padding: 24px;
  display: flex;
  justify-content: flex-end;
}

.video-badge {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.1);
}

.overlay-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-play-btn {
  width: 90px;
  height: 90px;
  background: rgba(99, 102, 241, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
}

.center-play-btn:hover {
  transform: scale(1.1);
}

.video-controls {
  padding: 20px 24px;
  background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0));
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-container {
  height: 6px;
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: var(--primary, #6366f1);
  border-radius: 3px;
}

.controls-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controls-left, .controls-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-btn {
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.2s;
  padding: 4px;
}

.control-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
}

.time-display {
  color: white;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  margin-left: 8px;
}
</style>
