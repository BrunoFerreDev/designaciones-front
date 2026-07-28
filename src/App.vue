<template>
    <div class="app">
        <Sidebar v-if="state.isAuthenticated" />
        <div :class="['main', { 'login-main': !state.isAuthenticated }]">
            <router-view />
        </div>
        <div v-if="state.modal" class="modal-overlay" @click.self="closeModal">
            <Modal />
        </div>

        <!-- Toasts Container -->
        <div class="toasts-container">
            <div
                v-for="toast in state.toasts"
                :key="toast.id"
                :class="['toast', `toast-${toast.type}`]"
                @click="removeToast(toast.id)"
            >
                <i :class="getToastIcon(toast.type)" class="toast-icon"></i>
                <span class="toast-message">{{ toast.message }}</span>
                <i class="ti ti-x toast-close"></i>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    state,
    closeModal,
    loadArbitros,
    loadArbitrosNoDisponibles,
    loadCanchas,
    loadSuspensiones,
    removeToast,
} from "./store";
import Sidebar from "./components/Sidebar.vue";
import Modal from "./components/Modal.vue";
import { onMounted, watch } from "vue";

const getToastIcon = (type) => {
    switch (type) {
        case "error":
            return "ti ti-alert-triangle";
        case "warning":
            return "ti ti-alert-circle";
        case "info":
            return "ti ti-info-circle";
        default:
            return "ti ti-circle-check";
    }
};

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
