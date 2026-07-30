import { reactive } from "vue";

export const ROLES_ARB = [
  "Árbitro Principal",
  "Árbitro Asistente 1",
  "Árbitro Asistente 2",
  "Cuarto Árbitro",
  "VAR",
  "Asistente VAR",
];

export const ROLE_COLORS = [
  "#1D9E75",
  "#185FA5",
  "#BA7517",
  "#993C1D",
  "#534AB7",
  "#3B6D11",
];

export const state = reactive({
  canchas: [],
  arbitros: [],
  arbitrosNoDisponibles: [],
  designaciones: [],
  designacionesIncompletas: [],
  designacionesFinalizadas: [],
  designacionesAConfirmar: [],
  designacionesCanceladas: [],
  designacionesArbitros: [],
  toasts: [],
  loadingDesignaciones: false,
  loading: false,
  loadingTopBar: false,
  modal: null,
  nextCanchaId: 4,
  nextArbId: 9,
  nextDesId: 3,
  nextSuspId: 1,
  form: {},
  selectedArbitros: [],
  suspensiones: [],
  arbitrosDesignadosMap: {},
  isAuthenticated: !!localStorage.getItem("jwt_token"),
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("jwt_token") || null,
  notifications: JSON.parse(localStorage.getItem("notifications") || "[]"),
  sidebarNotifications: [],
});
