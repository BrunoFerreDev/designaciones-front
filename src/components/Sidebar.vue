<template>
  <div class="max-h-[99dvh] flex flex-col shrink-0">
    <!-- ========================================== -->
    <!-- DESKTOP SIDEBAR (Pantallas >= 768px)       -->
    <!-- ========================================== -->
    <aside
      class="desktop-sidebar hidden md:flex flex-col w-57.5 -3 h-full bg-[#f8fafc] border-r border-slate-200/80 select-none shrink-0 relative z-30"
    >
      <!-- Brand Header -->
      <div
        class="px-10 py-15 border-b border-slate-200/70 flex items-center gap-3 shrink-0"
      >
        <div
          class="w-19 h-19 rounded-lg flex items-center justify-center text-2xl text-slate-800 shrink-0"
        >
          ⚽
        </div>
        <div>
          <div
            class="font-bold text-slate-800 text-base leading-tight tracking-tight"
          >
            ArbDesig
          </div>
          <div class="text-xs text-slate-500 font-normal mt-0.5">
            Fútbol · Árbitros
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 flex flex-col gap-4 py-4 px-4 custom-light-scrollbar">
        <router-link
          v-for="nav in navItems"
          :key="nav.id"
          :to="nav.path"
          class="desktop-nav-link flex items-center gap-2.5 h-8 rounded-lg text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors group font-normal"
          active-class="desktop-nav-link-active"
        >
          <i
            :class="[
              'ti',
              nav.icon,
              'text-lg text-slate-400 group-hover:text-slate-600 transition-colors nav-icon shrink-0',
            ]"
            aria-hidden="true"
          ></i>
          <span class="truncate">{{ nav.label }}</span>
        </router-link>
      </div>

      <!-- Footer: Logout (Always pinned at the bottom) -->
      <div
        class="mt-auto p-4 border-t border-slate-200/80 bg-[#f8fafc] shrink-0"
      >
        <button
          type="button"
          @click="handleLogout"
          class="w-full flex items-center h-8 gap-3 px-3 py-2.5 text-[13px] text-slate-600 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-colors cursor-pointer group"
        >
          <i
            class="ti ti-logout text-lg text-slate-400 group-hover:text-red-600 transition-colors"
            aria-hidden="true"
          ></i>
          <span class="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <!-- ========================================== -->
    <!-- MOBILE BOTTOM NAVIGATION (Pantallas < 768px) -->
    <!-- ========================================== -->
    <nav
      class="mobile-bottom-nav fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around gap-4 z-40 md:hidden px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
    >
      <!-- 4 Primary Links -->
      <router-link
        v-for="item in primaryNavItems"
        :key="item.id"
        :to="item.path"
        class="mobile-bottom-item flex-1 flex flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-800 transition-colors relative"
        active-class="mobile-bottom-item-active"
      >
        <i :class="['ti', item.icon, 'text-xl mb-0.5']" aria-hidden="true"></i>
        <span class="text-[10px] font-medium leading-none">{{
          item.label
        }}</span>
      </router-link>

      <!-- 5th Item: Menu Drawer Trigger -->
      <button
        type="button"
        @click="isDrawerOpen = true"
        :class="[
          'mobile-bottom-item flex-1 flex flex-col items-center justify-center py-1 transition-colors relative cursor-pointer',
          isSecondaryRouteActive || isDrawerOpen
            ? 'mobile-bottom-item-active'
            : 'text-slate-500 hover:text-slate-800',
        ]"
      >
        <div class="relative">
          <i class="ti ti-menu-2 text-xl mb-0.5" aria-hidden="true"></i>
          <span
            v-if="isSecondaryRouteActive"
            class="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#0f6e56] ring-2 ring-white"
          ></span>
        </div>
        <span class="text-[10px] font-medium leading-none">Menú</span>
      </button>
    </nav>

    <!-- ========================================== -->
    <!-- MOBILE OFF-CANVAS DRAWER (Pantallas < 768px) -->
    <!-- ========================================== -->
    <teleport to="body">
      <div>
        <!-- Backdrop Overlay -->
        <transition name="fade-backdrop">
          <div
            v-if="isDrawerOpen"
            class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 md:hidden"
            @click="isDrawerOpen = false"
            aria-hidden="true"
          ></div>
        </transition>

        <!-- Slide-out Drawer Panel -->
        <transition name="slide-drawer">
          <div
            v-if="isDrawerOpen"
            class="mobile-drawer fixed inset-y-0 left-0 pr-3 w-72 max-w-[85vw] bg-[#f8fafc] text-slate-800 z-50 flex flex-col shadow-2xl border-r border-slate-200 md:hidden"
            role="dialog"
            aria-modal="true"
          >
            <!-- Drawer Header -->
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 bg-white shrink-0"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-16  rounded-lg flex items-center justify-center text-xl text-slate-800"
                >
                  ⚽
                </div>
                <div>
                  <div class="font-bold text-slate-800 text-sm leading-tight">
                    ArbDesig
                  </div>
                  <div class="text-[11px] text-slate-500 font-normal">
                    Fútbol · Árbitros
                  </div>
                </div>
              </div>

              <!-- Close Button -->
              <button
                type="button"
                @click="isDrawerOpen = false"
                class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Cerrar menú"
              >
                <i class="ti ti-x text-lg"></i>
              </button>
            </div>

            <!-- Drawer Navigation Items -->
            <div
              class="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-light-scrollbar"
            >
              <router-link
                v-for="nav in navItems"
                :key="nav.id"
                :to="nav.path"
                @click="isDrawerOpen = false"
                class="drawer-nav-link flex items-center gap-3.5 px-3.5 py-2.5 h-10 rounded-lg text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
                active-class="drawer-nav-link-active"
              >
                <i
                  :class="[
                    'ti',
                    nav.icon,
                    'text-lg text-slate-400 drawer-icon shrink-0',
                  ]"
                  aria-hidden="true"
                ></i>
                <span>{{ nav.label }}</span>
              </router-link>
            </div>

            <!-- Drawer Footer: Logout (Pinned to bottom of drawer) -->
            <div
              class="mt-auto p-4 border-t border-slate-200/80 bg-white shrink-0"
            >
              <button
                type="button"
                @click="handleLogout"
                class="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <i
                  class="ti ti-logout text-lg text-slate-400 group-hover:text-red-600"
                  aria-hidden="true"
                ></i>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { logoutUser } from "../store";

