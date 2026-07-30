<template>
  <div class="skeleton-cards-grid">
    <div
      v-for="count in count"
      :key="'card-' + count"
      class="skeleton-card"
    >
      <div class="skeleton-card-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-card-title-group">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-subtitle"></div>
        </div>
      </div>
      <div class="skeleton-card-body">
        <div class="skeleton-line skeleton-body-line"></div>
        <div class="skeleton-line skeleton-body-line short"></div>
      </div>
      <div class="skeleton-card-footer">
        <div class="skeleton-pill"></div>
        <div class="skeleton-pill"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 6,
  },
});
</script>

<style scoped>
.skeleton-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  width: 100%;
}

.skeleton-card {
  padding: 16px;
  background: var(--card-bg, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.skeleton-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(
    90deg,
    rgba(229, 231, 235, 0.6) 25%,
    rgba(209, 213, 219, 0.9) 37%,
    rgba(229, 231, 235, 0.6) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

.skeleton-card-title-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.skeleton-line {
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    rgba(229, 231, 235, 0.6) 25%,
    rgba(209, 213, 219, 0.9) 37%,
    rgba(229, 231, 235, 0.6) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

.skeleton-title {
  height: 16px;
  width: 70%;
}

.skeleton-subtitle {
  height: 12px;
  width: 45%;
}

.skeleton-body-line {
  height: 14px;
  width: 90%;
  margin-bottom: 6px;
}

.skeleton-body-line.short {
  width: 60%;
}

.skeleton-card-footer {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.skeleton-pill {
  height: 24px;
  width: 60px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    rgba(229, 231, 235, 0.6) 25%,
    rgba(209, 213, 219, 0.9) 37%,
    rgba(229, 231, 235, 0.6) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
