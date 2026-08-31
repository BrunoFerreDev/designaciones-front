<template>
  <div class="modal-content">
    <div class="modal-title">
      {{ state.form.idArbitro ? "Editar árbitro" : "Nuevo árbitro" }}
    </div>

    <div class="form-group">
      <label class="form-label">Nombre</label>
      <input
        v-model="state.form.nombre"
        class="form-input"
        placeholder="Ej: Juan"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Apellido</label>
      <input
        v-model="state.form.apellido"
        class="form-input"
        placeholder="Ej: Pérez"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Whatsapp</label>
      <input
        v-model="state.form.whatsapp"
        class="form-input"
        placeholder="Ej: +54 9 1123456789"
        type="tel"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Categoría</label>
      <select v-model="state.form.categoria" class="form-input">
        <option value="AVANZADO">Avanzado</option>
        <option value="INTERMEDIO">Intermedio</option>
        <option value="PRINCIPAL_1">Principal 1</option>
        <option value="PRINCIPAL_2">Principal 2</option>
        <option value="PRINCIPAL_3">Principal 3</option>
        <option value="PRINCIPAL_4">Principal 4</option>
        <option value="INICIAL">Inicial</option>
        <option value="ASISTENTE">Asistente</option>
      </select>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
      <div class="form-group">
        <label class="form-label">Talle Camiseta</label>
        <select v-model="state.form.talleCamiseta" class="form-input">
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="XXL">XXL</option>
          <option value="XXXL">XXXL</option>
          <option value="X">X (Estándar)</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Talle Short</label>
        <select v-model="state.form.talleShort" class="form-input">
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="XXL">XXL</option>
          <option value="XXXL">XXXL</option>
          <option value="X">X (Estándar)</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Estado en el Sistema</label>
      <label class="checkbox-label">
        <input
          :checked="state.form.estadoSistema !== false && state.form.estado !== false"
          @change="state.form.estadoSistema = $event.target.checked; state.form.estado = $event.target.checked"
          type="checkbox"
        />
        Habilitado (Activo para designación)
      </label>
    </div>

    <div class="form-group">
      <label class="form-label">Disponibilidad por Día</label>
      <div style="display: flex; gap: 20px; align-items: center; margin-top: 6px;">
        <label class="checkbox-label" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <input v-model="state.form.disponibleSabado" type="checkbox" />
          Sábado
        </label>
        <label class="checkbox-label" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <input v-model="state.form.disponibleDomingo" type="checkbox" />
          Domingo
        </label>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn" @click="closeModal">Cancelar</button>
      <button class="btn primary" @click="saveArbitro">
        {{ state.form.idArbitro ? "Guardar cambios" : "Agregar árbitro" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { state, closeModal, saveArbitro, ROLES_ARB } from "../store";
</script>
