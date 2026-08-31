<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem">
    <!-- Modal Header -->
    <ModalComparativaHeader />

    <!-- Loading state -->
    <div
      v-if="loading"
      style="
        text-align: center;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      "
    >
      <div
        class="loader"
        style="
          width: 36px;
          height: 36px;
          border: 3px solid var(--color-border-tertiary);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        "
      ></div>
      <span style="font-size: 13px; color: var(--color-text-secondary)"
        >Consultando designaciones históricas y actuales...</span
      >
    </div>

    <div v-else style="display: flex; flex-direction: column; gap: 1.5rem">
      <!-- Summary metrics cards -->
      <ModalComparativaSummary
        :repiten-ambos-count="repitenAmbosSabDom.length"
        :repiten-sabado-count="repitenSabado.length"
        :repiten-domingo-count="repitenDomingo.length"
        :solo-finde-pasado-count="soloFindePasado.length"
        :solo-este-finde-count="soloEsteFinde.length"
      />

      <!-- Navigation tabs and active list panel -->
      <ModalComparativaList
        v-model:active-tab="activeTab"
        :tabs="tabs"
        :current-list="currentList"
      />
    </div>

    <!-- Modal Footer -->
    <div
      class="modal-footer"
      style="
        border-top: 1px solid var(--color-border-tertiary);
        padding-top: 1rem;
        margin-top: 0;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      "
    >
      <button
        class="btn"
        @click="printReport"
        style="
          padding: 8px 16px;
          font-size: 13px;
          border-color: var(--color-primary);
          color: var(--color-primary);
          background: transparent;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          border-radius: var(--border-radius-md, 8px);
        "
        onmouseover="
          this.style.background = 'var(--color-background-secondary)'
        "
        onmouseout="this.style.background = 'transparent'"
      >
        <i class="ti ti-printer"></i>
        Imprimir Reporte
      </button>
      <button
        class="btn"
        @click="closeModal"
        style="padding: 8px 16px; font-size: 13px"
      >
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
  getLocalDateString,
  getCancha,
  loadArbitrosDesignados,
  loadArbitros,
  isArbitroActivo,
} from "../store";
import designacionService from "../services/designacionService";
import ModalComparativaHeader from "./ModalComparativaHeader.vue";
import ModalComparativaSummary from "./ModalComparativaSummary.vue";
import ModalComparativaList from "./ModalComparativaList.vue";
import { printComparativaReport } from "../services/printComparativaService";

const loading = ref(false);
const activeTab = ref("repitentesSabDom");

const designacionesLast = ref([]);
const designacionesThis = ref([]);

// Helper to get dates dynamically relative to today
const getWeekendDates = (offsetWeeks = 0) => {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -1 : 6 - day;

  const saturdayDate = new Date(today);
  saturdayDate.setDate(today.getDate() + diff + offsetWeeks * 7);

  const sundayDate = new Date(saturdayDate);
  sundayDate.setDate(saturdayDate.getDate() + 1);

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return {
    saturday: formatDate(saturdayDate),
    sunday: formatDate(sundayDate),
  };
};

onMounted(async () => {
  loading.value = true;
  try {
    if (state.arbitros.length === 0) {
      await loadArbitros();
    }

    const datesLast = getWeekendDates(-1);
    const datesThis = getWeekendDates(0);

    const nextDayOfThisSunday = new Date(datesThis.sunday + "T12:00:00");
    nextDayOfThisSunday.setDate(nextDayOfThisSunday.getDate() + 1);
    const formatDate = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };
    const queryEndDate = formatDate(nextDayOfThisSunday);

    const res = await designacionService.buscarPorRango(
      datesLast.saturday,
      queryEndDate,
    );
    const allList = Array.isArray(res) ? res : res.data || [];

    const activeList = allList.filter(
      (d) => d.estadoDesignacion !== 3 && d.estado !== 3,
    );

    designacionesLast.value = activeList.filter((d) => {
      const dateStr = getLocalDateString(d.fecha);
      return dateStr >= datesLast.saturday && dateStr <= datesLast.sunday;
    });

    designacionesThis.value = activeList.filter((d) => {
      const dateStr = getLocalDateString(d.fecha);
      return dateStr >= datesThis.saturday && dateStr <= datesThis.sunday;
    });

    const promises = activeList.map(async (d) => {
      const id = d.idDesignacion || d.id;
      if (!state.arbitrosDesignadosMap[id]) {
        await loadArbitrosDesignados(id);
      }
    });
    await Promise.all(promises);
  } catch (e) {
    console.warn("Error loading comparative weekend data", e);
  } finally {
    loading.value = false;
  }
});

