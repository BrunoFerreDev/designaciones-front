<template>
  <div class="modal" @click.stop>
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

    <!-- Ver Suspensión -->
    <ModalVerSuspencion v-if="state.modal.type === 'viewSuspension'" />

    <!-- Editar Designación -->
    <ModalEditDesignacion v-if="state.modal.type === 'editDesignacion'" />

    <!-- Actualizar Montos de Aranceles -->
    <ModalUpdateFees v-if="state.modal.type === 'updateFees'" />
  </div>
</template>

<script setup>
import { state } from "../store"
import ModalCanchaForm from "./ModalCanchaForm.vue"
import ModalArbitroForm from "./ModalArbitroForm.vue"
import DesignacionWizard from "./DesignacionWizard.vue"
import ModalGestionarArbitros from "./ModalGestionarArbitros.vue"
import ModalGestionarArbitrosViejas from "./ModalGestionarArbitrosViejas.vue"
import ModalWhatsapp from "./ModalWhatsapp.vue"
import ModalVerSuspencion from "./ModalVerSuspencion.vue"
import ModalEditDesignacion from "./ModalEditDesignacion.vue"
import ModalUpdateFees from "./ModalUpdateFees.vue"
</script>
