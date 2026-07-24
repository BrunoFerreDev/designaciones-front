<template>
  <div class="grid-2">
    <!-- Columna Sábado -->
    <div>
      <div
        style="
          font-weight: 600;
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        "
      >
        <span
          :style="badgeSabadoStyle"
          style="padding: 2px 8px; border-radius: 12px;"
        >
          Sábado
        </span>
        <button
          v-if="showWhatsappBtn && sabadoList.length > 0"
          class="btn text-xs"
          @click="$emit('share-whatsapp', 'sabado')"
          style="
            padding: 2px 6px;
            border-color: #25d366;
            color: #25d366;
            background: transparent;
            font-size: 10px;
            display: flex;
            align-items: center;
            gap: 4px;
          "
          onmouseover="this.style.background = '#e8f9f0'"
          onmouseout="this.style.background = 'transparent'"
        >
          <i class="ti ti-brand-whatsapp"></i>Compartir Sábado
        </button>
      </div>

      <div
        v-if="sabadoList.length === 0"
        style="
          padding: 1rem;
          border: 1px dashed var(--color-border-tertiary);
          border-radius: var(--border-radius-lg);
          text-align: center;
          color: var(--color-text-secondary);
          font-size: 12px;
          margin-bottom: 1rem;
          background: var(--color-background-primary);
        "
      >
        {{ emptyTextSabado }}
      </div>

      <div class="flex flex-col gap-3">
        <DesignacionCard
          v-for="d in sabadoList"
          :key="`${keyPrefix}-${d.idDesignacion || d.id}`"
          :designacion="d"
          :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
          show-ver-arbitros-btn
          @ver-arbitros="$emit('ver-arbitros', $event)"
          @action-complete="$emit('action-complete', $event)"
        />
      </div>
    </div>

    <!-- Columna Domingo -->
    <div>
      <div
        style="
          font-weight: 600;
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        "
      >
        <span
          :style="badgeDomingoStyle"
          style="padding: 2px 8px; border-radius: 12px;"
        >
          Domingo
        </span>
        <button
          v-if="showWhatsappBtn && domingoList.length > 0"
          class="btn text-xs"
          @click="$emit('share-whatsapp', 'domingo')"
          style="
            padding: 2px 6px;
            border-color: #25d366;
            color: #25d366;
            background: transparent;
            font-size: 10px;
            display: flex;
            align-items: center;
            gap: 4px;
          "
          onmouseover="this.style.background = '#e8f9f0'"
          onmouseout="this.style.background = 'transparent'"
        >
          <i class="ti ti-brand-whatsapp"></i>Compartir Domingo
        </button>
      </div>

      <div
        v-if="domingoList.length === 0"
        style="
          padding: 1rem;
          border: 1px dashed var(--color-border-tertiary);
          border-radius: var(--border-radius-lg);
          text-align: center;
          color: var(--color-text-secondary);
          font-size: 12px;
          margin-bottom: 1rem;
          background: var(--color-background-primary);
        "
      >
        {{ emptyTextDomingo }}
      </div>

      <div class="flex flex-col gap-3">
        <DesignacionCard
          v-for="d in domingoList"
          :key="`${keyPrefix}-${d.idDesignacion || d.id}`"
          :designacion="d"
          :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
          show-ver-arbitros-btn
          @ver-arbitros="$emit('ver-arbitros', $event)"
          @action-complete="$emit('action-complete', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import DesignacionCard from "./DesignacionCard.vue";

defineProps({
  sabadoList: { type: Array, default: () => [] },
  domingoList: { type: Array, default: () => [] },
  arbitrosDesignados: { type: Object, default: () => ({}) },
  keyPrefix: { type: String, default: "desig" },
  emptyTextSabado: { type: String, default: "Sin designaciones para el sábado" },
  emptyTextDomingo: { type: String, default: "Sin designaciones para el domingo" },
  badgeSabadoStyle: {
    type: Object,
    default: () => ({ background: "#faeeda", color: "#854f0b" }),
  },
  badgeDomingoStyle: {
    type: Object,
    default: () => ({ background: "#faeeda", color: "#854f0b" }),
  },
  showWhatsappBtn: { type: Boolean, default: false },
});

defineEmits(["ver-arbitros", "action-complete", "share-whatsapp"]);
</script>
