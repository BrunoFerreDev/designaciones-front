<template>
  <transition name="fade">
    <div class="global-loader-overlay">
      <!-- Ambient Glow Behind the Card -->
      <div class="ambient-glow"></div>

      <!-- Loading Card -->
      <div class="loader-card">
        <!-- Modern Spinner -->
        <div class="spinner-container">
          <div class="spinner-ring"></div>
          <div class="spinner-inner-glow"></div>
        </div>

        <!-- Pulse Animated Message -->
        <div class="loader-message">
          <span class="loading-text">Cargando datos</span>
          <span class="loading-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
// No reactive state is needed directly inside the loader, as it's controlled from App.vue
</script>

<style scoped>
.global-loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999; /* Ensure it stays on top of everything, including modals */
}

/* Ambient glow under the loader card */
.ambient-glow {
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(15, 110, 86, 0.4) 0%, rgba(15, 110, 86, 0) 70%);
  filter: blur(15px);
  animation: pulse-glow 3s infinite ease-in-out;
  pointer-events: none;
}

/* Glassmorphic card styling */
.loader-card {
  position: relative;
  background: rgba(30, 41, 59, 0.85); /* Slate 800 with transparency */
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 2.25rem 3.5rem;
  border-radius: 20px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.3),
    0 10px 10px -5px rgba(0, 0, 0, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: min(280px, 90vw);
  text-align: center;
  backdrop-filter: blur(12px);
}

/* Spinner */
.spinner-container {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3.5px solid rgba(255, 255, 255, 0.08);
  border-top-color: #0f6e56; /* Brand Primary color */
  border-right-color: rgba(15, 110, 86, 0.6);
  border-bottom-color: rgba(15, 110, 86, 0.3);
  animation: spin 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
}

.spinner-inner-glow {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(15, 110, 86, 0.15) 0%, transparent 80%);
}

/* Text and Dot styling */
.loader-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-family: "Inter", "Segoe UI", sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: #f8fafc;
  letter-spacing: 0.025em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.loading-text {
  animation: pulse-text 2.2s infinite ease-in-out;
}

.loading-dots span {
  display: inline-block;
  font-weight: 700;
  animation: bounce-dots 1.4s infinite both;
  color: #0f6e56;
}

.loading-dots span:nth-child(1) {
  animation-delay: 0s;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
  margin-left: 1px;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
  margin-left: 1px;
}

/* Animations */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    transform: scale(0.9);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.95;
  }
}

@keyframes pulse-text {
  0%, 100% {
    opacity: 0.85;
  }
  50% {
    opacity: 1;
    color: #ffffff;
  }
}

@keyframes bounce-dots {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

/* Vue Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
