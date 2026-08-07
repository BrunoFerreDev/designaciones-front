import { state } from "./state";
import * as authService from "../services/authService";
import router from "../router";
import { connectNotifications, disconnectNotifications } from "./notifications";
import { ultimasDesignaciones } from "./designaciones/loader";
import { loadCanchas } from "./canchas";
import { loadArbitros } from "./arbitros";


export const loginUser = async (whatsapp, contrasenia) => {
  try {
    const response = await authService.login(whatsapp, contrasenia);

    if (response.status && response.jwt) {
      localStorage.setItem("jwt_token", response.jwt);
      localStorage.setItem(
        "user",
        JSON.stringify({ username: response.username }),
      );
      localStorage.setItem("session_start_time", Date.now().toString());

      state.token = response.jwt;
      state.user = { username: response.username };
      state.isAuthenticated = true;

      connectNotifications();

      // Prefetch data in background
      ultimasDesignaciones().catch((err) => console.warn("Background prefetch designaciones failed", err));
      loadCanchas().catch((err) => console.warn("Background prefetch canchas failed", err));
      loadArbitros().catch((err) => console.warn("Background prefetch arbitros failed", err));

      router.push("/arbitros");
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
    disconnectNotifications();

    // Preserve session timeout message if it exists
    const timeoutMsg = localStorage.getItem("session_timeout_message");

    localStorage.clear();
    sessionStorage.clear();

    if (timeoutMsg) {
      localStorage.setItem("session_timeout_message", timeoutMsg);
    }

    state.token = null;
    state.user = null;
    state.isAuthenticated = false;

    router.push("/login");
  }
};
