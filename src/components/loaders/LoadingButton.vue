<template>
  <button
    :type="type"
    :class="['loading-btn', variantClass, { 'is-loading': loading }]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <i v-if="loading" class="ti ti-loader-2 spin-icon"></i>
    <i v-else-if="icon" :class="icon" class="btn-icon"></i>
    <span class="btn-text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "button",
  },
  variant: {
    type: String,
    default: "primary", // primary, secondary, danger, outline
  },
  icon: {
    type: String,
    default: "",
  },
});

const variantClass = computed(() => `btn-${props.variant}`);
</script>

<style scoped>
.loading-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.loading-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.spin-icon {
  animation: spin 1s linear infinite;
  font-size: 1.1rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
