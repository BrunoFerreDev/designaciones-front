<template>
  <div
    v-if="susp"
    class="modal-card max-w-lg w-full mx-auto"
    style="
      border-radius: var(--border-radius-lg, 14px);
      overflow: hidden;
      background: white;
      box-shadow:
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 8px 10px -6px rgba(0, 0, 0, 0.1);
    "
  >
    <!-- Modal Header -->
    <div
      class="modal-header"
      :style="{
        background:
          susp.tipoSuspencion === 2 ? 'var(--color-status-error)' : '#ba7517',
        color: 'white',
        padding: '1.25rem 1.5rem 1rem 1.5rem',
        borderTopLeftRadius: 'var(--border-radius-lg)',
        borderTopRightRadius: 'var(--border-radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }"
    >
      <div style="display: flex; align-items: center; gap: 10px; color: white">
        <i
          :class="['ti', susp.tipoSuspencion === 2 ? 'ti-ban' : 'ti-alert']"
          style="font-size: 24px"
        ></i>
        <div>
          <h3
            style="margin: 0; font-size: 16px; font-weight: 600; color: white"
          >
            Detalle de la Medida Disciplinaria
          </h3>
          <span style="font-size: 11px; opacity: 0.9; color: white">
            {{
              susp.tipoSuspencion === 2
                ? "Suspensión Temporal"
                : "Llamado de Atención"
            }}
          </span>
        </div>
      </div>
      <button
        @click="closeModal"
        style="
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          display: inline-flex;
          border-radius: 50%;
        "
        onmouseover="this.style.background = 'rgba(255, 255, 255, 0.15)'"
        onmouseout="this.style.background = 'transparent'"
      >
        <i class="ti ti-x" style="font-size: 20px"></i>
      </button>
    </div>

    <!-- Modal Body -->
    <div
      class="modal-body"
      style="
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      "
    >
      <!-- Referee Info Header Card -->
      <div
        style="
          background: var(--color-background-secondary);
          border-radius: 10px;
          padding: 12px 16px;
          border: 0.5px solid var(--color-border-tertiary);
          display: flex;
          align-items: center;
          gap: 12px;
        "
      >
        <div
          class="arb-avatar"
          style="
            width: 40px;
            height: 40px;
            font-size: 14px;
            font-weight: bold;
            background: #e2e8f0;
            color: #475569;
          "
        >
          {{ getInitials(susp.arbitro) }}
        </div>
        <div style="flex: 1">
          <div
            style="
              font-weight: 600;
              font-size: 14px;
              color: var(--color-text-primary);
            "
          >
            {{ getArbitroName(susp.arbitro) }}
          </div>
          <div
            style="
              font-size: 11px;
              color: var(--color-text-secondary);
              display: flex;
              gap: 6px;
              align-items: center;
              margin-top: 2px;
            "
          >
            <span
              class="badge badge-gray"
              style="font-size: 9px; padding: 1px 5px"
              >{{ getArbitroCategory(susp.arbitro) }}</span
            >
            <span
              v-if="refereePhone"
              style="
                display: inline-flex;
                align-items: center;
                gap: 3px;
                color: #1e7e34;
              "
            >
              🟢 WhatsApp: {{ refereePhone }}
            </span>
          </div>
        </div>
      </div>

      <!-- Grid Details -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
        <!-- Tipo de Sanción -->
        <div
          style="
            background: #fafafa;
            border: 0.5px solid #eaeaea;
            border-radius: 8px;
            padding: 10px 12px;
          "
        >
          <span
            style="
              font-size: 10px;
              color: var(--color-text-secondary);
              display: block;
              margin-bottom: 2px;
            "
            >MEDIDA APLICADA</span
          >
          <span
            :class="[
              'badge',
              susp.tipoSuspencion === 2 ? 'badge-red' : 'badge-amber',
            ]"
            style="font-size: 11px; display: inline-block"
          >
            {{
              susp.tipoSuspencion === 2
                ? `🚫 Suspensión`
                : "⚠️ Llamado de Atención"
            }}
          </span>
        </div>

        <!-- Duración (sólo suspensión) -->
        <div
          style="
            background: #fafafa;
            border: 0.5px solid #eaeaea;
            border-radius: 8px;
            padding: 10px 12px;
          "
        >
          <span
            style="
              font-size: 10px;
              color: var(--color-text-secondary);
              display: block;
              margin-bottom: 2px;
            "
            >DURACIÓN</span
          >
          <span
            style="font-weight: 600; font-size: 12px"
            :style="{
              color: susp.tipoSuspencion === 2 ? '#a32d2d' : 'inherit',
            }"
          >
            {{
              susp.tipoSuspencion === 2
                ? `${susp.cantidadDias} días`
                : "No aplica"
            }}
          </span>
        </div>

        <!-- Fecha Incidente -->
        <div
          style="
            background: #fafafa;
            border: 0.5px solid #eaeaea;
            border-radius: 8px;
            padding: 10px 12px;
          "
        >
          <span
            style="
              font-size: 10px;
              color: var(--color-text-secondary);
              display: block;
              margin-bottom: 2px;
            "
            >FECHA DEL INCIDENTE</span
          >
          <span
            style="
              font-weight: 500;
              font-size: 12px;
              text-transform: capitalize;
            "
          >
            {{ formatFecha(susp.fechaIncidente?.split("T")[0]) }}
          </span>
        </div>

        <!-- Cancha -->
        <div
          style="
            background: #fafafa;
            border: 0.5px solid #eaeaea;
            border-radius: 8px;
            padding: 10px 12px;
          "
        >
          <span
            style="
              font-size: 10px;
              color: var(--color-text-secondary);
              display: block;
              margin-bottom: 2px;
            "
            >CANCHA</span
          >
          <span style="font-weight: 500; font-size: 12px">
            {{ susp.cancha?.nombreCancha || "—" }}
          </span>
        </div>
      </div>

      <!-- Vigencia (Solo para Suspensión) -->
      <div
        v-if="susp.tipoSuspencion === 2"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fafafa;
          border: 0.5px solid #eaeaea;
          border-radius: 8px;
          padding: 10px 12px;
        "
      >
        <div>
          <span
            style="
              font-size: 10px;
              color: var(--color-text-secondary);
              display: block;
              margin-bottom: 2px;
            "
            >PERÍODO DE VIGENCIA</span
          >
          <span style="font-size: 11px; font-weight: 500">
            Hasta el {{ formatFecha(susp.fechaFin?.split("T")[0]) }}
          </span>
        </div>
        <span
          :class="[
            'badge',
            isSuspensionActive(susp) ? 'badge-red' : 'badge-gray',
          ]"
          style="font-size: 11px"
        >
          {{ isSuspensionActive(susp) ? "Activa" : "Expirada" }}
        </span>
      </div>

      <!-- Motivo / Descripción -->
      <div
        style="
          background: #fafafa;
          border: 0.5px solid #eaeaea;
          border-radius: 8px;
          padding: 12px 14px;
        "
      >
        <span
          style="
            font-size: 10px;
            color: var(--color-text-secondary);
            display: block;
            margin-bottom: 4px;
          "
          >DESCRIPCIÓN DEL SUCESO</span
        >
        <p
          style="
            font-size: 12px;
            line-height: 1.5;
            color: var(--color-text-primary);
            margin: 0;
            white-space: pre-line;
            font-style: italic;
          "
        >
          "{{ susp.motivo }}"
        </p>
      </div>

      <!-- Actions Footer -->
      <div
        style="display: flex; gap: 10px; margin-top: 0.5rem; flex-wrap: wrap"
      >
        <!-- Delete Sanción -->
        <button
          class="btn danger"
          @click="handleDeleteClick"
          style="
            flex: 1;
            min-width: 120px;
            padding: 10px;
            display: inline-flex;
            justify-content: center;
            font-weight: 500;
            border-radius: var(--border-radius-md, 8px);
          "
        >
          <i class="ti ti-trash"></i>
          Revocar Sanción
        </button>

        <!-- Share WhatsApp -->
        <button
          class="btn primary"
          @click="shareOnWhatsApp"
          style="
            flex: 1.3;
            min-width: 150px;
            background: #25d366;
            border-color: #25d366;
            color: white;
            padding: 10px;
            display: inline-flex;
            justify-content: center;
            font-weight: 500;
            border-radius: var(--border-radius-md, 8px);
          "
          onmouseover="this.style.background = '#1ebd59'"
          onmouseout="this.style.background = '#25d366'"
        >
          <i class="ti ti-brand-whatsapp"></i>
          Compartir Notificación
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  state,
  closeModal,
  getArbitro,
  formatFecha,
  deleteSuspencion,
} from "../store";