const comparativeResumen = computed(() => {
  const result = {};

  state.arbitros
    .filter(isArbitroActivo)
    .forEach((arb) => {
      const arbId = arb.idArbitro || arb.id;
      if (!arbId) return;

    result[arbId] = {
      idArbitro: arbId,
      nombre: arb.nombre || "",
      apellido: arb.apellido || "",
      rol: arb.rol || "Árbitro",
      categoria: arb.categoria || "INICIAL",
      lastSaturday: [],
      lastSunday: [],
      thisSaturday: [],
      thisSunday: [],
    };
  });

  const mapDesignations = (designaciones, isLast) => {
    designaciones.forEach((d) => {
      const id = d.idDesignacion || d.id;
      const assigned = state.arbitrosDesignadosMap[id] || [];
      const dayOfWeek = getDayOfWeekLocal(d.fecha);
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;

      const canchaId =
        d.idCancha || d.canchaId || d.cancha?.idCancha || d.cancha?.id;
      const canchaObj = canchaId ? getCancha(canchaId) : null;
      const canchaNombre =
        d.cancha?.nombreCancha ||
        d.cancha?.nombre ||
        canchaObj?.nombre ||
        "Cancha";

      let hora = "";
      if (d.fecha) {
        const timePart = d.fecha.includes("T")
          ? d.fecha.split("T")[1]
          : d.fecha.includes(" ")
            ? d.fecha.split(" ")[1]
            : "";
        if (timePart) {
          const parts = timePart.split(":");
          const hh = Number(parts[0]);
          const min = Number(parts[1]);
          hora =
            hh === 0 && min === 0
              ? "Horario a confirmar"
              : min === 0
                ? `${hh}hs`
                : `${parts[0]}:${parts[1]}hs`;
        }
      }

      assigned.forEach((asg) => {
        const arb = asg.arbitro;
        if (!arb) return;

        const arbId = arb.idArbitro || arb.id;
        if (!result[arbId]) return;

        const matchDetail = { id, cancha: canchaNombre, hora };

        if (isLast) {
          if (isSunday) {
            if (!result[arbId].lastSunday.some((m) => m.id === id)) {
              result[arbId].lastSunday.push(matchDetail);
            }
          } else if (isSaturday) {
            if (!result[arbId].lastSaturday.some((m) => m.id === id)) {
              result[arbId].lastSaturday.push(matchDetail);
            }
          }
        } else {
          if (isSunday) {
            if (!result[arbId].thisSunday.some((m) => m.id === id)) {
              result[arbId].thisSunday.push(matchDetail);
            }
          } else if (isSaturday) {
            if (!result[arbId].thisSaturday.some((m) => m.id === id)) {
              result[arbId].thisSaturday.push(matchDetail);
            }
          }
        }
      });
    });
  };

  mapDesignations(designacionesLast.value, true);
  mapDesignations(designacionesThis.value, false);

  return Object.values(result).map((arb) => {
    const lastWeekendCount = arb.lastSaturday.length + arb.lastSunday.length;
    const thisWeekendCount = arb.thisSaturday.length + arb.thisSunday.length;

    const isExtremeLoad =
      arb.lastSaturday.length > 0 &&
      arb.lastSunday.length > 0 &&
      arb.thisSaturday.length > 0 &&
      arb.thisSunday.length > 0;

    return {
      ...arb,
      lastWeekendCount,
      thisWeekendCount,
      isExtremeLoad,
    };
  });
});

const repitenAmbosSabDom = computed(() => {
  return comparativeResumen.value.filter((a) => a.isExtremeLoad);
});

const repitenSabado = computed(() => {
  return comparativeResumen.value.filter(
    (a) =>
      a.lastSaturday.length > 0 &&
      a.thisSaturday.length > 0 &&
      !a.isExtremeLoad,
  );
});

const repitenDomingo = computed(() => {
  return comparativeResumen.value.filter(
    (a) =>
      a.lastSunday.length > 0 && a.thisSunday.length > 0 && !a.isExtremeLoad,
  );
});

const soloFindePasado = computed(() => {
  return comparativeResumen.value.filter(
    (a) => a.lastWeekendCount > 0 && a.thisWeekendCount === 0,
  );
});

const soloEsteFinde = computed(() => {
  return comparativeResumen.value.filter(
    (a) => a.lastWeekendCount === 0 && a.thisWeekendCount > 0,
  );
});

const tabs = computed(() => [
  {
    id: "repitentesSabDom",
    label: "Repiten Sáb/Dom",
    count: repitenAmbosSabDom.value.length,
  },
  {
    id: "repitenSabado",
    label: "Repiten Sábado",
    count: repitenSabado.value.length,
  },
  {
    id: "repitenDomingo",
    label: "Repiten Domingo",
    count: repitenDomingo.value.length,
  },
  {
    id: "soloFindePasado",
    label: "Sólo Pasado",
    count: soloFindePasado.value.length,
  },
  {
    id: "soloEsteFinde",
    label: "Sólo Este",
    count: soloEsteFinde.value.length,
  },
]);

const currentList = computed(() => {
  if (activeTab.value === "repitentesSabDom") return repitenAmbosSabDom.value;
  if (activeTab.value === "repitenSabado") return repitenSabado.value;
  if (activeTab.value === "repitenDomingo") return repitenDomingo.value;
  if (activeTab.value === "soloFindePasado") return soloFindePasado.value;
  if (activeTab.value === "soloEsteFinde") return soloEsteFinde.value;
  return [];
});

const printReport = () => {
  printComparativaReport({
    datesLast: getWeekendDates(-1),
    datesThis: getWeekendDates(0),
    repitenAmbosSabDom: repitenAmbosSabDom.value,
    repitenSabado: repitenSabado.value,
    repitenDomingo: repitenDomingo.value,
    soloFindePasado: soloFindePasado.value,
    soloEsteFinde: soloEsteFinde.value,
  });
};
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.loader {
  display: inline-flex;
}
</style>
