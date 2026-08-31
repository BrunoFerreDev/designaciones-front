import api from "./api";

const sortReferees = (data) => {
  if (!data) return data;
  const orderCat = {
    AVANZADO: 1,
    INTERMEDIO: 2,
    PRINCIPAL_1: 3,
    PRINCIPAL_2: 4,
    PRINCIPAL_3: 5,
    PRINCIPAL_4: 6,
    ASISTENTE: 7,
    INCIAL: 8,
  };

  const getSorted = (list) => {
    if (!Array.isArray(list)) return list;
    return [...list].sort((a, b) => {
      const valA = orderCat[a.categoria] !== undefined ? orderCat[a.categoria] : 99;
      const valB = orderCat[b.categoria] !== undefined ? orderCat[b.categoria] : 99;
      return valA - valB;
    });
  };

  if (Array.isArray(data)) {
    return getSorted(data);
  }
  if (data.value && Array.isArray(data.value)) {
    return getSorted(data.value);
  }
  if (data.content && Array.isArray(data.content)) {
    return getSorted(data.content);
  }
  return data;
};

const getAll = (page = 0, size = 50) =>
  api.get("/arbitros", { params: { page, size } }).then((r) => sortReferees(r.data));
const getDisponibles = (page = 0, size = 50) =>
  api.get("/arbitros/traer-disponibles", { params: { page, size } }).then((r) => sortReferees(r.data));
const getNoDisponibles = (page = 0, size = 50) => api.get("/arbitros/no-disponibles", { params: { page, size } }).then((r) => sortReferees(r.data));
const createArbitro = (dto) => api.post("/arbitros", dto).then((r) => r.data);
const updateArbitro = (id, dto) => api.put(`/arbitros/${id}`, dto).then((r) => r.data);
const updateDisponibilidad = (id, dto) =>
  api.put(`/arbitros/${id}/disponibilidad`, dto).then((r) => r.data);
const updateDisponibilidadTotal = () =>
  api.put("/arbitros/modificar-disponibilidad-total").then((r) => r.data);
const toggleEstado = (idArbitro) =>
  api.put(`/arbitros/${idArbitro}/toggle`).then((r) => r.data);
const deleteArbitro = (id) => api.delete(`/arbitros/${id}`).then((r) => r.data);
const getDesignacionesByArbitro = (idArbitro, page = 0, size = 10, orden = "DESC") => {
  const params = { idArbitro, page, size };
  if (orden) params.orden = orden;
  return api
    .get("/arbitros/designaciones", { params })
    .then((r) => r.data);
};
const getSuspencionesByArbitro = (idArbitro, page = 0, size = 50) =>
  api
    .get(`/arbitros/${idArbitro}/suspenciones`, { params: { page, size } })
    .then((r) => r.data);
const createSuspencionForArbitro = (idArbitro, dto) =>
  api
    .post(`/arbitros/${idArbitro}/suspenciones`, dto)
    .then((r) => r.data);

export default {
  getAll,
  getDisponibles,
  getNoDisponibles,
  createArbitro,
  updateArbitro,
  updateDisponibilidad,
  updateDisponibilidadTotal,
  toggleEstado,
  deleteArbitro,
  getDesignacionesByArbitro,
  getSuspencionesByArbitro,
  createSuspencionForArbitro,
};
