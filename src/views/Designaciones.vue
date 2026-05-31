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
          <i class="ti ti-brand-whatsapp" style="font-size: 16px"></i>Compartir
          WhatsApp
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
          {{ state.designacionesIncompletas.length }} designación(es) por
          completar - Asigna árbitros
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
              <div
                style="
                  font-weight: 600;
                  font-size: 13px;
                  color: var(--color-text-secondary);
                  margin-bottom: 8px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                "
              >
                <span
                  style="
                    background: #faeeda;
                    color: #854f0b;
                    padding: 2px 8px;
                    border-radius: 12px;
                  "
                  >Sábado</span
                >
              </div>
              <div
                v-if="incSabado.length === 0"
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
                Sin designaciones pendientes para el sábado
              </div>
              <div class="flex flex-col gap-3">
                <DesignacionCard
                  v-for="d in incSabado"
                  :key="`inc-${d.idDesignacion || d.id}`"
                  :designacion="d"
                  :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
                  show-ver-arbitros-btn
                  @ver-arbitros="verArbitros"
                  @action-complete="onActionComplete"
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
                  gap: 6px;
                "
              >
                <span
                  style="
                    background: #faeeda;
                    color: #854f0b;
                    padding: 2px 8px;
                    border-radius: 12px;
                  "
                  >Domingo</span
                >
              </div>
              <div
                v-if="incDomingo.length === 0"
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
                Sin designaciones pendientes para el domingo
              </div>
              <div class="flex flex-col gap-3">
                <DesignacionCard
                  v-for="d in incDomingo"
                  :key="`inc-${d.idDesignacion || d.id}`"
                  :designacion="d"
                  :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
                  show-ver-arbitros-btn
                  @ver-arbitros="verArbitros"
                  @action-complete="onActionComplete"
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
                style="
                  background: #e1f5ee;
                  color: #0f6e56;
                  padding: 2px 8px;
                  border-radius: 12px;
                "
                >Sábado</span
              >
              <button
                v-if="compSabado.length > 0"
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
              v-if="compSabado.length === 0"
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
                @action-complete="onActionComplete"
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
                style="
                  background: #e1f5ee;
                  color: #0f6e56;
                  padding: 2px 8px;
                  border-radius: 12px;
                "
                >Domingo</span
              >
              <button
                v-if="compDomingo.length > 0"
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
              v-if="compDomingo.length === 0"
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
                @action-complete="onActionComplete"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- Designaciones Pendientes de Confirmar por Cancha (Envío al Backend) -->
      <div v-if="state.designacionesAConfirmar.length > 0" class="mt-4 mb-4">
        <div
          style="
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--color-text-secondary);
            display: flex;
            align-items: center;
            gap: 6px;
          "
        >
          📤 Confirmar Envío al Backend por Cancha ({{ agrupadasPorCancha.length }} Cancha(s) Pendientes)
        </div>

        <div class="alert alert-info" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 8px;">
          <i class="ti ti-info-circle text-base"></i>
          <span style="font-size: 12px;">
            Las designaciones aquí listadas han sido finalizadas localmente. Revisa los árbitros asignados y haz clic en <strong>"Confirmar y Enviar al Backend"</strong> para registrar todo el lote de esa cancha.
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div
            v-for="grupo in agrupadasPorCancha"
            :key="grupo.id"
            class="card"
            style="
              padding: 1.25rem;
              border-top: 4px solid var(--color-primary);
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            "
          >
            <!-- Cabecera del Grupo Cancha -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-tertiary); padding-bottom: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 10px;">
              <div>
                <h4 style="margin: 0; font-size: 15px; font-weight: 600; color: var(--color-text-primary); display: flex; align-items: center; gap: 6px;">
                  🏟️ {{ grupo.nombre }}
                </h4>
                <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 2px;">
                  Tiene <strong>{{ grupo.designaciones.length }}</strong> designación(es) pendientes de confirmación.
                </div>
              </div>
              <button
                class="btn primary"
                style="padding: 6px 14px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px;"
                @click="confirmarEnvioCancha(grupo.id)"
              >
                <i class="ti ti-cloud-upload"></i>
                Confirmar y Enviar al Backend
              </button>
            </div>

            <!-- Listado de Designaciones en esa Cancha -->
            <div class="grid-2">
              <div
                v-for="d in grupo.designaciones"
                :key="d.idDesignacion || d.id"
                class="card"
                style="
                  padding: 10px 12px;
                  background: var(--color-background-secondary);
                  border-color: var(--color-border-tertiary);
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                "
              >
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="font-size: 12px; font-weight: 600; color: var(--color-text-primary);">
                      📅 {{ formatFecha(d.fecha) }}
                    </div>
                    <span class="badge badge-amber" style="font-size: 9px; padding: 1px 5px;">Listo para enviar</span>
                  </div>
                  <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 3px; display: flex; gap: 8px;">
                    <span>⚽ {{ d.cantidadPartidos }} partidos</span>
                    <span>🏆 {{ d.etapaCampeonato || 'FECHA_NORMAL' }}</span>
                  </div>

                  <!-- Árbitros en tiempo real -->
                  <div style="margin-top: 8px; border-top: 1px dashed var(--color-border-tertiary); padding-top: 6px;">
                    <div style="font-size: 10px; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 4px;">
                      🏃‍♂️ Árbitros Asignados:
                    </div>
                    <div v-if="state.arbitrosDesignadosMap[d.idDesignacion || d.id] && state.arbitrosDesignadosMap[d.idDesignacion || d.id].length > 0" style="display: flex; flex-direction: column; gap: 4px;">
                      <div
                        v-for="arb in state.arbitrosDesignadosMap[d.idDesignacion || d.id]"
                        :key="arb.idDesignados || arb.id"
                        style="font-size: 11px; display: flex; justify-content: space-between; align-items: center; background: white; padding: 4px 8px; border-radius: 4px; border: 0.5px solid var(--color-border-tertiary);"
                      >
                        <span style="font-weight: 500; color: var(--color-text-primary);">
                          {{ arb.arbitro?.nombre }} {{ arb.arbitro?.apellido }}
                        </span>
                        <span class="badge badge-gray" style="font-size: 8px; padding: 0.5px 3px;">
                          {{ arb.arbitro?.rol }}
                        </span>
                      </div>
                    </div>
                    <div v-else style="font-size: 10px; color: var(--color-text-secondary); font-style: italic;">
                      Sin árbitros asignados.
                    </div>
                  </div>
                </div>

                <div style="display: flex; gap: 8px; margin-top: 10px; justify-content: flex-end; border-top: 0.5px solid var(--color-border-tertiary); padding-top: 8px;">
                  <button
                    class="btn text-xs"
                    style="padding: 3px 8px; font-size: 10px;"
                    @click="openModal('manageReferees', d.idDesignacion || d.id)"
                  >
                    <i class="ti ti-users"></i> Editar Árbitros
                  </button>
                  <button
                    class="btn danger text-xs"
                    style="padding: 3px 8px; font-size: 10px; border-color: #64748b; color: #64748b; background: transparent;"
                    onmouseover="this.style.background = '#f1f5f9'"
                    onmouseout="this.style.background = 'transparent'"
                    @click="deshacerFinalizacionLocal(d.idDesignacion || d.id)"
                  >
                    <i class="ti ti-arrow-back-up"></i> Devolver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Designaciones Finalizadas -->
      <div v-if="state.designacionesFinalizadas.length > 0" class="mt-4">
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
            🏁 Designaciones Finalizadas ({{
              state.designacionesFinalizadas.length
            }})
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

        <div v-if="showFinalizadas" class="grid-2 animate-fade-in">
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
                gap: 6px;
              "
            >
              <span
                style="
                  background: #e6f1fb;
                  color: #185fa5;
                  padding: 2px 8px;
                  border-radius: 12px;
                "
                >Sábado</span
              >
            </div>
            <div
              v-if="finSabado.length === 0"
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
                @action-complete="onActionComplete"
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
                gap: 6px;
              "
            >
              <span
                style="
                  background: #e6f1fb;
                  color: #185fa5;
                  padding: 2px 8px;
                  border-radius: 12px;
                "
                >Domingo</span
              >
            </div>
            <div
              v-if="finDomingo.length === 0"
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
                @action-complete="onActionComplete"
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
  confirmarEnvioCancha,
  deshacerFinalizacionLocal,
  getCancha,
  formatFecha,
} from "../store";
import DesignacionCard from "../components/DesignacionCard.vue";