// Obtener la suspensión correspondiente
const suspId = computed(() => state.modal?.id);
const susp = computed(() => {
  return state.suspensiones.find(
    (s) => (s.id || s.idSuspencion) === suspId.value,
  );
});

// Ayudantes de resolución de árbitros
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

const getCategoryLabel = (cat) => {
  const map = {
    ELITE: "Elite",
    AVANZADO: "Avanzado",
    INTERMEDIO: "Intermedio",
    EN_FORMACION: "En Formación",
    INCIAL: "Inicial",
  };
  return map[cat] || cat || "Inicial";
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

const getArbitroCategory = (arbitroProp) => {
  const arbId = getArbitroId(arbitroProp);
  const a = getArbitro(Number(arbId));
  if (a) return getCategoryLabel(a.categoria);
  if (typeof arbitroProp === "object") {
    return getCategoryLabel(arbitroProp.categoria);
  }
  return "";
};

const refereePhone = computed(() => {
  if (!susp.value) return "";
  const arbId = getArbitroId(susp.value.arbitro);
  const a = getArbitro(Number(arbId));
  return a ? a.whatsapp : "";
});

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

// Eliminar Sanción desde el Modal
const handleDeleteClick = async () => {
  if (!susp.value) return;
  const id = susp.value.id || susp.value.idSuspencion;
  try {
    await deleteSuspencion(id);
    closeModal();
  } catch (e) {
    console.error(e);
  }
};

// Compartir por WhatsApp
const shareOnWhatsApp = () => {
  if (!susp.value) return;

  const s = susp.value;
  const name = getArbitroName(s.arbitro);
  const typeText =
    s.tipoSuspencion === 2
      ? `🚫 *SUSPENSIÓN TEMPORAL DE ${s.cantidadDias} DÍAS*`
      : `⚠️ *LLAMADO DE ATENCIÓN*`;

  const dateFormatted = formatFecha(s.fechaIncidente?.split("T")[0]);
  const canchaText = s.cancha?.nombreCancha || "Ninguna";

  let text = `⚠️ *NOTIFICACIÓN DISCIPLINARIA*\n\n`;
  text += `Hola *${name}*,\n\n`;
  text += `Te notificamos que se ha registrado una medida disciplinaria en el sistema:\n\n`;
  text += `*Medida:* ${typeText}\n`;
  text += `*Fecha del incidente:* ${dateFormatted}\n`;
  text += `*Cancha:* ${canchaText}\n`;
  text += `*Motivo:* "${s.motivo}"\n\n`;

  if (s.tipoSuspencion === 2 && s.fechaFin) {
    const untilFormatted = formatFecha(s.fechaFin?.split("T")[0]);
    text += `*Inhabilitación vigente hasta:* ${untilFormatted}\n\n`;
  }

  text += `Por favor, ponte en contacto con la comisión si tienes alguna consulta.`;

  const phone = refereePhone.value
    ? refereePhone.value.replace(/[^0-9]/g, "")
    : "";
  const url = phone
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

  window.open(url, "_blank");
};
</script>
