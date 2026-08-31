<template>
  <div
    class="card"
    style="
      margin-bottom: 1.5rem;
      padding: 16px 20px;
      border-radius: var(--border-radius-lg);
    "
  >
    <div class="filters-grid">
      <div class="form-group" style="margin-bottom: 0">
        <label class="form-label" style="font-weight: 500; margin-bottom: 6px">
          Buscar por nombre o apellido
        </label>
        <div style="position: relative; display: flex; align-items: center">
          <input
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            class="form-input"
            placeholder="Ej: Alberto Gauto..."
            style="padding-left: 36px; height: 38px"
          />
          <i
            class="ti ti-search"
            style="
              position: absolute;
              left: 12px;
              color: var(--color-text-secondary);
              font-size: 16px;
            "
          ></i>
        </div>
      </div>

      <div class="form-group" style="margin-bottom: 0">
        <label class="form-label" style="font-weight: 500; margin-bottom: 6px">
          Categoría
        </label>
        <div style="display: flex; gap: 8px">
          <select
            :value="filterCategory"
            @change="$emit('update:filterCategory', $event.target.value)"
            class="form-input"
            style="height: 38px; flex: 1"
          >
            <option value="">Todas las categorías</option>
            <template v-for="cat in categorias" :key="cat">
              <option :value="cat">{{ cat }}</option>
            </template>
          </select>
          <button
            class="btn"
            style="
              height: 38px;
              padding: 0 12px;
              display: flex;
              align-items: center;
              gap: 6px;
              white-space: nowrap;
            "
            @click="$emit('toggle-sort')"
            :title="
              sortDirection === 'asc'
                ? 'Orden: Avanzado a Inicial'
                : 'Orden: Inicial a Avanzado'
            "
          >
            <i
              :class="
                sortDirection === 'asc'
                  ? 'ti ti-sort-ascending'
                  : 'ti ti-sort-descending'
              "
            ></i>
            {{
              sortDirection === "asc"
                ? "Avanzado → Inicial"
                : "Inicial → Asistente..."
            }}
          </button>
        </div>
      </div>

      <!-- Filtro por Estado (solo visible en Tab Todos) -->
      <div
        v-if="activeTab === 'todos'"
        class="form-group"
        style="margin-bottom: 0"
      >
        <label class="form-label" style="font-weight: 500; margin-bottom: 6px">
          Estado en sistema
        </label>
        <select
          :value="filterEstado"
          @change="$emit('update:filterEstado', $event.target.value)"
          class="form-input"
          style="height: 38px"
        >
          <option value="">Todos los estados</option>
          <option value="activos">Solo Habilitados</option>
          <option value="inactivos">Solo Deshabilitados</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: { type: String, default: "" },
  filterCategory: { type: String, default: "" },
  filterEstado: { type: String, default: "" },
  sortDirection: { type: String, default: "asc" },
  categorias: { type: Array, default: () => [] },
  activeTab: { type: String, default: "activos" },
});

defineEmits([
  "update:searchQuery",
  "update:filterCategory",
  "update:filterEstado",
  "toggle-sort",
]);
</script>