onMounted(() => {
  loadDesignacionesIncompletas();
  loadDesignacionesCompletas();
  loadDesignacionesFinalizadas();
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
  state.designacionesIncompletas.filter((d) => getDayOfWeek(d.fecha) !== 0),
);
const incDomingo = computed(() =>
  state.designacionesIncompletas.filter((d) => getDayOfWeek(d.fecha) === 0),
);

// Complete designations split
const compSabado = computed(() =>
  state.designaciones.filter((d) => getDayOfWeek(d.fecha) !== 0),
);
const compDomingo = computed(() =>
  state.designaciones.filter((d) => getDayOfWeek(d.fecha) === 0),
);

// Finished designations split
const finSabado = computed(() =>
  state.designacionesFinalizadas.filter((d) => getDayOfWeek(d.fecha) !== 0),
);
const finDomingo = computed(() =>
  state.designacionesFinalizadas.filter((d) => getDayOfWeek(d.fecha) === 0),
);

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

const agrupadasPorCancha = computed(() => {
  const groups = {};
  state.designacionesAConfirmar.forEach(d => {
    const canchaId = d.idCancha || d.canchaId || d.cancha?.idCancha || d.cancha?.id;
    const canchaName = d.cancha?.nombreCancha || d.cancha?.nombre || getCancha(canchaId)?.nombre || 'Cancha Desconocida';
    if (!groups[canchaId]) {
      groups[canchaId] = {
        id: canchaId,
        nombre: canchaName,
        designaciones: []
      };
    }
    groups[canchaId].designaciones.push(d);
  });
  return Object.values(groups);
});

const onActionComplete = (id) => {
  visibleArbitros.value[id] = true;
};
</script>
