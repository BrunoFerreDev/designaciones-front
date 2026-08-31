<template>
  <div>
    <!-- Barra Superior -->
    <div class="topbar">
      <div>
        <div class="topbar-title text-slate-800 font-semibold flex items-center gap-2">
          <i class="ti ti-scale text-emerald-600"></i> Comparador de Árbitros
        </div>
        <div class="topbar-sub">
          Contrasta métricas, volumen de partidos y rendimiento cruzado entre árbitros
        </div>
      </div>
    </div>

    <div class="content">
      <StatsComparacion
        :listaArbitros="listaArbitrosCompletos"
        class="animate-fade-in"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { state, loadArbitros, loadArbitrosNoDisponibles, isArbitroActivo } from "../store";
import StatsComparacion from "../components/StatsComparacion.vue";

const listaArbitrosCompletos = computed(() => {
  const list = [
    ...(state.arbitros || []),
    ...(state.arbitrosNoDisponibles || []),
  ].filter(isArbitroActivo);

  const unique = [];
  const map = new Set();
  for (const item of list) {
    const id = item.idArbitro || item.id;
    if (id && !map.has(id)) {
      map.add(id);
      unique.push(item);
    }
  }
  return unique.sort((a, b) =>
    (a.apellido || "").localeCompare(b.apellido || "")
  );
});

onMounted(() => {
  if (!state.arbitros || state.arbitros.length === 0) {
    loadArbitros();
  }
  if (!state.arbitrosNoDisponibles || state.arbitrosNoDisponibles.length === 0) {
    loadArbitrosNoDisponibles();
  }
});
</script>

<style scoped></style>

