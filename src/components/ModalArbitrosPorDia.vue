<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem">
    <!-- Modal Header -->
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--color-border-tertiary);
        padding-bottom: 1rem;
      "
    >
      <div style="display: flex; align-items: center; gap: 10px">
        <i class="ti ti-users" style="font-size: 24px; color: var(--color-primary)"></i>
        <div>
          <h3 style="font-size: 16px; font-weight: 600; color: var(--color-text-primary); margin: 0">
            Árbitros Designados por Día
          </h3>
          <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 2px">
            Resumen de árbitros asignados para el fin de semana (excluye finalizadas)
          </div>
        </div>
      </div>
      <button 
        @click="closeModal" 
        style="padding: 6px; border: none; background: transparent; cursor: pointer; border-radius: 50%; display: flex; align-items: center; justify-content: center;"
        onmouseover="this.style.background='var(--color-background-secondary)'"
        onmouseout="this.style.background='transparent'"
      >
        <i class="ti ti-x" style="font-size: 20px; color: var(--color-text-secondary)"></i>
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" style="text-align: center; padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 12px">
      <div class="loader" style="width: 36px; height: 36px; border: 3px solid var(--color-border-tertiary); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <span style="font-size: 13px; color: var(--color-text-secondary)">Cargando designaciones...</span>
    </div>

    <div v-else style="display: flex; flex-direction: column; gap: 1.5rem">
      <!-- Resumen Estadístico -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 10px">
        <div class="card" style="padding: 10px; border-left: 4px solid #3b82f6; background: #f0f7ff; border-radius: var(--border-radius-md, 8px)">
          <div style="font-size: 9px; color: #1e3a8a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em">
            Ambos Días
          </div>
          <div style="font-size: 20px; font-weight: 700; color: #1e3a8a; margin-top: 4px; line-height: 1">
            {{ ambosDias.length }}
          </div>
          <div style="font-size: 9px; color: #1e3a8a; margin-top: 2px">Sáb. y Dom.</div>
        </div>
        <div class="card" style="padding: 10px; border-left: 4px solid #10b981; background: #ecfdf5; border-radius: var(--border-radius-md, 8px)">
          <div style="font-size: 9px; color: #065f46; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em">
            Sólo Sábado
          </div>
          <div style="font-size: 20px; font-weight: 700; color: #065f46; margin-top: 4px; line-height: 1">
            {{ soloSabado.length }}
          </div>
          <div style="font-size: 9px; color: #065f46; margin-top: 2px">Sólo Sáb.</div>
        </div>
        <div class="card" style="padding: 10px; border-left: 4px solid #f59e0b; background: #fffbeb; border-radius: var(--border-radius-md, 8px)">
          <div style="font-size: 9px; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em">
            Sólo Domingo
          </div>
          <div style="font-size: 20px; font-weight: 700; color: #92400e; margin-top: 4px; line-height: 1">
            {{ soloDomingo.length }}
          </div>
          <div style="font-size: 9px; color: #92400e; margin-top: 2px">Sólo Dom.</div>
        </div>
        <div class="card" style="padding: 10px; border-left: 4px solid #ef4444; background: #fef2f2; border-radius: var(--border-radius-md, 8px)">
          <div style="font-size: 9px; color: #991b1b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em">
            Sin Designar
          </div>
          <div style="font-size: 20px; font-weight: 700; color: #991b1b; margin-top: 4px; line-height: 1">
            {{ sinDesignar.length }}
          </div>
          <div style="font-size: 9px; color: #991b1b; margin-top: 2px">Sin partidos</div>
        </div>
      </div>

      <!-- Navigation tabs -->
      <div style="display: flex; background: var(--color-background-secondary); padding: 4px; border-radius: 20px; gap: 4px; flex-wrap: wrap;">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          style="flex: 1; min-width: 90px; text-align: center; padding: 6px 10px; font-size: 11px; border-radius: 16px; border: none; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;"
          :style="{
            background: activeTab === tab.id ? 'var(--color-background-primary)' : 'transparent',
            color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === tab.id ? '600' : '500',
            boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
          }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span 
            style="font-size: 9px; padding: 1px 5px; border-radius: 10px;"
            :style="{
              background: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-border-primary)',
              color: activeTab === tab.id ? 'white' : 'var(--color-text-secondary)'
            }"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- List panel -->
      <div 
        style="
          max-height: 40vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-right: 4px;
        "
      >
        <div 
          v-for="arb in currentList" 
          :key="arb.idArbitro" 
          class="card animate-fade-in"
          style="
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            background: var(--color-background-primary);
            border-color: var(--color-border-tertiary);
            border-radius: var(--border-radius-md, 10px);
          "
        >
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div style="display: flex; align-items: center; gap: 8px">
              <div 
                style="
                  width: 32px;
                  height: 32px;
                  border-radius: 50%;
                  background: #e0f2fe;
                  color: #0369a1;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 600;
                  font-size: 12px;
                "
              >
                {{ arb.nombre.charAt(0) }}{{ arb.apellido.charAt(0) }}
              </div>
              <div>
                <h4 style="margin: 0; font-size: 13px; font-weight: 600; color: var(--color-text-primary)">
                  {{ arb.nombre }} {{ arb.apellido }}
                </h4>
                <div style="font-size: 10px; color: var(--color-text-secondary); margin-top: 1px; display: flex; gap: 4px">
                  <span class="badge badge-gray" style="font-size: 8px; padding: 0px 4px">{{ arb.rol }}</span>
                  <span class="badge badge-gray" style="font-size: 8px; padding: 0px 4px">{{ arb.categoria }}</span>
                </div>
              </div>
            </div>
            
            <div style="display: flex; gap: 4px">
              <template v-if="activeTab !== 'sinDesignar'">
                <span v-if="arb.saturday && arb.saturday.length > 0" class="badge" style="font-size: 8px; background: #e1f5ee; color: #0f6e56; border-radius: 8px; padding: 1px 6px">Sábado</span>
                <span v-if="arb.sunday && arb.sunday.length > 0" class="badge" style="font-size: 8px; background: #e0f2fe; color: #0369a1; border-radius: 8px; padding: 1px 6px">Domingo</span>
              </template>
              <template v-else>
                <span class="badge" style="font-size: 8px; background: #fef2f2; color: #991b1b; border-radius: 8px; padding: 1px 6px">Sin asignar</span>
              </template>
            </div>
          </div>

          <!-- Assignments Details (if assigned) -->
          <div v-if="activeTab !== 'sinDesignar'" style="background: var(--color-background-secondary); border-radius: 6px; padding: 8px 10px; font-size: 10px">
            <div v-if="arb.saturday && arb.saturday.length > 0" style="margin-bottom: 6px">
              <div style="font-weight: 600; color: #0f6e56; display: flex; align-items: center; gap: 4px; margin-bottom: 2px">
                ⚽ Sábado:
              </div>
              <ul style="list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: 2px">
                <li v-for="match in arb.saturday" :key="match.id" style="color: var(--color-text-primary); display: flex; align-items: center; gap: 4px">
                  <span>🏟️ {{ match.cancha }}</span>
                  <span style="color: var(--color-text-secondary)">·</span>
                  <span>⏰ {{ match.hora }}</span>
                  <span style="color: var(--color-text-secondary)">·</span>
                  <span>{{ match.cantidadPartidos }} part.</span>
                </li>
              </ul>
            </div>
            <div v-if="arb.sunday && arb.sunday.length > 0">
              <div style="font-weight: 600; color: #185fa5; display: flex; align-items: center; gap: 4px; margin-bottom: 2px">
                ⚽ Domingo:
              </div>
              <ul style="list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: 2px">
                <li v-for="match in arb.sunday" :key="match.id" style="color: var(--color-text-primary); display: flex; align-items: center; gap: 4px">
                  <span>🏟️ {{ match.cancha }}</span>
                  <span style="color: var(--color-text-secondary)">·</span>
                  <span>⏰ {{ match.hora }}</span>
                  <span style="color: var(--color-text-secondary)">·</span>
                  <span>{{ match.cantidadPartidos }} part.</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Availability details (if unassigned) -->
          <div v-else style="background: var(--color-background-secondary); border-radius: 6px; padding: 8px 10px; font-size: 10px; color: var(--color-text-secondary)">
            <span style="font-weight: 600;">Disponibilidad declarada:</span>
            <div style="display: flex; gap: 8px; margin-top: 4px">
              <span class="badge" :style="arb.disponibleSabado ? 'background: #e1f5ee; color: #0f6e56' : 'background: #f1f5f9; color: #94a3b8'" style="padding: 1px 6px; border-radius: 6px">
                Sábado: {{ arb.disponibleSabado ? 'Disponible' : 'No disp.' }}
              </span>
              <span class="badge" :style="arb.disponibleDomingo ? 'background: #e1f5ee; color: #0f6e56' : 'background: #f1f5f9; color: #94a3b8'" style="padding: 1px 6px; border-radius: 6px">
                Domingo: {{ arb.disponibleDomingo ? 'Disponible' : 'No disp.' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <div class="modal-footer" style="border-top: 1px solid var(--color-border-tertiary); padding-top: 1rem; margin-top: 0">
      <button class="btn" @click="closeModal" style="padding: 8px 16px; font-size: 13px">
        Cerrar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { 
  state, 
  closeModal, 
  getDayOfWeekLocal, 
  getCancha, 
  loadDesignacionesIncompletas,
  loadDesignacionesCompletas,
  loadDesignacionesAceptadas
} from "../store";

const loading = ref(false);
const activeTab = ref("todos");

onMounted(async () => {
  loading.value = true;
  try {
    const promises = [];
    if (state.designacionesIncompletas.length === 0) promises.push(loadDesignacionesIncompletas());
    if (state.designaciones.length === 0) promises.push(loadDesignacionesCompletas());
    if (state.designacionesAceptadas.length === 0) promises.push(loadDesignacionesAceptadas());
    await Promise.all(promises);
  } catch (e) {
    console.warn("Error pre-loading designaciones for summary modal", e);
  } finally {
    loading.value = false;
  }
});

// Agrupar designaciones de todos los estados
const allDesignaciones = computed(() => {
  let list = [];
  if (state.modal?.data && Array.isArray(state.modal.data)) {
    list = state.modal.data;
  } else {
    const map = new Map();
    const lists = [
      ...state.designacionesIncompletas,
      ...state.designaciones,
      ...state.designacionesAConfirmar,
      ...state.designacionesAceptadas
    ];
    
    lists.forEach(d => {
      const id = d.idDesignacion || d.id;
      if (id) {
        map.set(id, d);
      }
    });
    list = Array.from(map.values());
  }

  // Filtrar las designaciones finalizadas
  return list.filter(d => d.estadoDesignacion !== 2 && d.estado !== 2);
});

// Agrupar árbitros designados con sus detalles de asignación
const arbitrosResumen = computed(() => {
  const result = {};

  allDesignaciones.value.forEach(d => {
    const id = d.idDesignacion || d.id;
    const assigned = state.arbitrosDesignadosMap[id] || [];
    const fecha = d.fecha || "";
    const dayOfWeek = getDayOfWeekLocal(fecha);
    const isSunday = dayOfWeek === 0;

    // Obtener información de la cancha
    const canchaId = d.idCancha || d.canchaId || d.cancha?.idCancha || d.cancha?.id;
    const canchaObj = canchaId ? getCancha(canchaId) : null;
    const canchaNombre = d.cancha?.nombreCancha || d.cancha?.nombre || canchaObj?.nombre || "Cancha";

    // Obtener hora
    let hora = "";
    if (fecha.includes("T")) {
      const timePart = fecha.split("T")[1];
      if (timePart) {
        const parts = timePart.split(":");
        const hh = Number(parts[0]);
        const min = Number(parts[1]);
        if (hh === 0 && min === 0) {
          hora = "Horario a confirmar";
        } else {
          hora = min === 0 ? `${hh}hs` : `${parts[0]}:${parts[1]}hs`;
        }
      }
    }

    assigned.forEach(asg => {
      const arb = asg.arbitro;
      if (!arb) return;

      const arbId = arb.idArbitro || arb.id;
      if (!arbId) return;

      if (!result[arbId]) {
        result[arbId] = {
          idArbitro: arbId,
          nombre: arb.nombre || "",
          apellido: arb.apellido || "",
          rol: arb.rol || "Árbitro",
          categoria: arb.categoria || "INICIAL",
          saturday: [],
          sunday: []
        };
      }

      const matchDetail = {
        id: id,
        cancha: canchaNombre,
        hora: hora || "Sin hora",
        cantidadPartidos: d.cantidadPartidos || 1
      };

      if (isSunday) {
        if (!result[arbId].sunday.some(m => m.id === id)) {
          result[arbId].sunday.push(matchDetail);
        }
      } else {
        if (!result[arbId].saturday.some(m => m.id === id)) {
          result[arbId].saturday.push(matchDetail);
        }
      }
    });
  });

  return Object.values(result);
});

// Listas filtradas
const ambosDias = computed(() => {
  return arbitrosResumen.value.filter(a => a.saturday.length > 0 && a.sunday.length > 0);
});

const soloSabado = computed(() => {
  return arbitrosResumen.value.filter(a => a.saturday.length > 0 && a.sunday.length === 0);
});

const soloDomingo = computed(() => {
  return arbitrosResumen.value.filter(a => a.saturday.length === 0 && a.sunday.length > 0);
});

const sinDesignar = computed(() => {
  return state.arbitros.filter(arb => {
    const arbId = arb.idArbitro || arb.id;
    return !arbitrosResumen.value.some(a => a.idArbitro === arbId);
  });
});

const totalDesignados = computed(() => arbitrosResumen.value.length);

const tabs = computed(() => [
  { id: "todos", label: "Todos Desig.", count: totalDesignados.value },
  { id: "ambos", label: "Ambos Días", count: ambosDias.value.length },
  { id: "sabado", label: "Sólo Sábado", count: soloSabado.value.length },
  { id: "domingo", label: "Sólo Domingo", count: soloDomingo.value.length },
  { id: "sinDesignar", label: "Sin Designar", count: sinDesignar.value.length }
]);

const currentList = computed(() => {
  if (activeTab.value === "ambos") return ambosDias.value;
  if (activeTab.value === "sabado") return soloSabado.value;
  if (activeTab.value === "domingo") return soloDomingo.value;
  if (activeTab.value === "sinDesignar") return sinDesignar.value;
  return arbitrosResumen.value;
});
</script>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
