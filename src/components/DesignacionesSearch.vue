<template>
  <div
    class="card"
    style="
      margin-bottom: 1.5rem;
      padding: 12px 16px;
      border-radius: var(--border-radius-md);
    "
  >
    <div
      style="
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
      "
    >
      <i
        class="ti ti-search"
        style="
          position: absolute;
          left: 12px;
          color: var(--color-text-secondary);
          font-size: 16px;
        "
      ></i>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Buscar árbitro por nombre o apellido para ver sus canchas asignadas..."
        class="form-input"
        style="
          padding-left: 36px;
          padding-right: 36px;
          margin-bottom: 0;
          width: 100%;
          border-radius: 8px;
          border: 1px solid var(--color-border-primary);
          height: 38px;
          font-size: 13px;
        "
      />
      <button
        v-if="searchQuery"
        @click="searchQuery = ''"
        style="
          position: absolute;
          right: 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
        "
      >
        <i class="ti ti-x" style="font-size: 16px"></i>
      </button>
    </div>

    <!-- Panel de Resultados -->
    <div
      v-if="searchQuery.trim() !== ''"
      class="animate-fade-in"
      style="
        margin-top: 12px;
        border-top: 1px dashed var(--color-border-tertiary);
        padding-top: 12px;
      "
    >
      <div
        style="
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: 8px;
        "
      >
        ⚽ Canchas y designaciones del árbitro:
      </div>

      <div
        v-if="filteredMatchList.length === 0"
        style="
          font-size: 12px;
          color: var(--color-text-secondary);
          font-style: italic;
          padding: 4px 0;
        "
      >
        No se encontraron designaciones activas para "{{ searchQuery }}" en este fin de semana.
      </div>

      <div v-else style="display: flex; flex-direction: column; gap: 8px">
        <div
          v-for="match in filteredMatchList"
          :key="match.id"
          class="card"
          style="
            padding: 10px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--color-background-secondary);
            border-color: var(--color-border-tertiary);
            font-size: 12px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
            border-radius: 8px;
          "
        >
          <div
            style="
              display: flex;
              align-items: center;
              gap: 8px;
              flex-wrap: wrap;
            "
          >
            <span style="font-weight: 600; color: var(--color-text-primary)">
              🏃‍♂️ {{ match.refereeName }}
            </span>
            <span style="color: var(--color-text-secondary)">en</span>
            <span
              style="
                font-weight: 600;
                color: var(--color-primary);
                display: flex;
                align-items: center;
                gap: 2px;
              "
            >
              🏟️ {{ match.canchaName }}
            </span>
            <span style="color: var(--color-text-secondary)">·</span>
            <span style="color: var(--color-text-secondary); font-weight: 500">
              {{ match.fechaFormateada }}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px">
            <span
              class="badge badge-gray"
              style="font-size: 8px; padding: 1px 5px"
            >
              {{ match.rol }}
            </span>
            <span
              :class="['badge', match.statusClass]"
              style="font-size: 8px; padding: 1px 5px"
            >
              {{ match.statusLabel }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { state, getCancha, getDayOfWeekLocal } from "../store";

const props = defineProps({
  incompletas: { type: Array, default: () => [] },
  completas: { type: Array, default: () => [] },
  aceptadas: { type: Array, default: () => [] },
  aConfirmar: { type: Array, default: () => [] },
});

const searchQuery = ref("");

const filteredMatchList = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return [];

  const matches = [];
  const lists = [
    ...props.incompletas,
    ...props.completas,
    ...props.aceptadas,
    ...props.aConfirmar,
  ];

  const visited = new Set();

  lists.forEach((d) => {
    const id = d.idDesignacion || d.id;
    if (!id || visited.has(id)) return;
    visited.add(id);

    const assigned = state.arbitrosDesignadosMap[id] || [];
    assigned.forEach((asg) => {
      const arb = asg.arbitro;
      if (!arb) return;

      const nombre = (arb.nombre || "").toLowerCase();
      const apellido = (arb.apellido || "").toLowerCase();

      if (nombre.includes(query) || apellido.includes(query)) {
        const canchaId =
          d.idCancha || d.canchaId || d.cancha?.idCancha || d.cancha?.id;
        const canchaObj = canchaId ? getCancha(canchaId) : null;
        const canchaName =
          d.cancha?.nombreCancha ||
          d.cancha?.nombre ||
          canchaObj?.nombre ||
          "Cancha";

        let hora = "";
        if (d.fecha && d.fecha.includes("T")) {
          const timePart = d.fecha.split("T")[1];
          if (timePart) {
            const parts = timePart.split(":");
            const hh = Number(parts[0]);
            const min = Number(parts[1]);
            if (hh === 0 && min === 0) {
              hora = "Horario a confirmar";
            } else {
              hora = parts.slice(0, 2).join(":") + "hs";
            }
          }
        }

        const dateOfWeek = getDayOfWeekLocal(d.fecha);
        const diaStr = dateOfWeek === 0 ? "Domingo" : "Sábado";

        let statusLabel = "Pendiente a completar";
        let statusClass = "badge-amber";

        if (d.estadoDesignacion === 1) {
          statusLabel = "Completa";
          statusClass = "badge-green";
        } else if (d.estadoDesignacion === 2) {
          statusLabel = "Jornada finalizada";
          statusClass = "badge-blue";
        } else if (d.estadoDesignacion === 3) {
          statusLabel = "Cancelada";
          statusClass = "badge-red";
        } else if (d.estadoDesignacion === 4) {
          statusLabel = "Suspendida en juego";
          statusClass = "badge-purple";
        }

        matches.push({
          id: `${id}-${arb.idArbitro || arb.id}`,
          refereeName: `${arb.nombre} ${arb.apellido}`,
          canchaName,
          fechaFormateada: `${diaStr} · ${hora}`,
          rol: arb.rol || "Árbitro",
          statusLabel,
          statusClass,
        });
      }
    });
  });

  return matches;
});
</script>
