<template>
  <div class="card suspension-card" style="border-radius: var(--border-radius-lg)">
    <div
      class="card-header"
      style="
        border-bottom: 0.5px solid var(--color-border-tertiary);
        padding-bottom: 12px;
        margin-bottom: 16px;
      "
    >
      <div>
        <div class="card-title" style="display: flex; align-items: center; gap: 8px">
          <i class="ti ti-clipboard-list" style="color: #185fa5; font-size: 18px"></i>
          Historial de Sanciones
        </div>
        <div class="card-sub">Registro de todas las incidencias registradas en el sistema</div>
      </div>
      <span class="badge badge-blue">{{ filteredSuspensiones.length }}</span>
    </div>

    <!-- Filtros de búsqueda en historial -->
    <div style="display: flex; gap: 10px; margin-bottom: 1rem; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 150px">
        <input
          v-model="searchQuery"
          placeholder="Filtrar por árbitro..."
          class="form-input"
          style="height: 34px; font-size: 12px"
        />
      </div>
      <div>
        <select
          v-model="filterType"
          class="form-input"
          style="height: 34px; font-size: 12px; padding: 4px 8px"
        >
          <option value="">Todos los tipos</option>
          <option value="1">Llamados de atención</option>
          <option value="2">Suspensiones</option>
        </select>
      </div>
    </div>

    <div v-if="filteredSuspensiones.length === 0" class="empty-state" style="padding: 3rem 1rem">
      <div class="empty-icon">📂</div>
      No se han registrado sanciones o advertencias que coincidan con los criterios.
    </div>

    <!-- Vista de Escritorio (Tabla Responsiva) -->
    <div
      v-else
      class="desktop-only table-responsive"
      style="max-height: 480px; overflow-y: auto"
    >
      <table class="des-table">
        <thead>
          <tr>
            <th>Árbitro</th>
            <th>Medida / Fecha</th>
            <th>Cancha</th>
            <th>Detalle</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filteredSuspensiones" :key="s.id || s.idSuspencion">
            <!-- Árbitro Info -->
            <td>
              <div style="display: flex; align-items: center; gap: 8px">
                <div
                  class="arb-avatar"
                  style="
                    width: 28px;
                    height: 28px;
                    font-size: 10px;
                    font-weight: bold;
                    background: #e2e8f0;
                    color: #475569;
                  "
                >
                  {{ getInitials(s.arbitro) }}
                </div>
                <div>
                  <div style="font-weight: 600; font-size: 10px">
                    {{ getArbitroName(s.arbitro) }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Medida y Fecha -->
            <td>
              <span
                :class="['badge', s.tipoSuspencion === 2 ? 'badge-red' : 'badge-amber']"
                style="font-size: 10px"
              >
                {{ s.tipoSuspencion === 2 ? `Suspensión (${s.cantidadDias}d)` : "Llamado Atención" }}
              </span>
              <div
                style="
                  font-size: 10px;
                  color: var(--color-text-secondary);
                  margin-top: 4px;
                  text-transform: capitalize;
                "
              >
                {{ formatFecha(s.fechaIncidente?.split("T")[0]) }}
              </div>
            </td>

            <!-- Cancha -->
            <td style="font-size: 10px; font-weight: 500">
              {{ s.cancha?.nombreCancha || "—" }}
            </td>

            <!-- Detalle / Motivo -->
            <td>
              <button
                type="button"
                class="btn"
                style="padding: 4px 8px; font-size: 11px; border-color: #bcd1e6; color: #185fa5; background: #f6fafd;"
                @click="openModal('viewSuspension', s.id || s.idSuspencion)"
              >
                👁️ Ver Detalle
              </button>
            </td>

            <!-- Estado Actual (Activo vs Expirado) -->
            <td>
              <span
                v-if="s.tipoSuspencion === 2"
                :class="['badge', isSuspensionActive(s) ? 'badge-red' : 'badge-gray']"
                style="font-size: 10px"
              >
                {{ isSuspensionActive(s) ? "Activa" : "Expirada" }}
              </span>
              <span v-else class="badge badge-gray" style="font-size: 10px">
                Registrado
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Vista de Celulares (Tarjetas Listables Limpias) -->
    <div
      v-if="filteredSuspensiones.length > 0"
      class="mobile-only animate-fade-in"
      style="display: flex; flex-direction: column; gap: 10px; max-height: 480px; overflow-y: auto;"
    >
      <div
        v-for="s in filteredSuspensiones"
        :key="s.id || s.idSuspencion"
        class="card"
        style="padding: 12px; border-color: var(--color-border-tertiary); box-shadow: 0 1px 3px rgba(0,0,0,0.02); transition: transform 0.2s;"
      >
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <!-- Árbitro Info -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <div
              class="arb-avatar"
              style="width: 28px; height: 28px; font-size: 10px; font-weight: bold; background: #e2e8f0; color: #475569;"
            >
              {{ getInitials(s.arbitro) }}
            </div>
            <div>
              <div style="font-weight: 600; font-size: 11px; color: var(--color-text-primary);">
                {{ getArbitroName(s.arbitro) }}
              </div>
            </div>
          </div>

          <!-- Estado Badge -->
          <span
            v-if="s.tipoSuspencion === 2"
            :class="['badge', isSuspensionActive(s) ? 'badge-red' : 'badge-gray']"
            style="font-size: 9px;"
          >
            {{ isSuspensionActive(s) ? "Activa" : "Expirada" }}
          </span>
          <span v-else class="badge badge-gray" style="font-size: 9px;">
            Registrado
          </span>
        </div>

        <!-- Detalles Incidentes -->
        <div
          style="font-size: 11px; display: flex; flex-direction: column; gap: 4px; border-top: 0.5px solid var(--color-border-tertiary); padding-top: 8px; margin-bottom: 8px; color: var(--color-text-secondary);"
        >
          <div>
            <span style="font-weight: 500;">Medida:</span>
            <span
              :class="['badge', s.tipoSuspencion === 2 ? 'badge-red' : 'badge-amber']"
              style="font-size: 9px; margin-left: 4px; display: inline-block;"
            >
              {{ s.tipoSuspencion === 2 ? `Suspensión (${s.cantidadDias}d)` : "Llamado Atención" }}
            </span>
          </div>
          <div>
            <span style="font-weight: 500;">Fecha:</span>
            <span style="text-transform: capitalize; color: var(--color-text-primary); margin-left: 4px;">
              {{ formatFecha(s.fechaIncidente?.split("T")[0]) }}
            </span>
          </div>
          <div>
            <span style="font-weight: 500;">Cancha:</span>
            <span style="color: var(--color-text-primary); margin-left: 4px;">
              {{ s.cancha?.nombreCancha || "—" }}
            </span>
          </div>
        </div>

        <!-- Acciones -->
        <div style="display: flex; justify-content: flex-end;">
          <button
            type="button"
            class="btn"
            style="padding: 4px 8px; font-size: 10px; border-color: #bcd1e6; color: #185fa5; background: #f6fafd;"
            @click="openModal('viewSuspension', s.id || s.idSuspencion)"
          >
            👁️ Ver Detalle
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { state, getArbitro, formatFecha, openModal } from "../store";

// Filtros locales
const searchQuery = ref("");
const filterType = ref("");

const getArbitroId = (arbitroProp) => {
  if (!arbitroProp) return null;
  if (typeof arbitroProp === "object") {
    return arbitroProp.idArbitro || arbitroProp.id;
  }
  return Number(arbitroProp);
};

const getInitials = (arbitroProp) => {
  const arbId = getArbitroId(arbitroProp);
  if (!arbId) return "??";
  const a = getArbitro(Number(arbId));
  if (a) {
    const n = a.nombre ? a.nombre[0] : "";
    const al = a.apellido ? a.apellido[0] : "";
    return (n + al).toUpperCase().slice(0, 2);
  }
  if (typeof arbitroProp === "object") {
    const n = arbitroProp.nombre ? arbitroProp.nombre[0] : "";
    const al = arbitroProp.apellido ? arbitroProp.apellido[0] : "";
    return (n + al).toUpperCase().slice(0, 2);
  }
  return "??";
};

const getArbitroName = (arbitroProp) => {
  const arbId = getArbitroId(arbitroProp);
  const a = getArbitro(Number(arbId));
  if (a) return `${a.apellido}, ${a.nombre}`;
  if (typeof arbitroProp === "object") {
    return `${arbitroProp.apellido || ""}, ${arbitroProp.nombre || ""}`;
  }
  return `ID: ${arbId}`;
};

const isSuspensionActive = (s) => {
  if (s.tipoSuspencion !== 2) return false;
  try {
    if (s.fechaFin) {
      return new Date(s.fechaFin) > new Date();
    }
    const start = new Date(s.fechaIncidente);
    const duration = parseInt(s.cantidadDias || 0);
    const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
    return end > new Date();
  } catch (e) {
    return false;
  }
};

const filteredSuspensiones = computed(() => {
  return state.suspensiones
    .filter((s) => {
      const arbId = getArbitroId(s.arbitro);
      const arb = getArbitro(Number(arbId));
      let arbName = "";
      if (arb) {
        arbName = `${arb.nombre} ${arb.apellido}`.toLowerCase();
      } else if (typeof s.arbitro === "object") {
        arbName = `${s.arbitro.nombre || ""} ${s.arbitro.apellido || ""}`.toLowerCase();
      }

      const matchesSearch =
        !searchQuery.value ||
        arbName.includes(searchQuery.value.toLowerCase().trim());

      const matchesType =
        !filterType.value ||
        String(s.tipoSuspencion) === String(filterType.value);

      return matchesSearch && matchesType;
    })
    .reverse();
});
</script>

<style scoped>
@media (max-width: 767px) {
  .desktop-only {
    display: none !important;
  }
}

@media (min-width: 768px) {
  .mobile-only {
    display: none !important;
  }
}
</style>
