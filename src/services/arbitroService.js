import api from "./api";

const getAll = (page = 0, size = 50) =>
  api.get("/arbitros", { params: { page, size } }).then((r) => r.data);
const getDisponibles = (page = 0, size = 50) =>
  api
    .get("/arbitros/traer-disponibles", { params: { page, size } })
    .then((r) => r.data);
const createArbitro = (dto) => api.post("/arbitros", dto).then((r) => r.data);
const updateArbitro = (id, dto) =>
  api.put(`/arbitros/${id}`, dto).then((r) => r.data);
const updateDisponibilidad = (id) =>
  api.put(`/arbitros/${id}/actualizar-disponibilidad`).then((r) => r.data);
const updateDisponibilidadTotal = () =>
  api.put("/arbitros/modificar-disponibilidad-total").then((r) => r.data);
const deleteArbitro = (id) => api.delete(`/arbitros/${id}`).then((r) => r.data);

export default {
  getAll,
  getDisponibles,
  createArbitro,
  updateArbitro,
  updateDisponibilidad,
  updateDisponibilidadTotal,
  deleteArbitro,
};
