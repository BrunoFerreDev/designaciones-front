<template>
  <div class="modal-content animate-fade-in" style="max-height: 85vh; display: flex; flex-direction: column; gap: 1rem;">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: start;">
      <div>
        <h3 style="font-size: 16px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 4px;">
          📋 Detalle de la Designación
        </h3>
        <div style="font-size: 12px; color: var(--color-text-secondary)">
          Cancha: {{ canchaName }} · {{ formattedFecha }}
        </div>
      </div>
      <button class="btn-icon" @click="closeModal" style="border: none; background: transparent; cursor: pointer; color: var(--color-text-secondary); display: inline-flex; align-items: center; justify-content: center; padding: 4px; border-radius: 50%;">
        <i class="ti ti-x" style="font-size: 18px;"></i>
      </button>
    </div>

    <!-- Body -->
    <div style="flex: 1; overflow-y: auto; padding: 16px; background: var(--color-background-secondary); border: 1.5px solid var(--color-border-tertiary); border-radius: 12px; min-height: 140px;">
      <div v-if="detalleContent" class="detail-container">
        <!-- Render structured content if it's an object -->
        <div v-if="isObject(detalleContent)" class="structured-detail" style="display: flex; flex-direction: column; gap: 8px;">
          <div
            v-for="(val, key) in detalleContent"
            :key="key"
            style="
              padding: 10px 12px;
              background: var(--color-background-primary);
              border: 1px solid var(--color-border-tertiary);
              border-radius: 8px;
              font-size: 13px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-wrap: wrap;
              gap: 8px;
            "
          >
            <strong style="color: var(--color-text-primary); text-transform: capitalize;">
              {{ formatKey(key) }}
            </strong>
            <span style="color: var(--color-text-secondary); font-weight: 500;">
              {{ val }}
            </span>
          </div>
        </div>

        <!-- Render raw text with line breaks -->
        <div v-else class="text-detail" style="white-space: pre-wrap; font-size: 13px; color: var(--color-text-primary); line-height: 1.6;">
          {{ detalleContent }}
        </div>
      </div>
      <div v-else style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 0; color: var(--color-text-secondary); font-size: 13px; gap: 8px;">
        <i class="ti ti-info-circle" style="font-size: 28px; color: var(--color-text-secondary)"></i>
        <span>No hay información de detalle disponible para esta designación.</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="modal-footer" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--color-border-tertiary); display: flex; justify-content: end;">
      <button class="btn primary" @click="closeModal">Cerrar</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { state, closeModal, getCancha, formatFecha } from "../store";

const designacion = computed(() => state.modal?.data || {});

const canchaObj = computed(() => {
  const canchaId =
    designacion.value.idCancha ||
    designacion.value.canchaId ||
    designacion.value.cancha?.idCancha ||
    designacion.value.cancha?.id;
  return getCancha(Number(canchaId)) || designacion.value.cancha;
});

const canchaName = computed(() => {
  return (
    designacion.value.cancha?.nombreCancha ||
    canchaObj.value?.nombre ||
    canchaObj.value?.nombreCancha ||
    "Cancha Desconocida"
  );
});

const formattedFecha = computed(() => {
  return formatFecha(designacion.value.fecha);
});

const detalleContent = computed(() => {
  const raw = designacion.value.detalleDesignacion;
  if (!raw) return null;
  
  if (typeof raw === "string") {
    // Check if it looks like a JSON object
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object" && parsed !== null) {
          return parsed;
        }
      } catch (e) {
        // Not valid JSON, return as string
      }
    }
  }
  return raw;
});

const isObject = (val) => typeof val === "object" && val !== null;

const formatKey = (key) => {
  // Convert camelCase or snake_case keys into readable labels
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
};
</script>
