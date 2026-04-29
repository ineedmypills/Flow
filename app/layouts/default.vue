<template>
  <div class="app-layout">
    <div class="app-bg-wrapper">
      <div class="app-bg-blob blob-1"></div>
      <div class="app-bg-blob blob-2"></div>
      <div class="app-bg-blob blob-3"></div>
    </div>
    
    <AppHeader />
    
    <div class="main-container">
      <AppSidebar />
      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: transparent;
}

.main-container {
  display: flex;
  flex: 1;
  padding-top: var(--header-height);
  position: relative;
  z-index: 1;
}

.content {
  flex: 1;
  padding: 32px 40px;
  overflow-y: auto;
  transition: all 0.4s ease;
}

@media (max-width: 1024px) {
  .content {
    padding: 24px;
  }
}
</style>
