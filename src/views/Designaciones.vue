<template>
  <div>
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
          <i class="ti ti-calendar-event" style="font-size: 16px"></i>Árbitros
          por día
        </button>
        <button
          v-if="hasAnyDesignaciones"
          class="btn"
          @click="openModal('comparativaWeekend')"
          style="border-color: #f59e0b; color: #d97706; background: transparent"
          onmouseover="this.style.background = '#fffbeb'"
          onmouseout="this.style.background = 'transparent'"
        >
          <i class="ti ti-git-compare" style="font-size: 16px"></i>Comparativa
          Finde
        </button>
        <button
          v-if="filteredCompletas.length > 0"
          class="btn"
          @click="openModal('whatsappMessage')"
          style="border-color: #25d366; color: #25d366; background: transparent"
          onmouseover="this.style.background = '#e8f9f0'"
          onmouseout="this.style.background = 'transparent'"
        >
          <i class="ti ti-brand-whatsapp" style="font-size: 16px"></i>Compartir
          WhatsApp
        </button>
        <button
          v-if="filteredIncompletas.length > 0"
          class="btn"
          @click="openModal('asignacionAutomatica')"
          style="border-color: #8b5cf6; color: #7c3aed; background: #fbf8ff"
          onmouseover="this.style.background = '#f3e8ff'"
          onmouseout="this.style.background = '#fbf8ff'"
        >
          <i class="ti ti-wand" style="font-size: 16px"></i>Designación automática
        </button>
        <button class="btn primary" @click="openModal('addDesignacion')">
          <i class="ti ti-plus"></i>Nueva designación
        </button>
      </div>
    </div>

    <div class="content animate-fade-in">
      <!-- Buscador de Árbitros en Tiempo Real -->
      <DesignacionesRefereeSearch
        :incompletas="filteredIncompletas"
        :completas="filteredCompletas"
        :aceptadas="filteredAceptadas"
        :a-confirmar="filteredAConfirmar"
      />

      <!-- Sección 1: Designaciones Incompletas (Estado 0) -->
      <div v-if="filteredIncompletas.length > 0" style="margin-bottom: 2rem">
        <div class="alert alert-warning">
          <i class="ti ti-alert-triangle"></i>
          {{ filteredIncompletas.length }} designación(es) por completar -
          Asigna árbitros
        </div>

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

        <DesignacionColumnSection
          :list="filteredIncompletas"
          prefix="inc"
          tag-bg="#faeeda"
          tag-color="#854f0b"
          empty-sabado-text="Sin designaciones pendientes para el sábado"
          empty-domingo-text="Sin designaciones pendientes para el domingo"
          :arbitros-designados="arbitrosDesignados"
          @ver-arbitros="verArbitros"
          @action-complete="onActionComplete"
          @assigned-auto="onActionComplete"
        />
      </div>

      <!-- Sección 2: Designaciones Creadas / Completas -->
      <div v-if="filteredCompletas.length > 0" style="margin-bottom: 2rem">
        <div
          class="alert alert-success"
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
          "
        >
          <div style="display: flex; align-items: center; gap: 8px">
            <i class="ti ti-check"></i>
            <span>
              {{ filteredCompletas.length }} designación(es) completada(s) en frontend (pendientes de aceptar y enviar al backend).
            </span>
          </div>
          <button
            class="btn primary text-xs"
            @click="handleAceptarTodas"
            style="padding: 5px 12px; gap: 6px; background: #0f6e56; border-color: #0b5341"
            :disabled="loadingAceptarTodas"
          >
            <i
              v-if="loadingAceptarTodas"
              class="ti ti-loader"
              style="animation: spin 1s linear infinite"
            ></i>
            <i v-else class="ti ti-circle-check"></i>
            <span>{{
              loadingAceptarTodas
                ? "Enviando al backend..."
                : `Aceptar todas (${filteredCompletas.length})`
            }}</span>
          </button>
        </div>

        <div
          style="
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--color-text-secondary);
          "
        >
          ✅ Pendientes de Aceptar (Completadas)
        </div>

        <DesignacionColumnSection
          :list="filteredCompletas"
          prefix="comp"
          tag-bg="#e1f5ee"
          tag-color="#0f6e56"
          empty-sabado-text="Sin designaciones completadas para el sábado"
          empty-domingo-text="Sin designaciones completadas para el domingo"
          show-share-btn
          :arbitros-designados="arbitrosDesignados"
          @ver-arbitros="verArbitros"
          @action-complete="onActionComplete"
          @assigned-auto="onActionComplete"
        />
      </div>

      <!-- Sección 3: Pendientes de Confirmar por Cancha (Envío al Backend) -->
      <DesignacionesAConfirmarList :list="filteredAConfirmar" />

      <!-- Sección 4: Designaciones Aceptadas (Estado 1) -->
      <div
        v-if="filteredAceptadas.length > 0"
        class="mt-4"
        style="margin-bottom: 2rem"
      >
        <div
          style="
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--color-text-secondary);
          "
        >
          🤝 Designaciones Aceptadas ({{ filteredAceptadas.length }})
        </div>

        <DesignacionColumnSection
          :list="filteredAceptadas"
          prefix="acept"
          tag-bg="#e0f2fe"
          tag-color="#0369a1"
          empty-sabado-text="Sin designaciones aceptadas para el sábado"
          empty-domingo-text="Sin designaciones aceptadas para el domingo"
          :arbitros-designados="arbitrosDesignados"
          @ver-arbitros="verArbitros"
          @action-complete="onActionComplete"
          @assigned-auto="onActionComplete"
        />
      </div>

      <!-- Sección 5: Designaciones Finalizadas (Estado 2) -->
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
          <DesignacionColumnSection
            :list="filteredFinalizadas"
            prefix="fin"
            tag-bg="#e6f1fb"
            tag-color="#185fa5"
            empty-sabado-text="Sin designaciones finalizadas para el sábado"
            empty-domingo-text="Sin designaciones finalizadas para el domingo"
            :arbitros-designados="arbitrosDesignados"
            @ver-arbitros="verArbitros"
            @action-complete="onActionComplete"
            @assigned-auto="onActionComplete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import {
  state,
  openModal,
  loadDesignacionesIncompletas,
  loadDesignacionesCompletas,
  loadDesignacionesAceptadas,
  loadDesignacionesFinalizadas,
  loadArbitrosDesignados,
  aceptarLoteDesignaciones,
} from "../store";
import DesignacionesRefereeSearch from "../components/designaciones/DesignacionesRefereeSearch.vue";
import DesignacionColumnSection from "../components/designaciones/DesignacionColumnSection.vue";
import DesignacionesAConfirmarList from "../components/designaciones/DesignacionesAConfirmarList.vue";

