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
        <div v-for="c in state.canchas" :key="c.id" class="card">
          <div class="card-header">
            <div>
              <div class="card-title">🏟️ {{ c.nombre }}</div>
            </div>
            <div style="display: flex; gap: 6px">
              <button
                class="btn"
                @click="openModal('editCancha', c.id)"
                style="padding: 5px 9px"
              >
                <i class="ti ti-edit"></i>
              </button>
              <button
                class="btn danger"
                @click="deleteCancha(c.id)"
                style="padding: 5px 9px"
              >
                <i class="ti ti-trash"></i>
              </button>
            </div>
          </div>

          <div
            style="
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 10px;
            "
          >
            <span style="font-size: 12px; color: var(--color-text-secondary)"
              >Categoría: {{ c.categoria || "N/A" }}</span
            >
            <span
              :style="{
                fontWeight: 500,
                color: c.fueraDeJuego ? '#993C1D' : '#185FA5',
                fontSize: '12px',
              }"
              >Fuera de juego: {{ c.fueraDeJuego ? "Sí" : "No" }}</span
            >
          </div>

          <div
            style="
              font-size: 12px;
              background: var(--color-background-secondary);
              border-radius: 8px;
              padding: 8px 12px;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <span style="color: var(--color-text-secondary)"
              >Estado: {{ c.estado ? "Activa" : "Inactiva" }}</span
            >
          </div>

          <!-- <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <span
              :style="{
                fontSize: '12px',
                color: isOk(c) ? '#0F6E56' : '#993C1D',
              }"
            >
              <i
                :class="['ti', isOk(c) ? 'ti-check' : 'ti-x']"
                style="font-size: 12px"
              ></i>
              {{
                isOk(c)
                  ? `Designación OK (${getArbCount(c)})`
                  : `Sin designación completa`
              }}
            </span>
            <button
              class="btn"
              @click="setView('designaciones')"
              style="font-size: 11px; padding: 4px 10px"
            >
              {{ hasDes(c) ? "Ver designación" : "Designar" }}
            </button>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  state,
  openModal,
  deleteCancha,
  calcStatus,
  minArbitros,
  setView,
} from "../store";

const getPct = (partidos) => Math.min(100, Math.round((partidos / 8) * 100));
const hasDes = (c) => state.designaciones.find((d) => d.canchaId === c.id);
const getArbCount = (c) => (hasDes(c) ? hasDes(c).arbitros.length : 0);
const isOk = (c) => {
  const des = hasDes(c);
  return des ? getArbCount(c) >= minArbitros(des.cantidadPartidos) : false;
};
</script>
