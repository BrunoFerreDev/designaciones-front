<template>
  <div>
    <!-- Topbar -->
    <div class="topbar">
      <div>
        <div class="topbar-title">Designaciones</div>
        <div class="topbar-sub">Asignación de árbitros por cancha</div>
      </div>
      <div class="topbar-actions">
        <button
          v-if="hasAnyDesignaciones"
          class="btn"
          @click="openModal('arbitrosPorDia')"
          style="border-color: #3b82f6; color: #3b82f6; background: transparent"
          onmouseover="this.style.background = '#f0f7ff'"
          onmouseout="this.style.background = 'transparent'"
        >
          <i class="ti ti-calendar-event" style="font-size: 16px"></i>Árbitros por día
        </button>
        <button
          v-if="hasAnyDesignaciones"
          class="btn"
          @click="openModal('comparativaWeekend')"
          style="border-color: #f59e0b; color: #d97706; background: transparent"
          onmouseover="this.style.background = '#fffbeb'"
          onmouseout="this.style.background = 'transparent'"
        >
          <i class="ti ti-git-compare" style="font-size: 16px"></i>Comparativa Finde
        </button>
        <button
          v-if="filteredCompletas.length > 0"
          class="btn"
          @click="openModal('whatsappMessage')"
          style="border-color: #25d366; color: #25d366; background: transparent"
          onmouseover="this.style.background = '#e8f9f0'"
          onmouseout="this.style.background = 'transparent'"
        >
          <i class="ti ti-brand-whatsapp" style="font-size: 16px"></i>Compartir WhatsApp
        </button>
        <button
          v-if="hasAnyDesignaciones && !state.loadingDesignaciones"
          class="btn primary"
          @click="openModal('addDesignacion')"
        >
          <i class="ti ti-plus"></i>Nueva designación
        </button>
      </div>
    </div>

    <div class="content animate-fade-in">
      <!-- Loading State con Skeleton UI -->
      <div v-if="state.loadingDesignaciones" class="animate-fade-in" style="padding: 1rem 0;">
        <CardSkeleton :count="4" />
      </div>

      <template v-else>
        <!-- Buscador de Árbitros en Tiempo Real -->
        <DesignacionesSearch
          :incompletas="filteredIncompletas"
          :completas="filteredCompletas"
          :aceptadas="filteredCanceladas"
          :aConfirmar="filteredAConfirmar"
        />

        <!-- Designaciones Incompletas -->
        <div v-if="filteredIncompletas.length > 0">
          <div class="alert alert-warning">
            <i class="ti ti-alert-triangle"></i>
            {{ filteredIncompletas.length }} designación(es) por completar - Asigna árbitros
          </div>

        <div style="margin-bottom: 2rem">
          <div
            style="
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 1rem;
              color: var(--color-text-secondary);
            "
          >
            📋 Pendientes a Completar (Incompletas)
          </div>
          <DesignacionesDiaGrid
            key-prefix="inc"
            :sabado-list="incSabado"
            :domingo-list="incDomingo"
            :arbitros-designados="arbitrosDesignados"
            empty-text-sabado="Sin designaciones pendientes para el sábado"
            empty-text-domingo="Sin designaciones pendientes para el domingo"
            :badge-sabado-style="{ background: '#faeeda', color: '#854f0b' }"
            :badge-domingo-style="{ background: '#faeeda', color: '#854f0b' }"
            @ver-arbitros="verArbitros"
            @action-complete="onActionComplete"
          />
        </div>
      </div>

      <!-- Designaciones Creadas / Completas -->
      <div>
        <div
          style="
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--color-text-secondary);
          "
          v-if="filteredCompletas.length > 0"
        >
          ✅ Pendientes de Aceptar (Completadas)
        </div>

        <div v-if="filteredCompletas.length > 0" class="alert alert-success">
          <i class="ti ti-check"></i>
          {{ filteredCompletas.length }} designación(es) completada(s).
        </div>

        <div
          v-if="!hasAnyDesignaciones"
          class="empty-state"
        >
          <div class="empty-icon">
            <i
              class="ti ti-clipboard-list"
              style="font-size: 36px; color: var(--color-text-secondary)"
            ></i>
          </div>
          <div>No hay designaciones registradas</div>
          <div style="margin-top: 0.75rem">
            <button class="btn primary" @click="openModal('addDesignacion')">
              <i class="ti ti-plus"></i> Crear primera designación
            </button>
          </div>
        </div>

        <div v-if="filteredCompletas.length > 0">
          <DesignacionesDiaGrid
            key-prefix="comp"
            :sabado-list="compSabado"
            :domingo-list="compDomingo"
            :arbitros-designados="arbitrosDesignados"
            empty-text-sabado="Sin designaciones completadas para el sábado"
            empty-text-domingo="Sin designaciones completadas para el domingo"
            :badge-sabado-style="{ background: '#e1f5ee', color: '#0f6e56' }"
            :badge-domingo-style="{ background: '#e1f5ee', color: '#0f6e56' }"
            show-whatsapp-btn
            @share-whatsapp="(dia) => openModal('whatsappMessage', dia)"
            @ver-arbitros="verArbitros"
            @action-complete="onActionComplete"
          />
        </div>
      </div>

      <!-- Designaciones Pendientes de Confirmar por Cancha -->
      <DesignacionesAConfirmarList :filtered-a-confirmar="filteredAConfirmar" />

      <!-- Designaciones Canceladas -->
      <div v-if="filteredCanceladas.length > 0" class="mt-4" style="margin-bottom: 2rem">
        <div
          style="
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--color-text-secondary);
          "
        >
          🚫 Designaciones Canceladas ({{ filteredCanceladas.length }})
        </div>
        <DesignacionesDiaGrid
          key-prefix="cancel"
          :sabado-list="canceladasSabado"
          :domingo-list="canceladasDomingo"
          :arbitros-designados="arbitrosDesignados"
          empty-text-sabado="Sin designaciones canceladas para el sábado"
          empty-text-domingo="Sin designaciones canceladas para el domingo"
          :badge-sabado-style="{ background: '#fee2e2', color: '#b91c1c' }"
          :badge-domingo-style="{ background: '#fee2e2', color: '#b91c1c' }"
          @ver-arbitros="verArbitros"
          @action-complete="onActionComplete"
        />
      </div>

      <!-- Designaciones Finalizadas -->
      <div v-if="filteredFinalizadas.length > 0" class="mt-4">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          "
        >
          <div
            style="
              font-size: 14px;
              font-weight: 600;
              color: var(--color-text-secondary);
            "
          >
            🏁 Designaciones Finalizadas ({{ filteredFinalizadas.length }})
          </div>
          <button
            class="btn"
            style="
              font-size: 11px;
              padding: 4px 8px;
              display: flex;
              align-items: center;
              gap: 4px;
            "
            @click="showFinalizadas = !showFinalizadas"
          >
            <i
              :class="showFinalizadas ? 'ti ti-eye-off' : 'ti ti-eye'"
              style="font-size: 14px"
            ></i>
            {{ showFinalizadas ? "Ocultar" : "Mostrar" }}
          </button>
        </div>

        <div v-if="showFinalizadas" class="animate-fade-in">
          <DesignacionesDiaGrid
            key-prefix="fin"
            :sabado-list="finSabado"
            :domingo-list="finDomingo"
            :arbitros-designados="arbitrosDesignados"
            empty-text-sabado="Sin designaciones finalizadas para el sábado"
            empty-text-domingo="Sin designaciones finalizadas para el domingo"
            :badge-sabado-style="{ background: '#e6f1fb', color: '#185fa5' }"
            :badge-domingo-style="{ background: '#e6f1fb', color: '#185fa5' }"
            @ver-arbitros="verArbitros"
            @action-complete="onActionComplete"
          />
        </div>
      </div>
    </template>
  </div>
