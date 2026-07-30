<template>
  <Transition name="fade">
    <div v-if="loading" class="section-loader-overlay">
      <div class="section-loader-spinner">
        <i class="ti ti-loader-2 spin-icon"></i>
        <span v-if="label" class="section-loader-label">{{ label }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.section-loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  border-radius: inherit;
}

.section-loader-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--primary-color, #4f46e5);
}

.spin-icon {
  font-size: 2rem;
  animation: spin 1s linear infinite;
}

.section-loader-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-color, #374151);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
