<template>
  <div 
    class="card transition-all duration-200 hover:shadow-md hover:border-slate-300"
    :class="{ 'opacity-65 bg-slate-50 border-dashed border-slate-300': !cancha.estado }"
  >
    <div class="card-header">
      <div>
        <div class="card-title flex items-center gap-2">
          <span class="text-lg">🏟️</span>
          <span 
            class="font-semibold text-slate-800"
            :class="{ 'line-through text-slate-400': !cancha.estado }"
          >
            {{ cancha.nombre }}
          </span>
          <span 
            v-if="!cancha.estado" 
            class="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-medium uppercase tracking-wider"
          >
            Inactiva
          </span>
        </div>
      </div>
      <div class="flex gap-2">
        <button
          class="btn"
          @click="openModal('editCancha', cancha.id)"
          style="padding: 5px 9px"
          title="Editar cancha"
        >
          <i class="ti ti-edit text-blue-600"></i>
        </button>
        <button
          class="btn"
          :class="cancha.estado ? 'danger' : 'success'"
          @click="deleteCancha(cancha.id)"
          style="padding: 5px 9px"
          :title="cancha.estado ? 'Desactivar cancha' : 'Activar cancha'"
        >
          <i 
            class="ti" 
            :class="cancha.estado ? 'ti-trash text-red-600' : 'ti-circle-check text-emerald-600'"
          ></i>
        </button>
      </div>
    </div>

    <div class="flex items-center gap-3 mt-3 mb-2 flex-wrap">
      <span class="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
        Categoría: <strong>{{ cancha.categoria || "N/A" }}</strong>
      </span>
      <span
        class="text-xs font-semibold px-2 py-1 rounded-md"
        :class="cancha.fueraDeJuego ? 'text-amber-800 bg-amber-50' : 'text-blue-800 bg-blue-50'"
      >
        Fuera de juego: {{ cancha.fueraDeJuego ? "Sí" : "No" }}
      </span>
      <span
        class="text-xs font-semibold px-2 py-1 rounded-md"
        :class="cancha.necesitaViaje ? 'text-purple-800 bg-purple-50' : 'text-slate-500 bg-slate-100'"
      >
        🚗 Viaje: {{ cancha.necesitaViaje ? "Sí" : "No" }}
      </span>
    </div>

    <div class="flex items-center justify-between text-xs bg-slate-50 rounded-lg p-2.5 mt-3 border border-slate-100">
      <span class="text-slate-600">
        Estado: 
        <span 
          class="font-semibold" 
          :class="cancha.estado ? 'text-emerald-600' : 'text-slate-400'"
        >
          {{ cancha.estado ? "Activa" : "Inactiva" }}
        </span>
      </span>
      <span class="text-slate-500" v-if="cancha.ciudad">
        📍 {{ cancha.ciudad }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { openModal, deleteCancha } from "../store";

defineProps({
  cancha: {
    type: Object,
    required: true
  }
});
</script>
