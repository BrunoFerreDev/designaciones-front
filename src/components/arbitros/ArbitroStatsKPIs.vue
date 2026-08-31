<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Total Designaciones -->
    <div
      class="stat-card border-none shadow-md text-white flex flex-col justify-between"
      style="
        background: linear-gradient(135deg, #8b5cf6, #6d28d9);
        padding: 1.5rem;
        min-height: 125px;
        border-radius: 16px;
        position: relative;
        overflow: hidden;
      "
    >
      <div class="flex justify-between items-start z-10">
        <span class="text-purple-100 text-xs font-semibold uppercase tracking-wider">
          Total Designaciones
        </span>
        <i class="ti ti-clipboard-check text-purple-200 text-2xl"></i>
      </div>
      <div
        class="stat-num text-left z-10 text-white"
        style="font-size: 32px; font-weight: 700; margin-top: 12px"
      >
        {{ totalDesignaciones || 0 }}
      </div>
      <div
        style="
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          top: -25px;
          right: -25px;
        "
      ></div>
    </div>

    <!-- Partidos Dirigidos -->
    <div
      class="stat-card border-none shadow-md text-white flex flex-col justify-between"
      style="
        background: linear-gradient(135deg, #10b981, #047857);
        padding: 1.5rem;
        min-height: 125px;
        border-radius: 16px;
        position: relative;
        overflow: hidden;
      "
    >
      <div class="flex justify-between items-start z-10">
        <span class="text-emerald-100 text-xs font-semibold uppercase tracking-wider">
          Partidos Dirigidos
        </span>
        <i class="ti ti-ball-football text-emerald-200 text-2xl"></i>
      </div>
      <div
        class="stat-num text-left z-10 text-white"
        style="font-size: 32px; font-weight: 700; margin-top: 12px"
      >
        {{ totalPartidosDirigidos || 0 }}
      </div>
      <div
        style="
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          top: -25px;
          right: -25px;
        "
      ></div>
    </div>

    <!-- Promedio Partidos por Designación -->
    <div
      class="stat-card border border-slate-100 shadow-sm bg-white flex flex-col justify-between rounded-2xl"
      style="padding: 1.5rem; min-height: 125px"
    >
      <div class="flex justify-between items-start">
        <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          Prom. Partidos / Desig.
        </span>
        <i class="ti ti-gauge text-slate-400 text-xl"></i>
      </div>
      <div
        class="stat-num text-slate-800 text-left"
        style="font-size: 32px; font-weight: 700; margin-top: 12px"
      >
        {{ promedioPartidos }}
      </div>
    </div>

    <!-- Efectividad de Cumplimiento -->
    <div
      class="stat-card border border-slate-100 shadow-sm bg-white flex flex-col justify-between rounded-2xl"
      style="padding: 1.5rem; min-height: 125px"
    >
      <div class="flex justify-between items-start">
        <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          Efectividad / Completas
        </span>
        <i class="ti ti-circle-check text-emerald-600 text-xl"></i>
      </div>
      <div
        class="stat-num text-emerald-700 text-left"
        style="font-size: 32px; font-weight: 700; margin-top: 12px"
      >
        {{ porcentajeCumplimiento }}%
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalDesignaciones: {
    type: Number,
    default: 0,
  },
  totalPartidosDirigidos: {
    type: Number,
    default: 0,
  },
  promedioPartidos: {
    type: [String, Number],
    default: "0.0",
  },
  porcentajeCumplimiento: {
    type: [String, Number],
    default: 0,
  },
});
</script>
