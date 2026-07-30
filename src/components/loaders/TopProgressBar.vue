<template>
  <Transition name="fade">
    <div v-if="state.loadingTopBar" class="top-progress-bar">
      <div class="top-progress-bar-value"></div>
    </div>
  </Transition>
</template>

<script setup>
import { state } from "../../store/state";
</script>

<style scoped>
.top-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: rgba(99, 102, 241, 0.15);
  z-index: 9999;
  overflow: hidden;
}

.top-progress-bar-value {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #3b82f6, #6366f1);
  background-size: 200% 100%;
  animation: indeterminate 1.4s infinite linear;
}

@keyframes indeterminate {
  0% {
    transform: translateX(-100%) scaleX(0.2);
  }
  50% {
    transform: translateX(0%) scaleX(0.5);
  }
  100% {
    transform: translateX(100%) scaleX(1);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
