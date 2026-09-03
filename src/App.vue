<template>
  <div class="app">
    <Sidebar v-if="state.isAuthenticated" />
    <div :class="['main', { 'login-main': !state.isAuthenticated }]">
      <router-view />
    </div>
    <div v-if="state.modal" class="modal-overlay" @click.self="closeModal">
      <Modal />
    </div>
  </div>
  <Analytics />
</template>

<script setup>
import {
  state,
  closeModal,
  loadArbitros,
  loadArbitrosNoDisponibles,
  loadCanchas,
  loadSuspensiones,
} from "./store";
import Sidebar from "./components/Sidebar.vue";
import Modal from "./components/Modal.vue";
import { onMounted, watch } from "vue";
import { Analytics } from "@vercel/analytics/vue";
const loadData = () => {
  if (state.isAuthenticated) {
    loadArbitros();
    loadArbitrosNoDisponibles();
    loadCanchas();
    loadSuspensiones();
  }
};

onMounted(() => {
  loadData();
});

watch(
  () => state.isAuthenticated,
  (newVal) => {
    if (newVal) {
      loadData();
    }
  },
);
</script>

<style>
.login-main {
  margin-left: 0 !important;
  width: 100% !important;
  padding-bottom: 0 !important;
  height: 100vh;
}
</style>
