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
          :style="{
            background: tagBg,
            color: tagColor,
            padding: '2px 8px',
            borderRadius: '12px',
          }"
        >
          Sábado
        </span>

        <button
          v-if="showShareBtn && sabadoList.length > 0"
          class="btn text-xs"
          @click="openModal('whatsappMessage', 'sabado')"
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
        {{ emptySabadoText }}
      </div>

      <div v-else class="flex flex-col gap-3">
        <DesignacionCard
          v-for="d in sabadoList"
          :key="`${prefix}-${d.idDesignacion || d.id}`"
          :designacion="d"
          :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
          show-ver-arbitros-btn
          @ver-arbitros="$emit('ver-arbitros', d)"
          @action-complete="$emit('action-complete', $event)"
          @assigned-auto="$emit('assigned-auto', $event)"
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
          :style="{
            background: tagBg,
            color: tagColor,
            padding: '2px 8px',
            borderRadius: '12px',
          }"
        >
          Domingo
        </span>

        <button
          v-if="showShareBtn && domingoList.length > 0"
          class="btn text-xs"
          @click="openModal('whatsappMessage', 'domingo')"
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
        {{ emptyDomingoText }}
      </div>

      <div v-else class="flex flex-col gap-3">
        <DesignacionCard
          v-for="d in domingoList"
          :key="`${prefix}-${d.idDesignacion || d.id}`"
          :designacion="d"
          :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
          show-ver-arbitros-btn
          @ver-arbitros="$emit('ver-arbitros', d)"
          @action-complete="$emit('action-complete', $event)"
          @assigned-auto="$emit('assigned-auto', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { openModal, getDayOfWeekLocal } from "../../store";
import DesignacionCard from "../DesignacionCard.vue";

const props = defineProps({
  list: { type: Array, required: true },
  prefix: { type: String, default: "des" },
  tagBg: { type: String, default: "#faeeda" },
  tagColor: { type: String, default: "#854f0b" },
  emptySabadoText: {
    type: String,
    default: "Sin designaciones para el sábado",
  },
  emptyDomingoText: {
    type: String,
    default: "Sin designaciones para el domingo",
  },
  showShareBtn: { type: Boolean, default: false },
  arbitrosDesignados: { type: Object, default: () => ({}) },
});

defineEmits(["ver-arbitros", "action-complete", "assigned-auto"]);

const sabadoList = computed(() =>
  props.list.filter((d) => getDayOfWeekLocal(d.fecha) !== 0),
);

const domingoList = computed(() =>
  props.list.filter((d) => getDayOfWeekLocal(d.fecha) === 0),
);
</script>

