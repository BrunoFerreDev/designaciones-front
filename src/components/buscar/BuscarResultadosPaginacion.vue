<template>
  <div
    class="flex justify-between items-center p-4 h-12 py-2 bg-white rounded-lg border border-slate-100 shadow-sm"
    style="margin-top: 3.5rem; gap: 12px; flex-wrap: wrap"
  >
    <span class="text-xs text-slate-500 font-medium">
      Mostrando página {{ currentPage + 1 }} de {{ totalPages }} ({{
        totalElements
      }}
      resultados totales)
    </span>
    <div class="flex gap-2">
      <button
        class="btn"
        style="padding: 5px 12px; font-size: 13px"
        :disabled="currentPage === 0"
        @click="$emit('change-page', currentPage - 1)"
      >
        <i class="ti ti-chevron-left" style="margin-right: 4px"></i>
        Anterior
      </button>
      <button
        class="btn"
        style="padding: 5px 12px; font-size: 13px"
        :disabled="currentPage >= totalPages - 1"
        @click="$emit('change-page', currentPage + 1)"
      >
        Siguiente
        <i class="ti ti-chevron-right" style="margin-left: 4px"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  totalElements: { type: Number, required: true },
});

defineEmits(["change-page"]);
</script>

