<template>
  <div
    class="arb-list-item hover:bg-slate-50 p-3 rounded-xl border border-slate-100 transition-all duration-200"
  >
    <div class="arb-list-item-main flex items-start gap-4">
      <!-- Avatar con Iniciales -->
      <div
        class="arb-avatar flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
        :style="{
          background: isActivo
            ? 'linear-gradient(135deg, #1d9e75, #125c44)'
            : 'linear-gradient(135deg, #888888, #555555)',
        }"
      >
        {{ initials }}
      </div>

      <!-- Información del Árbitro -->
      <div class="arb-info flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="arb-name font-semibold text-sm"
            :class="
              isActivo ? 'text-slate-800' : 'text-slate-500 line-through'
            "
          >
            {{ arbitro.nombre }} {{ arbitro.apellido }}
          </span>
          <span :class="['badge', categoryClass]">{{ categoryLabel }}</span>
        </div>

        <div class="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
          <span class="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
            📋 Designaciones: <strong :class="isActivo ? 'text-slate-800' : 'text-slate-500'">{{ arbitro.designaciones || 0 }}</strong>
          </span>
          <span v-if="arbitro.partidosDirigidos !== undefined || arbitro.partidos !== undefined" class="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
            ⚽ Partidos: <strong>{{ arbitro.partidosDirigidos || arbitro.partidos || 0 }}</strong>
          </span>
        </div>

        <!-- Disponibilidad por Día / Estado del Sistema -->
        <div v-if="!onlyStatusToggle" class="flex items-center gap-1 mt-1 text-[11px]">
          <span class="text-slate-400">📅 Disponible:</span>
          <span
            v-if="arbitro.disponibleSabado && arbitro.disponibleDomingo"
            class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
          >
            Sábado y Domingo
          </span>
          <span
            v-else-if="arbitro.disponibleSabado"
            class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
          >
            Sábado
          </span>
          <span
            v-else-if="arbitro.disponibleDomingo"
            class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200"
          >
            Domingo
          </span>
          <span
            v-else
            class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
          >
            Ninguno
          </span>
        </div>
        <div v-else class="flex items-center gap-1 mt-1 text-[11px]">
          <span class="text-slate-400">Sistema:</span>
          <span
            v-if="isActivo"
            class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
          >
            Habilitado
          </span>
          <span
            v-else
            class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
          >
            Deshabilitado
          </span>
        </div>

        <!-- WhatsApp e Indumentaria -->
        <div class="flex items-center gap-3.5 mt-2 flex-wrap text-[11px]">
          <a
            v-if="arbitro.whatsapp"
            :href="whatsappLink"
            target="_blank"
            class="inline-flex items-center gap-1 font-semibold no-underline transition-colors"
            :style="{ color: isActivo ? '#16a34a' : '#64748b' }"
            title="Enviar WhatsApp"
          >
            <i class="ti ti-brand-whatsapp text-xs"></i>
            <span>{{ arbitro.whatsapp }}</span>
          </a>
          <span v-else class="text-slate-400 inline-flex items-center gap-1">
            📱 Sin número
          </span>

          <span class="text-slate-500 inline-flex items-center gap-1">
            👕 {{ arbitro.talleCamiseta || "M" }} · 🩳
            {{ arbitro.talleShort || "M" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Acciones -->
    <div
      class="arb-list-actions mt-3 flex items-center justify-end gap-2 flex-wrap"
    >
      <router-link
        :to="{ path: '/estadisticas', query: { arbitro: arbitro.idArbitro } }"
        class="btn"
        style="
          padding: 6px 10px;
          font-size: 12px;
          color: #0f6e56;
          border-color: #a7f3d0;
          background: #ecfdf5;
        "
        title="Ver estadísticas y rendimiento"
      >
        <i class="ti ti-chart-bar"></i>
        <span>Estadísticas</span>
      </router-link>

      <button
        class="btn"
        @click="openModal('editArbitro', arbitro.idArbitro)"
        style="
          padding: 6px 10px;
          font-size: 12px;
          color: #185fa5;
          border-color: #bcd1e6;
          background: #f6fafd;
        "
        title="Editar árbitro"
      >
        <i class="ti ti-edit"></i>
        <span>Editar</span>
      </button>

      <!-- Disponibilidad Fin de Semana (Solo en Tab Activos) -->
      <template v-if="!onlyStatusToggle">
        <!-- Disponibilidad Sábado -->
        <button
          class="btn"
          @click="handleToggle('disponibleSabado')"
          :disabled="updating"
          style="padding: 6px 10px; font-size: 12px"
          :style="{
            borderColor: arbitro.disponibleSabado ? '#bcd1e6' : '#e2e8f0',
            background: arbitro.disponibleSabado ? '#f0f7ff' : '#f8fafc',
            color: arbitro.disponibleSabado ? '#185fa5' : '#64748b',
          }"
          title="Disponibilidad Sábado"
        >
          <i
            :class="
              arbitro.disponibleSabado
                ? 'ti ti-circle-check text-emerald-600'
                : 'ti ti-circle-dashed text-slate-400'
            "
          ></i>
          <span>Sáb</span>
        </button>

        <!-- Disponibilidad Domingo -->
        <button
          class="btn"
          @click="handleToggle('disponibleDomingo')"
          :disabled="updating"
          style="padding: 6px 10px; font-size: 12px"
          :style="{
            borderColor: arbitro.disponibleDomingo ? '#e9d5ff' : '#e2e8f0',
            background: arbitro.disponibleDomingo ? '#faf5ff' : '#f8fafc',
            color: arbitro.disponibleDomingo ? '#7e22ce' : '#64748b',
          }"
          title="Disponibilidad Domingo"
        >
          <i
            :class="
              arbitro.disponibleDomingo
                ? 'ti ti-circle-check text-emerald-600'
                : 'ti ti-circle-dashed text-slate-400'
            "
          ></i>
          <span>Dom</span>
        </button>
      </template>

      <!-- Botón de Icono para Cambiar Estado (Trash si está activo / Activar si está inactivo) -->
      <button
        v-if="isActivo"
        class="btn danger"
        @click="handleToggle('estado')"
        :disabled="updating"
        style="padding: 6px 10px; font-size: 13px;"
        title="Deshabilitar árbitro del sistema"
      >
        <i
          v-if="updating"
          class="ti ti-loader"
          style="animation: spin 1s linear infinite;"
        ></i>
        <i v-else class="ti ti-trash"></i>
      </button>

      <button
        v-else
        class="btn"
        @click="handleToggle('estado')"
        :disabled="updating"
        style="
          padding: 6px 10px;
          font-size: 13px;
          border-color: #bbf7d0;
          background: #f0fdf4;
          color: #15803d;
        "
        title="Habilitar árbitro en el sistema"
      >
        <i
          v-if="updating"
          class="ti ti-loader"
          style="animation: spin 1s linear infinite;"
        ></i>
        <i v-else class="ti ti-circle-check"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  openModal,
  toggleEstadoArbitro,
  updateArbitroDisponibilidad,
  deleteArbitro,
  isArbitroActivo,
} from "../store";

const props = defineProps({
  arbitro: {
    type: Object,
    required: true,
  },
  onlyStatusToggle: {
    type: Boolean,
    default: false,
  },
});

const isActivo = computed(() => isArbitroActivo(props.arbitro));
const updating = ref(false);

const handleToggle = async (key) => {
  if (updating.value) return;
  updating.value = true;
  try {
    if (key === "estado") {
      await toggleEstadoArbitro(props.arbitro.idArbitro);
    } else {
      await updateArbitroDisponibilidad(props.arbitro.idArbitro, key);
    }
  } finally {
    updating.value = false;
  }
};
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
