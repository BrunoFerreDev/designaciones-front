<template>
    <div class="app">
        <!-- Floating Hamburger Button on Mobile -->
        <button
            v-if="state.isAuthenticated"
            class="hamburger-btn"
            @click="isSidebarOpen = !isSidebarOpen"
            aria-label="Toggle Menu"
        >
            <i class="ti ti-menu-2"></i>
        </button>

        <!-- Backdrop Overlay for Mobile Sidebar Drawer -->
        <div
            v-if="state.isAuthenticated && isSidebarOpen"
            class="sidebar-backdrop"
            @click="isSidebarOpen = false"
        ></div>

        <Sidebar
            v-if="state.isAuthenticated"
            :is-open="isSidebarOpen"
            @close="isSidebarOpen = false"
        />
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

        <!-- Top Slim Progress Bar for background requests -->
        <TopProgressBar />

        <!-- Global API Loader Overlay -->
        <GlobalLoader v-if="state.loading" />
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import {
    state,
    closeModal,
    removeToast,
    logoutUser,
    connectNotifications,
    disconnectNotifications,
    ultimasDesignaciones,
    loadCanchas,
    loadArbitros,
} from "./store";
import Sidebar from "./components/Sidebar.vue";
import Modal from "./components/Modal.vue";
import GlobalLoader from "./components/GlobalLoader.vue";
import TopProgressBar from "./components/loaders/TopProgressBar.vue";

const isSidebarOpen = ref(false);
const route = useRoute();

watch(
    () => route.path,
    () => {
        isSidebarOpen.value = false;
    }
);

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

let sessionInterval = null;

onMounted(() => {
    // Inicializar session_start_time si el usuario ya está autenticado pero falta el timestamp
    if (state.isAuthenticated && !localStorage.getItem("session_start_time")) {
        localStorage.setItem("session_start_time", Date.now().toString());
    }

    if (state.isAuthenticated) {
        connectNotifications();
        ultimasDesignaciones().catch((err) => console.warn("Background prefetch designaciones failed", err));
        loadCanchas().catch((err) => console.warn("Background prefetch canchas failed", err));
        loadArbitros().catch((err) => console.warn("Background prefetch arbitros failed", err));
    }

    // Monitorear expiración de sesión cada 10 segundos
    sessionInterval = setInterval(() => {
        if (state.isAuthenticated) {
            const startTimeStr = localStorage.getItem("session_start_time");
            if (startTimeStr) {
                const startTime = parseInt(startTimeStr, 10);
                const elapsed = Date.now() - startTime;
                const timeoutLimit = 1.5 * 60 * 60 * 1000; // 1.5 horas en milisegundos

                if (elapsed >= timeoutLimit) {
                    // Guardar mensaje de advertencia para mostrar en la pantalla de login
                    localStorage.setItem(
                        "session_timeout_message",
                        "Tu sesión ha expirado automáticamente después de 1.5 horas por seguridad."
                    );
                    logoutUser();
                }
            } else {
                localStorage.setItem("session_start_time", Date.now().toString());
            }
        }
    }, 10000);
});

onUnmounted(() => {
    if (sessionInterval) {
        clearInterval(sessionInterval);
    }
    disconnectNotifications();
});
</script>

<style>
.login-main {
    margin-left: 0 !important;
    width: 100% !important;
    padding-bottom: 0 !important;
    height: 100vh;
}
</style>
