import { state } from "./state";
import * as authService from "../services/authService";
import router from "../router";

export const loginUser = async (username, password) => {
  try {
    const response = await authService.login(username, password);

    if (response.status && response.jwt) {
      localStorage.setItem("jwt_token", response.jwt);
      localStorage.setItem(
        "user",
        JSON.stringify({ username: response.username }),
      );

      state.token = response.jwt;
      state.user = { username: response.username };
      state.isAuthenticated = true;

      router.push("/");
      return { success: true };
    } else {
      return {
        success: false,
        message: response.message || "Error en el inicio de sesión",
      };
    }
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Error al conectar con el servidor",
    };
  }
};

export const logoutUser = async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.clear();
    sessionStorage.clear();

    state.token = null;
    state.user = null;
    state.isAuthenticated = false;

    // Limpiar estado en memoria
    state.canchas = [];
    state.arbitros = [];
    state.arbitrosNoDisponibles = [];
    state.designaciones = [];
    state.designacionesIncompletas = [];
    state.designacionesFinalizadas = [];
    state.designacionesAConfirmar = [];
    state.designacionesAceptadas = [];
    state.designacionesSuspendidas = [];
    state.designacionesArbitros = [];
    state.arbitrosDesignadosMap = {};
    state.suspensiones = [];

    router.push("/login");
  }
};