const route = useRoute();
const isDrawerOpen = ref(false);

// Full Navigation List with Icons matching the reference structure
const navItems = [
  { id: "dashboard", path: "/", icon: "ti-dashboard", label: "Resumen" },
  { id: "arbitros", path: "/arbitros", icon: "ti-users", label: "Árbitros" },
  { id: "canchas", path: "/canchas", icon: "ti-map-pin", label: "Canchas" },
  {
    id: "suspensiones",
    path: "/suspensiones",
    icon: "ti-ban",
    label: "Suspensiones",
  },
  {
    id: "designaciones",
    path: "/designaciones",
    icon: "ti-clipboard-list",
    label: "Designaciones",
  },
  { id: "buscar", path: "/buscar", icon: "ti-search", label: "Buscador" },
  {
    id: "estadisticas",
    path: "/estadisticas",
    icon: "ti-chart-bar",
    label: "Estadísticas",
  },
  {
    id: "comparador",
    path: "/comparador",
    icon: "ti-scale",
    label: "Comparador",
  },
  {
    id: "historico",
    path: "/designaciones-viejas",
    icon: "ti-history",
    label: "Historial",
  },
];

// 4 primary items shown in Mobile Bottom Bar
const primaryNavItems = [
  { id: "dashboard", path: "/", icon: "ti-dashboard", label: "Resumen" },
  { id: "arbitros", path: "/arbitros", icon: "ti-users", label: "Árbitros" },
  { id: "canchas", path: "/canchas", icon: "ti-map-pin", label: "Canchas" },
  {
    id: "designaciones",
    path: "/designaciones",
    icon: "ti-clipboard-list",
    label: "Designaciones",
  },
];

// Secondary items to highlight Menu if active
const secondaryNavPaths = [
  "/suspensiones",
  "/buscar",
  "/estadisticas",
  "/comparador",
  "/designaciones-viejas",
];

const isSecondaryRouteActive = computed(() => {
  return secondaryNavPaths.some(
    (p) => route.path === p || route.path.startsWith(p + "/"),
  );
});

// Auto-close drawer on route change
watch(
  () => route.path,
  () => {
    isDrawerOpen.value = false;
  },
);

// Lock background scroll when drawer is open
watch(isDrawerOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});

// Close drawer with Escape key
const handleKeydown = (e) => {
  if (e.key === "Escape" && isDrawerOpen.value) {
    isDrawerOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});

const handleLogout = async () => {
  isDrawerOpen.value = false;
  await logoutUser();
};
</script>

<style scoped>
.desktop-sidebar {
  padding-left: 0.5rem;
}
/* Desktop Active Link - Clean Light Mode matching reference image */
.desktop-nav-link-active {
  background-color: #ffffff;
  color: #0f6e56 !important;
  font-weight: 600 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.desktop-nav-link-active .nav-icon {
  color: #0f6e56 !important;
}

/* Mobile Bottom Navigation Item Active */
.mobile-bottom-item-active {
  color: #0f6e56 !important;
  font-weight: 600;
}
.mobile-bottom-item-active::after {
  content: "";
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 2.5px;
  background-color: #0f6e56;
  border-radius: 0 0 4px 4px;
}

/* Mobile Drawer Link Active */
.drawer-nav-link-active {
  background-color: #ffffff;
  color: #0f6e56 !important;
  font-weight: 600 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.drawer-nav-link-active .drawer-icon {
  color: #0f6e56 !important;
}

/* Transitions for Mobile Drawer */
.fade-backdrop-enter-active,
.fade-backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.fade-backdrop-enter-from,
.fade-backdrop-leave-to {
  opacity: 0;
}

.slide-drawer-enter-active,
.slide-drawer-leave-active {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-drawer-enter-from,
.slide-drawer-leave-to {
  transform: translateX(-100%);
}

/* Subtle Light Scrollbar */
.custom-light-scrollbar::-webkit-scrollbar {
  width: 14px;
}
.custom-light-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-light-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-light-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
