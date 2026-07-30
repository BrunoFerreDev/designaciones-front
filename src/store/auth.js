import { state } from "./state";
import * as authService from "../services/authService";
import router from "../router";

export const loginUser = async (whatsapp, contrasenia) => {
  try {
    const response = await authService.login(whatsapp, contrasenia);

    if (response.status && response.jwt) {
      localStorage.setItem("jwt_token", response.jwt);
      localStorage.setItem(
        "user",
        JSON.stringify({ username: response.username }),
      );

      state.token = response.jwt;
      state.user = { username: response.username };
      state.isAuthenticated = true;

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
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");

    state.token = null;
    state.user = null;
    state.isAuthenticated = false;

    router.push("/login");
  }
};
