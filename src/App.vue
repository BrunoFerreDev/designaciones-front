<template>
  <div class="app">
    <Sidebar />
    <div class="main">
      <router-view />
    </div>
    <div v-if="state.modal" class="modal-overlay" @click.self="closeModal">
      <Modal />
    </div>
  </div>
</template>

<script setup>
import { state, closeModal, loadArbitros, loadArbitrosNoDisponibles, loadCanchas, loadSuspensiones } from "./store";
import Sidebar from "./components/Sidebar.vue";
import Modal from "./components/Modal.vue";
import { onMounted } from 'vue'

onMounted(() => {
  // intentar cargar datos desde la API (si está disponible)
  loadArbitros()
  loadArbitrosNoDisponibles()
  loadCanchas()
  loadSuspensiones()
})
</script>

