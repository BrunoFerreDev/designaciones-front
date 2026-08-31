<template>
  <div>
    <!-- Stats Row: Activos -->
    <div v-if="activeTab === 'activos'" class="stats-row five-cols">
      <div class="stat-card">
        <div class="stat-num stat-blue">{{ totalActivos }}</div>
        <div class="stat-label">Total Activos</div>
      </div>
      <div class="stat-card">
        <div class="stat-num stat-green">
          {{ disponiblesCountActivos }}
        </div>
        <div class="stat-label">Disponibles (Finde)</div>
      </div>
      <div class="stat-card">
        <div class="stat-num stat-red">
          {{ noDisponiblesCountActivos }}
        </div>
        <div class="stat-label">No disponibles</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: #185fa5">
          {{ disponiblesSabadoCountActivos }}
        </div>
        <div class="stat-label">Disponibles Sábado</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: #7e22ce">
          {{ disponiblesDomingoCountActivos }}
        </div>
        <div class="stat-label">Disponibles Domingo</div>
      </div>
    </div>

    <!-- Stats Row: Todos -->
    <div v-else class="stats-row five-cols">
      <div class="stat-card">
        <div class="stat-num stat-blue">{{ totalTodos }}</div>
        <div class="stat-label">Total en Sistema</div>
      </div>
      <div class="stat-card">
        <div class="stat-num stat-green">{{ totalActivos }}</div>
        <div class="stat-label">Árbitros Activos</div>
      </div>
      <div class="stat-card">
        <div class="stat-num stat-red">{{ totalInactivos }}</div>
        <div class="stat-label">Árbitros Inactivos</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: #185fa5">
          {{ disponiblesCountActivos }}
        </div>
        <div class="stat-label">Disponibles Finde</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: #16a34a">
          {{ conWhatsappCount }}
        </div>
        <div class="stat-label">Con WhatsApp</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeTab: { type: String, required: true },
  totalTodos: { type: Number, default: 0 },
  totalActivos: { type: Number, default: 0 },
  totalInactivos: { type: Number, default: 0 },
  conWhatsappCount: { type: Number, default: 0 },
  disponiblesCountActivos: { type: Number, default: 0 },
  noDisponiblesCountActivos: { type: Number, default: 0 },
  disponiblesSabadoCountActivos: { type: Number, default: 0 },
  disponiblesDomingoCountActivos: { type: Number, default: 0 },
});
</script>

