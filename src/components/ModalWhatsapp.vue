<template>
  <div class="modal-card max-w-xl w-full mx-auto" style="border-radius: var(--border-radius-lg, 14px); overflow: hidden; background: white; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);">
    <div class="modal-header" style="background: #25d366; color: white; padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <i class="ti ti-brand-whatsapp" style="font-size: 24px;"></i>
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Compartir Designaciones</h3>
          <span style="font-size: 11px; opacity: 0.9;">Mensaje formateado para enviar por WhatsApp</span>
        </div>
      </div>
      <button 
        @click="closeModal" 
        style="background: transparent; border: none; color: white; cursor: pointer; padding: 4px; display: inline-flex; border-radius: 50%;"
        onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'"
        onmouseout="this.style.background='transparent'"
      >
        <i class="ti ti-x" style="font-size: 20px;"></i>
      </button>
    </div>

    <div class="modal-body" style="padding: 1.5rem;">
      <div v-if="allRelevantDesignaciones.length === 0" class="empty-state" style="text-align: center; padding: 2rem 0;">
        <i class="ti ti-alert-circle" style="font-size: 48px; color: var(--color-text-secondary); margin-bottom: 1rem;"></i>
        <div style="font-weight: 600; color: var(--color-text-primary); margin-bottom: 0.5rem;">No hay designaciones para compartir</div>
        <div style="font-size: 13px; color: var(--color-text-secondary);">Asigna árbitros a tus partidos primero para poder generar el mensaje de WhatsApp.</div>
      </div>

      <div v-else>
        <!-- Selector de Día y Estado de Carga -->
        <div style="display: flex; gap: 8px; margin-bottom: 1rem;">
          <button
            v-for="opt in filterOptions"
            :key="opt.id"
            class="tab-btn"
            style="flex: 1; padding: 8px 12px; font-size: 12px; border-radius: 20px; transition: all 0.2s; border: 1.5px solid; cursor: pointer;"
            :style="{
              borderColor: filterDay === opt.id ? '#25d366' : 'var(--color-border-primary)',
              background: filterDay === opt.id ? '#e8f9f0' : 'transparent',
              color: filterDay === opt.id ? '#0f6e56' : 'var(--color-text-secondary)',
              fontWeight: filterDay === opt.id ? '600' : '500'
            }"
            @click="filterDay = opt.id"
          >
            {{ opt.label }}
          </button>
        </div>

        <!-- Barra de opciones y feedback de carga -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 8px;">
          <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-secondary); cursor: pointer; user-select: none;">
            <input 
              type="checkbox" 
              v-model="ocultarSinArbitros" 
              style="cursor: pointer; accent-color: #25d366;"
            />
            <span>Ocultar partidos sin árbitros</span>
          </label>

          <div style="display: flex; align-items: center; gap: 10px;">
            <span v-if="loadingReferees" style="font-size: 11px; color: #059669; display: inline-flex; align-items: center; gap: 4px;">
              <i class="ti ti-loader animate-spin" style="font-size: 13px;"></i>
              Actualizando árbitros...
            </span>

            <button 
              v-if="isUserEdited" 
              @click="resetManualEdit"
              class="btn text-xs"
              style="padding: 3px 8px; font-size: 11px; border-color: var(--color-border-secondary); color: var(--color-text-secondary);"
              title="Restaurar el texto generado automáticamente"
            >
              <i class="ti ti-refresh" style="margin-right: 3px;"></i>Restablecer original
            </button>
          </div>
        </div>

        <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px;">
          Podés editar el texto acá abajo antes de copiarlo o enviarlo:
        </div>

        <textarea
          v-model="messageText"
          @input="isUserEdited = true"
          style="
            width: 100%;
            height: 320px;
            padding: 1rem;
            border: 1px solid var(--color-border-primary);
            border-radius: var(--border-radius-md, 8px);
            font-family: monospace;
            font-size: 13px;
            line-height: 1.5;
            resize: none;
            background: #fafafa;
            color: #1f2937;
            outline: none;
            transition: border-color 0.15s;
          "
          onfocus="this.style.borderColor='#25d366'; this.style.boxShadow='0 0 0 2px rgba(37, 211, 102, 0.15)';"
          onblur="this.style.borderColor='var(--color-border-primary)'; this.style.boxShadow='none';"
        ></textarea>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 1.25rem; gap: 12px; flex-wrap: wrap;">
          <button 
            class="btn" 
            @click="copyToClipboard"
            :style="{
              borderColor: copied ? '#1d9e75' : 'var(--color-border-secondary)',
              color: copied ? '#1d9e75' : 'var(--color-text-primary)',
              background: copied ? '#e1f5ee' : 'transparent',
              flex: '1',
              justifyContent: 'center',
              fontWeight: '500'
            }"
            onmouseover="this.style.background=this.style.color==='#1d9e75' ? '#e1f5ee' : 'var(--color-background-secondary)'"
            onmouseout="this.style.background=this.style.color==='#1d9e75' ? '#e1f5ee' : 'transparent'"
          >
            <i class="ti" :class="copied ? 'ti-check' : 'ti-copy'"></i>
            {{ copied ? '¡Copiado!' : 'Copiar Mensaje' }}
          </button>

          <button 
            class="btn primary" 
            @click="sendWhatsApp"
            style="background: #25d366; border-color: #25d366; color: white; flex: '1.2'; justify-content: 'center'; font-weight: '500';"
            onmouseover="this.style.background='#1ebd59'"
            onmouseout="this.style.background='#25d366'"
          >
            <i class="ti ti-brand-whatsapp"></i>
            Enviar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { state, closeModal, getCancha, getArbitro, loadArbitrosDesignados } from "../store"

