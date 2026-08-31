import api from "./api";

/**
 * Obtener todos los árbitros designados para una designación específica.
 * @param {number|string} idDesignacion
 */
export const getDesignados = (idDesignacion) =>
  api.get("/designados", { params: { idDesignacion } }).then((r) => r.data);

/**
 * Eliminar un árbitro designado por ID de designación e ID de asignación.
 * @param {number|string} idDesignacion
 * @param {number|string} idDesignado
 */
export const eliminarDesignado = (idDesignacion, idDesignado) =>
  api
    .delete("/designados/eliminar-designado", {
      params: { idDesignacion, idDesignado },
    })
    .then((r) => r.data);

/**
 * Modificar el monto a percibir asignado a un árbitro designado específico.
 * @param {number|string} idDesignado
 * @param {number|string} nuevoMonto
 */
export const actualizarMontoPercibido = (idDesignado, nuevoMonto) =>
  api
    .put(`/designados/${idDesignado}/actualizar-monto-percibido`, null, {
      params: { nuevoMonto },
    })
    .then((r) => r.data);

/**
 * Actualizar de forma uniforme el monto a cobrar para todos los designados de la jornada.
 * @param {number|string} idDesignacion
 * @param {number|string} montoPorArbitro
 */
export const actualizarMontoADesignados = (idDesignacion, montoPorArbitro) =>
  api
    .put("/designados/actualizar-monto-a-designados", null, {
      params: { idDesignacion, montoPorArbitro },
    })
    .then((r) => r.data);

/**
 * Asignar o modificar la cantidad de partidos dirigidos por un árbitro en una designación.
 * @param {number|string} idDesignacion
 * @param {number|string} idDesignado
 * @param {number} cantidad
 */
export const actualizarCantidadPartidos = (
  idDesignacion,
  idDesignado,
  cantidad,
) =>
  api
    .put("/designados/actualizar-cantidad-partidos", null, {
      params: { idDesignacion, idDesignado, cantidad },
    })
    .then((r) => r.data);

export default {
  getDesignados,
  eliminarDesignado,
  actualizarMontoPercibido,
  actualizarMontoADesignados,
  actualizarCantidadPartidos,
};

