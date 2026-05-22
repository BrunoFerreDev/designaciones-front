import api from "./api";

const createDesignacion = (dto) =>
  api.post("/designaciones", dto).then((r) => r.data);
const getAll = (page = 0, size = 50) =>
  api.get("/designaciones", { params: { page, size } }).then((r) => r.data);
const getCompletas = (page = 0, size = 50) =>
  api
    .get("/designaciones/completas", { params: { page, size } })
    .then((r) => r.data);
const getDesignados = (idDesignacion) =>
  api.get("/designados", { params: { idDesignacion } }).then((r) => {
    console.log(r.data);
    return r.data;
  });
const getByEstado = (estado, page = 0, size = 50) =>
  api
    .get("/designaciones", { params: { estado, page, size } })
    .then((r) => r.data);
const getIncompletas = (page = 0, size = 50) => getByEstado(0, page, size);
const getFinalizadas = (page = 0, size = 50) => getByEstado(2, page, size);
const deleteDesignacion = (id) =>
  api.delete(`/designaciones/${id}/eliminar`).then((r) => r.data);
const asignarArbitrosAutomaticamente = (id) =>
  api.post(`/designaciones/${id}/asignar-automatico`).then((r) => r.data);
const getArbitrosDesignados = (id) =>
  api.get(`/designaciones/${id}/arbitros`).then((r) => r.data);
const asignarArbitroManual = (idDesignacion, idArbitro) =>
  api
    .post(`/designaciones/${idDesignacion}/asignar-arbitro`, idArbitro, {
      headers: { "Content-Type": "application/json" },
    })
    .then((r) => r.data);
const quitarArbitroManual = (idDesignacion, idArbitro) =>
  api
    .delete(`/designaciones/${idDesignacion}/quitar-arbitro/${idArbitro}`)
    .then((r) => r.data);
const finalizarDesignacion = (idDesignacion) =>
  api.put(`/designaciones/${idDesignacion}/finalizar`).then((r) => r.data);
const buscarPorRango = (inicio, fin) =>
  api.get("/designaciones/buscar", { params: { inicio, fin } }).then((r) => r.data);
const buscarPorFecha = (fecha) =>
  api.get("/designaciones/obtener-por-fecha", { params: { fecha } }).then((r) => r.data);

export default {
  createDesignacion,
  getAll,
  getByEstado,
  getIncompletas,
  getCompletas,
  getFinalizadas,
  getDesignados,
  deleteDesignacion,
  asignarArbitrosAutomaticamente,
  getArbitrosDesignados,
  asignarArbitroManual,
  quitarArbitroManual,
  finalizarDesignacion,
  buscarPorRango,
  buscarPorFecha,
};

