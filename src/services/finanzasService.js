import api from "./api";

// Cajas
const getCajaActual = () =>
  api.get("/finanzas/cajas/actual").then((r) => r.data);

// Conceptos
const getConceptos = (page = 0, size = 50) =>
  api.get("/finanzas/conceptos", { params: { page, size } }).then((r) => r.data);

const createConcepto = (dto) =>
  api.post("/finanzas/conceptos", dto).then((r) => r.data);

// Arbitros finanzas
const getArbitrosFinanzas = (page = 0, size = 50) =>
  api.get("/finanzas/arbitros", { params: { page, size } }).then((r) => r.data);

// Gastos
const createGasto = (dto) =>
  api.post("/finanzas/gastos", dto).then((r) => r.data);

const updateGasto = (idGasto, dto) =>
  api.put(`/finanzas/gastos/${idGasto}`, dto).then((r) => r.data);

const asociarGastoArbitro = (idGasto, idArbitro, montoAsignado) =>
  api
    .post("/finanzas/gastos/asociar-gasto-arbitro", null, {
      params: { idGasto, idArbitro, montoAsignado },
    })
    .then((r) => r.data);

const asignarArbitrosAGasto = (idGasto, montoAasignar) =>
  api
    .post("/finanzas/gastos/asignar-arbitros", null, {
      params: { idGasto, montoAasignar },
    })
    .then((r) => r.data);

const getReporteGasto = (idGasto) =>
  api.get(`/finanzas/gastos/${idGasto}/reporte`).then((r) => r.data);

// Prestamos
const getPrestamos = (page = 0, size = 50) =>
  api.get("/finanzas/prestamos", { params: { page, size } }).then((r) => r.data);

const createPrestamo = (dto) =>
  api.post("/finanzas/prestamos", dto).then((r) => r.data);

const getPrestamoById = (idPrestamo) =>
  api.get(`/finanzas/prestamos/${idPrestamo}`).then((r) => r.data);

const getPrestamoDetalle = (idPrestamo, page = 0, size = 50) =>
  api
    .get(`/finanzas/prestamos/${idPrestamo}/detalle`, { params: { page, size } })
    .then((r) => r.data);

const getPrestamosByArbitro = (idArbitro, page = 0, size = 50) =>
  api
    .get(`/finanzas/prestamos/arbitro/${idArbitro}`, { params: { page, size } })
    .then((r) => r.data);

const registrarPagoPrestamo = (prestamoId, montoPagado, fecha) =>
  api
    .post(`/finanzas/prestamos/${prestamoId}/pago`, null, {
      params: { montoPagado, fecha },
    })
    .then((r) => r.data);

const actualizarFechaPrestamo = (idPrestamo, nuevaFecha) =>
  api
    .put(`/finanzas/prestamos/${idPrestamo}/actualizar-fecha`, null, {
      params: { nuevaFecha },
    })
    .then((r) => r.data);

const actualizarFechaPagoPrestamo = (idPrestamo, nuevaFecha) =>
  api
    .put(`/finanzas/prestamos/${idPrestamo}/actualizar-fecha-pago`, null, {
      params: { nuevaFecha },
    })
    .then((r) => r.data);

const getReportePrestamos = () =>
  api.get("/finanzas/prestamos/reporte").then((r) => r.data);

// Transacciones
const getTransacciones = (page = 0, size = 50) =>
  api.get("/finanzas/transacciones", { params: { page, size } }).then((r) => r.data);

const getTransaccionById = (idTransaccion) =>
  api.get(`/finanzas/transacciones/${idTransaccion}`).then((r) => r.data);

// Gastos con recupero
const getGastosConRecupero = (page = 0, size = 20) =>
  api
    .get("/finanzas/gastos-con-recupero", { params: { page, size } })
    .then((r) => r.data);

const getGastosConRecuperoTodos = () =>
  api.get("/finanzas/gastos-con-recupero/todos").then((r) => r.data);

const getGastoConRecuperoById = (idTransaccion) =>
  api.get(`/finanzas/gastos-con-recupero/${idTransaccion}`).then((r) => r.data);

const realizarCobroGastoConRecupero = (idTransaccion, idArbitro, montoCobrado) =>
  api
    .post(`/finanzas/gastos-con-recupero/${idTransaccion}/realizar-cobro`, null, {
      params: { idArbitro, montoCobrado },
    })
    .then((r) => r.data);

export default {
  getCajaActual,
  getConceptos,
  createConcepto,
  getArbitrosFinanzas,
  createGasto,
  updateGasto,
  asociarGastoArbitro,
  asignarArbitrosAGasto,
  getReporteGasto,
  getPrestamos,
  createPrestamo,
  getPrestamoById,
  getPrestamoDetalle,
  getPrestamosByArbitro,
  registrarPagoPrestamo,
  actualizarFechaPrestamo,
  actualizarFechaPagoPrestamo,
  getReportePrestamos,
  getTransacciones,
  getTransaccionById,
  getGastosConRecupero,
  getGastosConRecuperoTodos,
  getGastoConRecuperoById,
  realizarCobroGastoConRecupero,
};