const isSpecificId = state.modal?.id && !['todos', 'sabado', 'domingo'].includes(state.modal?.id);
const filterDay = ref(state.modal?.id || "todos")
const ocultarSinArbitros = ref(false)
const isUserEdited = ref(false)
const loadingReferees = ref(false)

const filterOptions = computed(() => {
  if (isSpecificId) {
    return [
      { id: state.modal?.id, label: 'Esta Designación' },
      { id: 'todos', label: 'Todas' }
    ]
  }
  return [
    { id: 'todos', label: 'Todos' }, 
    { id: 'sabado', label: 'Sábados' }, 
    { id: 'domingo', label: 'Domingos' }
  ]
})

const messageText = ref("")
const copied = ref(false)

const diasSemana = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
]

const meses = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
]

const getAllDesignaciones = () => [
  ...state.designacionesIncompletas,
  ...state.designaciones,
  ...state.designacionesAConfirmar,
  ...state.designacionesFinalizadas,
  ...(state.designacionesAceptadas || []),
]

const allRelevantDesignaciones = computed(() => {
  const all = getAllDesignaciones()
  if (isSpecificId) {
    return all.filter(
      (d) => String(d.idDesignacion || d.id) === String(state.modal?.id)
    )
  }
  return all.filter((d) => d.estadoDesignacion === 1 || d.estado === 1 || d.estadoDesignacion === 3)
})

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

// Resolver árbitros asignados usando store map, objeto local o fallback a helpers
const getRefereesForDesignacion = (d) => {
  if (!d) return [];
  const id = d.idDesignacion || d.id;
  const list =
    state.arbitrosDesignadosMap[id] ||
    state.arbitrosDesignadosMap[String(id)] ||
    state.arbitrosDesignadosMap[Number(id)] ||
    d.arbitrosDesignados ||
    d.arbitros ||
    [];

  if (!Array.isArray(list)) return [];

  return list
    .map((item) => {
      if (!item) return null;
      let arb = item.arbitro || item;
      if (typeof arb === "number" || (typeof arb === "string" && !isNaN(Number(arb)))) {
        const found = getArbitro(Number(arb));
        if (found) arb = found;
      } else if (!arb.nombre && arb.idArbitro) {
        const found = getArbitro(arb.idArbitro);
        if (found) arb = { ...found, ...arb };
      }
      return arb;
    })
    .filter(Boolean);
};

// Carga asíncrona de árbitros faltantes para las designaciones a mostrar
const loadMissingArbitros = async (designacionesList) => {
  const missing = designacionesList.filter((d) => {
    const id = d.idDesignacion || d.id;
    if (!id) return false;
    const existing =
      state.arbitrosDesignadosMap[id] ||
      state.arbitrosDesignadosMap[String(id)] ||
      state.arbitrosDesignadosMap[Number(id)] ||
      (d.arbitrosDesignados && d.arbitrosDesignados.length > 0);
    return !existing || existing.length === 0;
  });

  if (missing.length === 0) return;

  loadingReferees.value = true;
  try {
    await Promise.all(
      missing.map((d) => loadArbitrosDesignados(d.idDesignacion || d.id))
    );
  } catch (err) {
    console.warn("Error cargando árbitros en ModalWhatsapp:", err);
  } finally {
    loadingReferees.value = false;
    if (!isUserEdited.value) {
      generateMessage();
    }
  }
};

