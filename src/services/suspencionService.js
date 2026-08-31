import api from "./api";

const create = (idArbitro, dto) =>
  api.post(`/arbitros/${idArbitro}/suspenciones`, dto).then((r) => r.data);

const getByArbitro = (idArbitro, page = 0, size = 50) =>
  api
    .get(`/arbitros/${idArbitro}/suspenciones`, { params: { page, size } })
    .then((r) => r.data);

const getAll = (page = 0, size = 100) =>
  api
    .get("/arbitros/suspenciones", { params: { page, size } })
    .then((r) => r.data);

const deleteSuspencion = (idSuspencion) =>
  api.delete(`/arbitros/suspenciones/${idSuspencion}`).then((r) => r.data);

export default {
  create,
  getByArbitro,
  getAll,
  deleteSuspencion,
};
