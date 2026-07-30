<template>
  <div class="skeleton-table-wrapper">
    <div class="skeleton-header" v-if="showHeader">
      <div
        v-for="col in columns"
        :key="'th-' + col"
        class="skeleton-cell skeleton-th"
      ></div>
    </div>
    <div
      v-for="row in rows"
      :key="'tr-' + row"
      class="skeleton-row"
    >
      <div
        v-for="col in columns"
        :key="'td-' + col"
        class="skeleton-cell"
        :style="{ width: getColWidth(col) }"
      ></div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  rows: {
    type: Number,
    default: 5,
  },
  columns: {
    type: Number,
    default: 4,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
});

const getColWidth = (col) => {
  const widths = ["40%", "70%", "50%", "80%", "60%", "90%"];
  return widths[(col - 1) % widths.length];
};
</script>

<style scoped>
.skeleton-table-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--card-bg, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--border-color, #e5e7eb);
}

.skeleton-header,
.skeleton-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.skeleton-header {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color, #f3f4f6);
}

.skeleton-cell {
  height: 18px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(229, 231, 235, 0.6) 25%,
    rgba(209, 213, 219, 0.9) 37%,
    rgba(229, 231, 235, 0.6) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

.skeleton-th {
  width: 60%;
  height: 20px;
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
