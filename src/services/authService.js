import api from "./api";

/**
 * 2. Autenticación (/auth)
 */

/**
 * Autentica las credenciales y genera el token Bearer JWT con roles y expiración.
 * @param {string} username - Nombre de usuario o teléfono
 * @param {string} password - Contraseña
 */
export const login = async (username, password) => {
  const response = await api.post("/auth/login", {
    username,
    password,
  });
  return response.data;
};

/**
 * Cierra la sesión activa del usuario e invalida el contexto de seguridad.
 */
export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export default {
  login,
  logout,
};
