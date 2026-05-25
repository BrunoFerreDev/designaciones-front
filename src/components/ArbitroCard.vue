<template>
  <div class="arb-list-item hover:bg-slate-50 p-3 rounded-xl border border-slate-100 transition-all duration-200">
    <div class="arb-list-item-main flex items-start gap-4">
      <!-- Avatar con Iniciales -->
      <div
        class="arb-avatar flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
        :style="{
          background: arbitro.estado 
            ? 'linear-gradient(135deg, #1d9e75, #125c44)' 
            : 'linear-gradient(135deg, #888888, #555555)'
        }"
      >
        {{ initials }}
      </div>

      <!-- Información del Árbitro -->
      <div class="arb-info flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span 
            class="arb-name font-semibold text-sm"
            :class="arbitro.estado ? 'text-slate-800' : 'text-slate-500 line-through'"
          >
            {{ arbitro.nombre }} {{ arbitro.apellido }}
          </span>
          <span :class="['badge', categoryClass]">{{ categoryLabel }}</span>
        </div>

        <div class="text-xs text-slate-500 mt-1">
          Partidos: 
          <strong :class="arbitro.estado ? 'text-slate-800' : 'text-slate-500'">
            {{ arbitro.designaciones || 0 }}
          </strong> 
          designaciones
        </div>

        <!-- WhatsApp e Indumentaria -->
        <div class="flex items-center gap-3.5 mt-2 flex-wrap text-[11px]">
          <a
            v-if="arbitro.whatsapp"
            :href="whatsappLink"
            target="_blank"
            class="inline-flex items-center gap-1 font-semibold no-underline transition-colors"
            :style="{ color: arbitro.estado ? '#16a34a' : '#64748b' }"
            title="Enviar WhatsApp"
          >
            <i class="ti ti-brand-whatsapp text-xs"></i>
            <span>{{ arbitro.whatsapp }}</span>
          </a>
          <span v-else class="text-slate-400 inline-flex items-center gap-1">
            📱 Sin número
          </span>

          <span class="text-slate-500 inline-flex items-center gap-1">
            👕 {{ arbitro.talleCamiseta || "M" }} · 🩳 {{ arbitro.talleShort || "M" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Acciones -->
    <div class="arb-list-actions mt-3 flex items-center justify-end gap-2 flex-wrap">
      <button
        class="btn"
        @click="openModal('editArbitro', arbitro.idArbitro)"
        style="padding: 6px 10px; font-size: 12px; color: #185fa5; border-color: #bcd1e6; background: #f6fafd;"
        title="Editar árbitro"
      >
        <i class="ti ti-edit"></i>
        <span>Editar</span>
      </button>

      <button
        class="btn"
        @click="toggleDisponible(arbitro.idArbitro)"
        style="padding: 6px 10px; font-size: 12px"
        :title="arbitro.estado ? 'Marcar como no disponible' : 'Marcar como disponible'"
      >
        <i :class="arbitro.estado ? 'ti ti-circle-x text-amber-600' : 'ti ti-circle-check text-emerald-600'"></i>
        <span>{{ arbitro.estado ? "No disp." : "Disponible" }}</span>
      </button>

      <button
        class="btn danger"
        @click="deleteArbitro(arbitro.idArbitro)"
        style="padding: 6px 10px"
        title="Eliminar árbitro"
      >
        <i class="ti ti-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { openModal, toggleDisponible, deleteArbitro } from "../store";

const props = defineProps({
  arbitro: {
    type: Object,
    required: true
  }
});

const initials = computed(() => {
  const n = props.arbitro.nombre ? props.arbitro.nombre[0] : "";
  const a = props.arbitro.apellido ? props.arbitro.apellido[0] : "";
  return (n + a).toUpperCase().slice(0, 2);
});

const categoryLabel = computed(() => {
  const map = {
    ELITE: "Elite",
    AVANZADO: "Avanzado",
    INTERMEDIO: "Intermedio",
    EN_FORMACION: "En Formación",
    INCIAL: "Inicial",
  };
  return map[props.arbitro.categoria] || props.arbitro.categoria || "Inicial";
});

const categoryClass = computed(() => {
  const map = {
    ELITE: "badge-green",
    AVANZADO: "badge-blue",
    INTERMEDIO: "badge-amber",
    EN_FORMACION: "badge-gray",
    INCIAL: "badge-red",
  };
  return map[props.arbitro.categoria] || "badge-gray";
});

const whatsappLink = computed(() => {
  if (!props.arbitro.whatsapp) return "#";
  const clean = props.arbitro.whatsapp.replace(/[^0-9+]/g, "");
  return `https://wa.me/${clean}`;
});
</script>
