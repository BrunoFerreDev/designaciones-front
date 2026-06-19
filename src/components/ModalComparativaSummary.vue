<template>
  <div
    style="
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 10px;
    "
  >
    <div
      class="card"
      style="
        padding: 10px;
        border-left: 4px solid #ef4444;
        background: #fef2f2;
        border-radius: var(--border-radius-md, 8px);
      "
    >
      <div
        style="
          font-size: 9px;
          color: #991b1b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        "
      >
        Repiten Ambos Sáb/Dom
      </div>
      <div
        style="
          font-size: 20px;
          font-weight: 700;
          color: #991b1b;
          margin-top: 4px;
          line-height: 1;
        "
      >
        {{ repitenAmbosCount }}
      </div>
      <div style="font-size: 9px; color: #991b1b; margin-top: 2px">
        Alerta carga doble
      </div>
    </div>

    <div
      class="card"
      style="
        padding: 10px;
        border-left: 4px solid #0f6e56;
        background: #e6f9f4;
        border-radius: var(--border-radius-md, 8px);
      "
    >
      <div
        style="
          font-size: 9px;
          color: #0f6e56;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        "
      >
        Repiten Sábado
      </div>
      <div
        style="
          font-size: 20px;
          font-weight: 700;
          color: #0f6e56;
          margin-top: 4px;
          line-height: 1;
        "
      >
        {{ repitenSabadoCount }}
      </div>
      <div style="font-size: 9px; color: #0f6e56; margin-top: 2px">
        Sábado ambos findes
      </div>
    </div>

    <div
      class="card"
      style="
        padding: 10px;
        border-left: 4px solid #185fa5;
        background: #f0f7ff;
        border-radius: var(--border-radius-md, 8px);
      "
    >
      <div
        style="
          font-size: 9px;
          color: #185fa5;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        "
      >
        Repiten Domingo
      </div>
      <div
        style="
          font-size: 20px;
          font-weight: 700;
          color: #185fa5;
          margin-top: 4px;
          line-height: 1;
        "
      >
        {{ repitenDomingoCount }}
      </div>
      <div style="font-size: 9px; color: #185fa5; margin-top: 2px">
        Domingo ambos findes
      </div>
    </div>

    <div
      class="card"
      style="
        padding: 10px;
        border-left: 4px solid #3b82f6;
        background: #f0f7ff;
        border-radius: var(--border-radius-md, 8px);
      "
    >
      <div
        style="
          font-size: 9px;
          color: #1e3a8a;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        "
      >
        Sólo Finde Pasado
      </div>
      <div
        style="
          font-size: 20px;
          font-weight: 700;
          color: #1e3a8a;
          margin-top: 4px;
          line-height: 1;
        "
      >
        {{ soloFindePasadoCount }}
      </div>
      <div style="font-size: 9px; color: #1e3a8a; margin-top: 2px">
        No dirigen este finde
      </div>
    </div>

    <div
      class="card"
      style="
        padding: 10px;
        border-left: 4px solid #10b981;
        background: #ecfdf5;
        border-radius: var(--border-radius-md, 8px);
      "
    >
      <div
        style="
          font-size: 9px;
          color: #065f46;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        "
      >
        Sólo Este Finde
      </div>
      <div
        style="
          font-size: 20px;
          font-weight: 700;
          color: #065f46;
          margin-top: 4px;
          line-height: 1;
        "
      >
        {{ soloEsteFindeCount }}
      </div>
      <div style="font-size: 9px; color: #065f46; margin-top: 2px">
        No dirigieron el anterior
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  repitenAmbosCount: Number,
  repitenSabadoCount: Number,
  repitenDomingoCount: Number,
  soloFindePasadoCount: Number,
  soloEsteFindeCount: Number,
});
</script>
