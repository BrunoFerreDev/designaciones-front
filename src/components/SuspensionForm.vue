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
          <i class="ti ti-alert" style="color: #ba7517; font-size: 18px"></i>
          Cargar Sanción / Advertencia
        </div>
        <div class="card-sub">Cargar un nuevo incidente según SuspencionDTO</div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- Selección de Árbitro -->
      <div class="form-group">
        <label class="form-label" style="font-weight: 500">Árbitro Seleccionado</label>
        <select
          v-model="form.arbitro"
          class="form-input"
          required
          style="height: 38px"
        >
          <option value="" disabled selected>Seleccione un árbitro...</option>
          <option
            v-for="a in state.arbitros.filter(isArbitroActivo)"
            :key="a.idArbitro"
            :value="a.idArbitro"
          >
            {{ a.apellido }}, {{ a.nombre }} ({{ getCategoryLabel(a.categoria) }})
          </option>
        </select>
      </div>

      <!-- Cancha del Incidente -->
      <div class="form-group">
        <label class="form-label" style="font-weight: 500">Cancha del Incidente</label>
        <select v-model="form.cancha" class="form-input" style="height: 38px">
          <option value="">Ninguna / No aplica</option>
          <option v-for="c in state.canchas" :key="c.id || c.idCancha" :value="c.id || c.idCancha">
            {{ c.nombre }} ({{ c.ciudad || "Sin ubicación" }})
          </option>
        </select>
      </div>

      <!-- Tipo de Sanción (1 = Llamado atencion, 2 = Suspencion) -->
      <div class="form-group">
        <label class="form-label" style="font-weight: 500">Tipo de Medida Disciplinaria</label>
        <div class="role-select" style="margin-top: 4px; margin-bottom: 8px">
          <button
            type="button"
            :class="['role-btn', { selected: form.tipoSuspencion === 1 }]"
            @click="form.tipoSuspencion = 1"
            style="flex: 1; padding: 8px 12px"
          >
            ⚠️ Llamado de Atención
          </button>
          <button
            type="button"
            :class="['role-btn', { selected: form.tipoSuspencion === 2 }]"
            @click="form.tipoSuspencion = 2"
            style="flex: 1; padding: 8px 12px"
          >
            🚫 Suspensión
          </button>
        </div>
      </div>

      <!-- Fecha del Incidente (fechaIncidente) -->
      <div class="form-group">
        <label class="form-label" style="font-weight: 500">Fecha y Hora del Incidente</label>
        <input
          v-model="form.fechaIncidente"
          type="date"
          class="form-input"
          required
          style="height: 38px"
        />
      </div>

      <!-- Cantidad de Días (Solo visible si tipoSuspencion === 2) -->
      <div v-if="form.tipoSuspencion === 2" class="form-group">
        <label class="form-label" style="font-weight: 500; color: #a32d2d">
          Duración de la Suspensión (Días)
        </label>
        <input
          v-model.number="form.cantidadDias"
          type="number"
          min="1"
          class="form-input"
          required
          placeholder="Ej: 7"
          style="height: 38px; border-color: #fcc; background: #fffdfd"
        />
        <span style="font-size: 11px; color: var(--color-text-secondary); margin-top: 4px; display: block;">
          * El árbitro cambiará a estado <strong>No Disponible</strong> de manera automática.
        </span>
      </div>

      <!-- Motivo de la sanción (motivo) -->
      <div class="form-group" style="margin-bottom: 20px">
        <label class="form-label" style="font-weight: 500">Motivo / Descripción del Suceso</label>
        <textarea
          v-model="form.motivo"
          class="form-input"
          rows="4"
          required
          placeholder="Escriba los detalles del incidente o el porqué del llamado de atención/suspensión..."
          style="resize: none; font-family: inherit"
        ></textarea>
      </div>

      <!-- Botones de Acción -->
      <div style="display: flex; gap: 8px; justify-content: flex-end">
        <button type="button" class="btn" @click="resetForm" style="padding: 9px 16px">
          Limpiar
        </button>
        <button type="submit" class="btn primary" style="padding: 9px 20px; font-weight: 500">
          <i class="ti ti-check"></i> Cargar Sanción
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import { state, saveSuspencion, isArbitroActivo } from "../store";

const form = reactive({
  arbitro: "",
  cancha: "",
  tipoSuspencion: 1, // 1 = Llamado atencion, 2 = Suspencion
  fechaIncidente: "",
  cantidadDias: 1,
  motivo: "",
});

const setDefaultDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  form.fechaIncidente = `${year}-${month}-${day}`;
};

onMounted(() => {
  setDefaultDate();
});

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

const resetForm = () => {
  form.arbitro = "";
  form.cancha = "";
  form.tipoSuspencion = 1;
  form.cantidadDias = 1;
  form.motivo = "";
  setDefaultDate();
};

const handleSubmit = async () => {
  if (!form.arbitro) {
    alert("Debe seleccionar un árbitro.");
    return;
  }

  let formattedFecha = form.fechaIncidente;
  if (formattedFecha && !formattedFecha.includes("T")) {
    formattedFecha = formattedFecha + "T00:00:00";
  } else if (
    formattedFecha &&
    formattedFecha.includes("T") &&
    formattedFecha.split(":").length === 2
  ) {
    formattedFecha = formattedFecha + ":00";
  }

  const dto = {
    fechaIncidente: formattedFecha,
    cantidadDias: form.tipoSuspencion === 2 ? parseInt(form.cantidadDias || 0) : 0,
    motivo: form.motivo.trim(),
    tipoSuspencion: parseInt(form.tipoSuspencion),
    arbitro: parseInt(form.arbitro),
    cancha: form.cancha ? parseInt(form.cancha) : null,
  };

  try {
    await saveSuspencion(dto);
    alert("Sanción registrada exitosamente.");
    resetForm();
  } catch (e) {
    console.error("Error al registrar sanción", e);
    alert("Se cargó localmente debido a una falla de conexión.");
    resetForm();
  }
};
</script>
