<template>
  <div
    class="modal"
    :style="modalStyle"
    @click.stop
  >
    <!-- Formulario de Cancha (crear/editar) -->
    <ModalCanchaForm
      v-if="state.modal.type === 'addCancha' || state.modal.type === 'editCancha'"
    />

    <!-- Formulario de Árbitro -->
    <ModalArbitroForm
      v-if="state.modal.type === 'addArbitro' || state.modal.type === 'editArbitro'"
    />

    <!-- Wizard de Designación -->
    <DesignacionWizard v-if="state.modal.type === 'addDesignacion'" />

    <!-- Gestionar Árbitros -->
    <ModalGestionarArbitros v-if="state.modal.type === 'manageReferees'" />

    <!-- Gestionar Árbitros Viejas -->
    <ModalGestionarArbitrosViejas v-if="state.modal.type === 'manageRefereesViejas'" />

    <!-- Compartir WhatsApp -->
    <ModalWhatsapp v-if="state.modal.type === 'whatsappMessage'" />

    <!-- Ver Detalle de Designación -->
    <ModalDetalleDesignacion v-if="state.modal.type === 'viewDesignacion' || state.modal.type === 'detalleDesignacion'" />

    <!-- Ver Detalle de Suspensión -->
    <ModalVerSuspencion v-if="state.modal.type === 'viewSuspension' || state.modal.type === 'verSuspencion'" />

    <!-- Cambiar Estado de Designación -->
    <ModalCambiarEstado v-if="state.modal.type === 'changeStatus' || state.modal.type === 'cambiarEstado'" />

    <!-- Editar Designación -->
    <ModalEditDesignacion v-if="state.modal.type === 'editDesignacion'" />

    <!-- Resumen de Árbitros por Día -->
    <ModalArbitrosPorDia v-if="state.modal.type === 'arbitrosPorDia'" />

    <!-- Comparativa de Fines de Semana -->
    <ModalComparativaFinesDeSemana v-if="state.modal.type === 'comparativaWeekend'" />
  </div>
</template>

<script setup>
import { computed } from "vue"
import { state } from "../store"
import ModalCanchaForm from "./ModalCanchaForm.vue"
import ModalArbitroForm from "./ModalArbitroForm.vue"
import DesignacionWizard from "./DesignacionWizard.vue"
import ModalGestionarArbitros from "./ModalGestionarArbitros.vue"
import ModalGestionarArbitrosViejas from "./ModalGestionarArbitrosViejas.vue"
import ModalWhatsapp from "./ModalWhatsapp.vue"
import ModalVerSuspencion from "./ModalVerSuspencion.vue"
import ModalDetalleDesignacion from "./ModalDetalleDesignacion.vue"
import ModalCambiarEstado from "./ModalCambiarEstado.vue"
import ModalEditDesignacion from "./ModalEditDesignacion.vue"
import ModalArbitrosPorDia from "./ModalArbitrosPorDia.vue"
import ModalComparativaFinesDeSemana from "./ModalComparativaFinesDeSemana.vue"

const modalStyle = computed(() => {
  const type = state.modal?.type;
  const largeModals = [
    "addDesignacion",
    "manageReferees",
    "manageRefereesViejas",
    "arbitrosPorDia",
    "comparativaWeekend"
  ];
  if (largeModals.includes(type)) {
    return {
      width: "95vw",
      maxWidth: "1050px",
      maxHeight: "92vh"
    };
  }
  if (type === "viewDesignacion" || type === "detalleDesignacion") {
    return {
      width: "95vw",
      maxWidth: "680px",
      maxHeight: "90vh"
    };
  }
  if (type === "viewSuspension" || type === "verSuspencion") {
    return {
      width: "95vw",
      maxWidth: "560px",
      maxHeight: "90vh"
    };
  }
  return {
    width: "95vw",
    maxWidth: "500px",
    maxHeight: "90vh"
  };
});
</script>