onMounted(() => {
  loadDesignacionesIncompletas();
  loadDesignacionesCompletas();
  loadDesignacionesAceptadas();
  loadDesignacionesFinalizadas();
});

const visibleArbitros = ref({});
const showFinalizadas = ref(true);
const loadingAceptarTodas = ref(false);

const handleAceptarTodas = async () => {
  if (
    !confirm(
      `¿Aceptar las ${filteredCompletas.value.length} designaciones y enviar sus árbitros asignados al backend?`,
    )
  ) {
    return;
  }
  loadingAceptarTodas.value = true;
  try {
    await aceptarLoteDesignaciones(filteredCompletas.value);
    alert("¡Designaciones aceptadas y enviadas al backend con éxito!");
  } catch (err) {
    console.error("Error al aceptar lote de designaciones:", err);
    alert("Hubo un error al aceptar algunas designaciones.");
  } finally {
    loadingAceptarTodas.value = false;
  }
};

const filteredIncompletas = computed(() => state.designacionesIncompletas);
const filteredCompletas = computed(() => state.designaciones);
const filteredFinalizadas = computed(() => state.designacionesFinalizadas);
const filteredAceptadas = computed(() => state.designacionesAceptadas);
const filteredAConfirmar = computed(() => state.designacionesAConfirmar);

const hasAnyDesignaciones = computed(
  () =>
    filteredCompletas.value.length > 0 ||
    filteredIncompletas.value.length > 0 ||
    filteredFinalizadas.value.length > 0 ||
    filteredAceptadas.value.length > 0,
);

const arbitrosDesignados = computed(() => {
  const res = {};
  Object.keys(visibleArbitros.value).forEach((id) => {
    if (visibleArbitros.value[id]) {
      res[id] = state.arbitrosDesignadosMap[id] || [];
    }
  });
  return res;
});

const verArbitros = async (d) => {
  const idDesignacion = d.idDesignacion || d.id;
  if (visibleArbitros.value[idDesignacion]) {
    visibleArbitros.value[idDesignacion] = false;
  } else {
    if (!state.arbitrosDesignadosMap[idDesignacion]) {
      await loadArbitrosDesignados(idDesignacion);
    }
    visibleArbitros.value[idDesignacion] = true;
  }
};

const onActionComplete = (id) => {
  visibleArbitros.value[id] = true;
};
</script>
