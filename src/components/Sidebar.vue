<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">⚽</div>
      <div>
        <div class="logo-text">ArbDesig</div>
        <div class="logo-sub">Fútbol · Árbitros</div>
      </div>
    </div>
    
    <button 
      v-for="nav in navItems" 
      :key="nav.id"
      :class="['nav-item', { active: state.view === nav.id }]"
      @click="setView(nav.id)"
    >
      <i :class="['ti', nav.icon]" aria-hidden="true"></i>{{ nav.label }}
    </button>
  </div>
</template>

<script setup>
import { state, setView } from '../store'

const navItems = [
  { id:'dashboard', icon:'ti-dashboard', label:'Resumen' },
  { id:'canchas', icon:'ti-map-pin', label:'Canchas' },
  { id:'arbitros', icon:'ti-users', label:'Árbitros' },
  { id:'designaciones', icon:'ti-clipboard-list', label:'Designaciones' },
  { id:'buscar', icon:'ti-search', label:'Buscador' },
]
</script>