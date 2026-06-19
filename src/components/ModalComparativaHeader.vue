<template>
  <div
    style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-border-tertiary);
      padding-bottom: 1rem;
    "
  >
    <div style="display: flex; align-items: center; gap: 10px">
      <i
        class="ti ti-git-compare"
        style="font-size: 24px; color: var(--color-primary)"
      ></i>
      <div>
        <h3
          style="
            font-size: 16px;
            font-weight: 600;
            color: var(--color-text-primary);
            margin: 0;
          "
        >
          Comparativa de Fines de Semana
        </h3>
        <div
          style="
            font-size: 12px;
            color: var(--color-text-secondary);
            margin-top: 2px;
          "
        >
          Control de repetición (Fin de semana pasado vs Este fin de semana)
        </div>
      </div>
    </div>
    <button
      @click="closeModal"
      style="
        padding: 6px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      "
      onmouseover="
        this.style.background = 'var(--color-background-secondary)'
      "
      onmouseout="this.style.background = 'transparent'"
    >
      <i
        class="ti ti-x"
        style="font-size: 20px; color: var(--color-text-secondary)"
      ></i>
    </button>
  </div>
</template>

<script setup>
import { closeModal } from "../store";
</script>
