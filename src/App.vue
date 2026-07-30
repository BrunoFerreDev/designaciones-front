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

        <!-- Global API Loader Overlay -->
        <GlobalLoader v-if="state.loading" />
    </div>
</template>

<script setup>
import {
    state,
    closeModal,
    removeToast,
} from "./store";
import Sidebar from "./components/Sidebar.vue";
import Modal from "./components/Modal.vue";
import GlobalLoader from "./components/GlobalLoader.vue";

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


</script>

<style>
.login-main {
    margin-left: 0 !important;
    width: 100% !important;
    padding-bottom: 0 !important;
    height: 100vh;
}
</style>
