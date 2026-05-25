<template>
  <div>
    <div class="topbar">
      <div>
        <div class="topbar-title">Designaciones</div>
        <div class="topbar-sub">Asignación de árbitros por cancha</div>
      </div>
      <div style="display: flex; gap: 10px; align-items: center">
        <button
          v-if="state.designaciones.length > 0"
          class="btn"
          @click="openModal('whatsappMessage')"
          style="border-color: #25d366; color: #25d366; background: transparent"
          onmouseover="this.style.background = '#e8f9f0'"
          onmouseout="this.style.background = 'transparent'"
        >
          <i class="ti ti-brand-whatsapp" style="font-size: 16px"></i>Compartir WhatsApp
        </button>
        <button class="btn primary" @click="openModal('addDesignacion')">
          <i class="ti ti-plus"></i>Nueva designación
        </button>
      </div>
    </div>

    <div class="content animate-fade-in">
      <!-- Designaciones Incompletas -->
      <div v-if="state.designacionesIncompletas.length > 0">
        <div class="alert alert-warning">
          <i class="ti ti-alert-triangle"></i>
          {{ state.designacionesIncompletas.length }} designación(es) por completar - Asigna árbitros
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
            📋 Designaciones Pendientes
          </div>
          <div class="grid-2">
            <!-- Columna Sábado -->
            <div>
              <div style="font-weight: 600; font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                <span style="background: #faeeda; color: #854f0b; padding: 2px 8px; border-radius: 12px;">Sábado</span>
              </div>
              <div v-if="incSabado.length === 0" style="padding: 1rem; border: 1px dashed var(--color-border-tertiary); border-radius: var(--border-radius-lg); text-align: center; color: var(--color-text-secondary); font-size: 12px; margin-bottom: 1rem; background: var(--color-background-primary);">
                Sin designaciones pendientes para el sábado
              </div>
              <div class="flex flex-col gap-3">
                <DesignacionCard
                  v-for="d in incSabado"
                  :key="`inc-${d.idDesignacion || d.id}`"
                  :designacion="d"
                />
              </div>
            </div>

            <!-- Columna Domingo -->
            <div>
              <div style="font-weight: 600; font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                <span style="background: #faeeda; color: #854f0b; padding: 2px 8px; border-radius: 12px;">Domingo</span>
              </div>
              <div v-if="incDomingo.length === 0" style="padding: 1rem; border: 1px dashed var(--color-border-tertiary); border-radius: var(--border-radius-lg); text-align: center; color: var(--color-text-secondary); font-size: 12px; margin-bottom: 1rem; background: var(--color-background-primary);">
                Sin designaciones pendientes para el domingo
              </div>
              <div class="flex flex-col gap-3">
                <DesignacionCard
                  v-for="d in incDomingo"
                  :key="`inc-${d.idDesignacion || d.id}`"
                  :designacion="d"
                />
              </div>
            </div>
          </div>
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
          v-if="state.designaciones.length > 0"
        >
          ✅ Designaciones Completas
        </div>

        <div v-if="state.designaciones.length > 0" class="alert alert-success">
          <i class="ti ti-check"></i>
          {{ state.designaciones.length }} designación(es) completada(s).
        </div>

        <div
          v-if="
            state.designaciones.length === 0 &&
            state.designacionesIncompletas.length === 0
          "
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

        <div class="grid-2" v-if="state.designaciones.length > 0">
          <!-- Columna Sábado -->
          <div>
            <div style="font-weight: 600; font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span style="background: #e1f5ee; color: #0f6e56; padding: 2px 8px; border-radius: 12px;">Sábado</span>
            </div>
            <div v-if="compSabado.length === 0" style="padding: 1rem; border: 1px dashed var(--color-border-tertiary); border-radius: var(--border-radius-lg); text-align: center; color: var(--color-text-secondary); font-size: 12px; margin-bottom: 1rem; background: var(--color-background-primary);">
              Sin designaciones completadas para el sábado
            </div>
            <div class="flex flex-col gap-3">
              <DesignacionCard
                v-for="d in compSabado"
                :key="`comp-${d.idDesignacion || d.id}`"
                :designacion="d"
                :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
                show-ver-arbitros-btn
                @ver-arbitros="verArbitros"
              />
            </div>
          </div>

          <!-- Columna Domingo -->
          <div>
            <div style="font-weight: 600; font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span style="background: #e1f5ee; color: #0f6e56; padding: 2px 8px; border-radius: 12px;">Domingo</span>
            </div>
            <div v-if="compDomingo.length === 0" style="padding: 1rem; border: 1px dashed var(--color-border-tertiary); border-radius: var(--border-radius-lg); text-align: center; color: var(--color-text-secondary); font-size: 12px; margin-bottom: 1rem; background: var(--color-background-primary);">
              Sin designaciones completadas para el domingo
            </div>
            <div class="flex flex-col gap-3">
              <DesignacionCard
                v-for="d in compDomingo"
                :key="`comp-${d.idDesignacion || d.id}`"
                :designacion="d"
                :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
                show-ver-arbitros-btn
                @ver-arbitros="verArbitros"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Designaciones Finalizadas -->
      <div v-if="state.designacionesFinalizadas.length > 0" class="mt-4">
        <div
          style="
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--color-text-secondary);
          "
        >
          🏁 Designaciones Finalizadas
        </div>

        <div class="grid-2">
          <!-- Columna Sábado -->
          <div>
            <div style="font-weight: 600; font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span style="background: #e6f1fb; color: #185fa5; padding: 2px 8px; border-radius: 12px;">Sábado</span>
            </div>
            <div v-if="finSabado.length === 0" style="padding: 1rem; border: 1px dashed var(--color-border-tertiary); border-radius: var(--border-radius-lg); text-align: center; color: var(--color-text-secondary); font-size: 12px; margin-bottom: 1rem; background: var(--color-background-primary);">
              Sin designaciones finalizadas para el sábado
            </div>
            <div class="flex flex-col gap-3">
              <DesignacionCard
                v-for="d in finSabado"
                :key="`fin-${d.idDesignacion || d.id}`"
                :designacion="d"
                :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
                show-ver-arbitros-btn
                @ver-arbitros="verArbitros"
              />
            </div>
          </div>

          <!-- Columna Domingo -->
          <div>
            <div style="font-weight: 600; font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span style="background: #e6f1fb; color: #185fa5; padding: 2px 8px; border-radius: 12px;">Domingo</span>
            </div>
            <div v-if="finDomingo.length === 0" style="padding: 1rem; border: 1px dashed var(--color-border-tertiary); border-radius: var(--border-radius-lg); text-align: center; color: var(--color-text-secondary); font-size: 12px; margin-bottom: 1rem; background: var(--color-background-primary);">
              Sin designaciones finalizadas para el domingo
            </div>
            <div class="flex flex-col gap-3">
              <DesignacionCard
                v-for="d in finDomingo"
                :key="`fin-${d.idDesignacion || d.id}`"
                :designacion="d"
                :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
                show-ver-arbitros-btn
                @ver-arbitros="verArbitros"
              />
            </div>
          </div>
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
  loadDesignacionesFinalizadas,
  loadArbitrosDesignados,
  minArbitros,
} from "../store";
import DesignacionCard from "../components/DesignacionCard.vue";