const getFilteredList = () => {
  const all = getAllDesignaciones()
  let list = []

  if (isSpecificId && filterDay.value !== 'todos') {
    list = all.filter(
      (d) => String(d.idDesignacion || d.id) === String(filterDay.value)
    )
  } else {
    list = all.filter(
      (d) => d.estadoDesignacion === 1 || d.estado === 1 || d.estadoDesignacion === 3
    )
    if (filterDay.value === "sabado") {
      list = list.filter((d) => getDayOfWeek(d.fecha) !== 0)
    } else if (filterDay.value === "domingo") {
      list = list.filter((d) => getDayOfWeek(d.fecha) === 0)
    }
  }

  // Filtrar vacíos si la opción está activa
  if (ocultarSinArbitros.value) {
    list = list.filter((d) => {
      const refs = getRefereesForDesignacion(d)
      return refs.length > 0
    })
  }

  return list
}

const generateMessage = () => {
  const list = getFilteredList()

  if (list.length === 0) {
    messageText.value = `📋 *DESIGNACIONES DE ÁRBITROS*\n\n_No hay designaciones ${
      ocultarSinArbitros.value ? "con árbitros asignados " : ""
    }para el día seleccionado_`
    return
  }

  const groups = {}
  
  list.forEach((d) => {
    if (!d.fecha) return
    const datePart = d.fecha.split("T")[0]
    if (!groups[datePart]) {
      groups[datePart] = []
    }
    groups[datePart].push(d)
  })

  const sortedDates = Object.keys(groups).sort()
  let text = "📋 *DESIGNACIONES DE ÁRBITROS*\n\n"

  sortedDates.forEach((dateStr) => {
    const [yyyy, mm, dd] = dateStr.split("-").map(Number)
    const dateObj = new Date(yyyy, mm - 1, dd)
    const diaNombre = diasSemana[dateObj.getDay()]
    const mesNombre = meses[mm - 1]

    text += `*${diaNombre} ${dd} de ${mesNombre}:*\n`

    // Ordenar designaciones por horario de inicio
    const dayDesignations = groups[dateStr].sort((a, b) => {
      const timeA = a.fecha && a.fecha.includes("T") ? a.fecha.split("T")[1] : ""
      const timeB = b.fecha && b.fecha.includes("T") ? b.fecha.split("T")[1] : ""
      return timeA.localeCompare(timeB)
    })

    dayDesignations.forEach((d) => {
      const canchaNombre =
        d.cancha?.nombreCancha ||
        d.cancha?.nombre ||
        getCancha(d.idCancha || d.canchaId)?.nombre ||
        "Cancha Desconocida"

      let timeFormatted = ""
      let hasConfirmar = false
      if (d.fecha && d.fecha.includes("T")) {
        const timePart = d.fecha.split("T")[1]
        const [hh, min] = timePart.split(":")
        if (Number(hh) === 0 && Number(min) === 0) {
          hasConfirmar = true
        } else {
          timeFormatted =
            Number(min) === 0 ? `${parseInt(hh)}hs` : `${hh}:${min}hs`
        }
      }

      text += `  🏟️ *${canchaNombre}*${
        hasConfirmar
          ? ", Horario a confirmar"
          : timeFormatted ? `, horario de inicio ${timeFormatted}` : ""
      }\n`

      // Árbitros designados
      const arbitros = getRefereesForDesignacion(d)
      if (arbitros.length > 0) {
        arbitros.forEach((arb) => {
          const nombre = (arb.nombre || "").trim()
          const apellido = (arb.apellido || "").trim()
          const nombreCompleto = `${nombre} ${apellido}`.trim() || arb.nombreCompleto || "Árbitro"
          const normalized = nombreCompleto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
          const isHectorMendoza = normalized === "hector mendoza"
          const rol = isHectorMendoza ? "Chofer" : (arb.rol || "Árbitro")
          const emoji = isHectorMendoza ? "🚗" : "👤"
          text += `    • ${emoji} ${nombreCompleto} - *${rol}*\n`
        })
      } else {
        text += `    • _Sin árbitros asignados_\n`
      }
      text += "\n"
    })
  })

  // Quitar el último salto de línea innecesario
  messageText.value = text.trim()
}

const resetManualEdit = () => {
  isUserEdited.value = false
  generateMessage()
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(messageText.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error("Error al copiar al portapapeles:", err)
    alert("No se pudo copiar automáticamente. Podés seleccionarlo manualmente.")
  }
}

const sendWhatsApp = () => {
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText.value)}`
  window.open(url, "_blank")
}

const refreshAndPreload = async () => {
  generateMessage()
  const list = getFilteredList()
  await loadMissingArbitros(list)
}

watch(filterDay, () => {
  isUserEdited.value = false
  refreshAndPreload()
})

watch(ocultarSinArbitros, () => {
  if (!isUserEdited.value) {
    generateMessage()
  }
})

watch(
  () => state.arbitrosDesignadosMap,
  () => {
    if (!isUserEdited.value && !loadingReferees.value) {
      generateMessage()
    }
  },
  { deep: true }
)

onMounted(() => {
  refreshAndPreload()
})
</script>
