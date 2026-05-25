<template>
  <div>
    <div class="topbar">
      <div>
        <div class="topbar-title">Canchas</div>
        <div class="topbar-sub">
          {{ state.canchas.length }} canchas registradas
        </div>
      </div>
      <button class="btn primary" @click="openModal('addCancha')">
        <i class="ti ti-plus"></i>Nueva cancha
      </button>
    </div>

    <div class="content">
      <div v-if="state.canchas.length === 0" class="empty-state">
        <div class="empty-icon">
          <i
            class="ti ti-map-pin"
            style="font-size: 36px; color: var(--color-text-secondary)"
          ></i>
        </div>
        No hay canchas registradas
      </div>
      <div v-else class="grid-2">
        <CanchaCard
          v-for="c in state.canchas"
          :key="c.id"
          :cancha="c"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { state, openModal } from "../store";
import CanchaCard from "../components/CanchaCard.vue";
</script>