onMounted(() => {
  loadDesignacionesIncompletas();
  loadDesignacionesCompletas();
  loadDesignacionesFinalizadas();
});

const arbitrosDesignados = ref({});

const getDayOfWeek = (fechaStr) => {
  if (!fechaStr) return -1;
  try {
    const datePart = fechaStr.includes("T") ? fechaStr.split("T")[0] : fechaStr;
    const parts = datePart.split("-").map(Number);
    if (parts.length === 3) {
      const [yyyy, mm, dd] = parts;
      const dateObj = new Date(yyyy, mm - 1, dd);
      return dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    }
  } catch (e) {
    console.warn("Error parsing date in getDayOfWeek", e);
  }
  return -1;
};

// Incomplete designations split
const incSabado = computed(() =>
  state.designacionesIncompletas.filter((d) => getDayOfWeek(d.fecha) !== 0)
);
const incDomingo = computed(() =>
  state.designacionesIncompletas.filter((d) => getDayOfWeek(d.fecha) === 0)
);

// Complete designations split
const compSabado = computed(() =>
  state.designaciones.filter((d) => getDayOfWeek(d.fecha) !== 0)
);
const compDomingo = computed(() =>
  state.designaciones.filter((d) => getDayOfWeek(d.fecha) === 0)
);

// Finished designations split
const finSabado = computed(() =>
  state.designacionesFinalizadas.filter((d) => getDayOfWeek(d.fecha) !== 0)
);
const finDomingo = computed(() =>
  state.designacionesFinalizadas.filter((d) => getDayOfWeek(d.fecha) === 0)
);

const verArbitros = async (d) => {
  const idDesignacion = d.idDesignacion || d.id;
  if (arbitrosDesignados.value[idDesignacion]) {
    delete arbitrosDesignados.value[idDesignacion];
    arbitrosDesignados.value = { ...arbitrosDesignados.value };
  } else {
    let arbitros = [];
    if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
      arbitros = d.arbitrosDesignados;
    } else {
      arbitros = await loadArbitrosDesignados(idDesignacion);
    }
    arbitrosDesignados.value[idDesignacion] = arbitros;
    arbitrosDesignados.value = { ...arbitrosDesignados.value };
  }
};
</script>