</div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import {
  state,
  openModal,
  ultimasDesignaciones,
  loadArbitros,
  loadCanchas,
  loadArbitrosDesignados,
  getDayOfWeekLocal,
} from "../store";
import DesignacionesSearch from "../components/DesignacionesSearch.vue";
import DesignacionesDiaGrid from "../components/DesignacionesDiaGrid.vue";
import DesignacionesAConfirmarList from "../components/DesignacionesAConfirmarList.vue";
import CardSkeleton from "../components/loaders/CardSkeleton.vue";

onMounted(() => {
  ultimasDesignaciones();
  loadArbitros();
  loadCanchas();
});

const visibleArbitros = ref({});
const showFinalizadas = ref(true);

const arbitrosDesignados = computed(() => {
  const res = {};
  Object.keys(visibleArbitros.value).forEach((id) => {
    if (visibleArbitros.value[id]) {
      res[id] = state.arbitrosDesignadosMap[id] || [];
    }
  });
  return res;
});

const filteredIncompletas = computed(() => state.designacionesIncompletas);
const filteredCompletas = computed(() => state.designaciones);
const filteredFinalizadas = computed(() => state.designacionesFinalizadas);
const filteredCanceladas = computed(() => state.designacionesCanceladas);
const filteredAConfirmar = computed(() => state.designacionesAConfirmar);

const hasAnyDesignaciones = computed(
  () =>
    filteredCompletas.value.length > 0 ||
    filteredIncompletas.value.length > 0 ||
    filteredFinalizadas.value.length > 0 ||
    filteredCanceladas.value.length > 0
);

const getDayOfWeek = getDayOfWeekLocal;

// Incomplete designations split
const incSabado = computed(() =>
  filteredIncompletas.value.filter((d) => getDayOfWeek(d.fecha) !== 0)
);
const incDomingo = computed(() =>
  filteredIncompletas.value.filter((d) => getDayOfWeek(d.fecha) === 0)
);

// Complete designations split
const compSabado = computed(() =>
  filteredCompletas.value.filter((d) => getDayOfWeek(d.fecha) !== 0)
);
const compDomingo = computed(() =>
  filteredCompletas.value.filter((d) => getDayOfWeek(d.fecha) === 0)
);

// Finished designations split
const finSabado = computed(() =>
  filteredFinalizadas.value.filter((d) => getDayOfWeek(d.fecha) !== 0)
);
const finDomingo = computed(() =>
  filteredFinalizadas.value.filter((d) => getDayOfWeek(d.fecha) === 0)
);

// Cancelled designations split
const canceladasSabado = computed(() =>
  filteredCanceladas.value.filter((d) => getDayOfWeek(d.fecha) !== 0)
);
const canceladasDomingo = computed(() =>
  filteredCanceladas.value.filter((d) => getDayOfWeek(d.fecha) === 0)
);

const verArbitros = async (d, resolve) => {
  const idDesignacion = d.idDesignacion || d.id;
  if (visibleArbitros.value[idDesignacion]) {
    visibleArbitros.value[idDesignacion] = false;
    if (typeof resolve === "function") resolve();
  } else {
    try {
      await loadArbitrosDesignados(idDesignacion, true, { showLoader: false });
    } finally {
      visibleArbitros.value[idDesignacion] = true;
      if (typeof resolve === "function") resolve();
    }
  }
};

const onActionComplete = (id) => {
  visibleArbitros.value[id] = true;
};
</script>
