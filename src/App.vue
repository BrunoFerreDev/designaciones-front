<template>
  <div class="app">
    <Sidebar />
    <div class="main">
      <Dashboard v-if="state.view === 'dashboard'" />
      <Canchas v-else-if="state.view === 'canchas'" />
      <Arbitros v-else-if="state.view === 'arbitros'" />
      <Designaciones v-else-if="state.view === 'designaciones'" />
      <BuscarDesignaciones v-else-if="state.view === 'buscar'" />
    </div>
    <div v-if="state.modal" class="modal-overlay" @click.self="closeModal">
      <Modal />
    </div>
  </div>
</template>

<script setup>
import { state, closeModal, loadArbitros, loadCanchas } from "./store";
import Sidebar from "./components/Sidebar.vue";
import Dashboard from "./views/Dashboard.vue";
import Canchas from "./views/Canchas.vue";
import Arbitros from "./views/Arbitros.vue";
import Designaciones from "./views/Designaciones.vue";
import BuscarDesignaciones from "./views/BuscarDesignaciones.vue";
import Modal from "./components/Modal.vue";
import { onMounted } from 'vue'

onMounted(() => {
  // intentar cargar datos desde la API (si está disponible)
  loadArbitros()
  loadCanchas()
})
</script>
