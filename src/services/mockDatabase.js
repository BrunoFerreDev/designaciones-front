// Database simulation in localStorage for portfolio standalone deployment.
// Emulates REST API endpoints by intercepting Axios requests.

const LATENCY = 200; // Simulated network delay in ms

// Seed Data
const initialCanchas = [
  { idCancha: 1, nombreCancha: "Estadio Monumental", categoria: "ELITE", fueraDeJuego: false, estado: true, necesitaViaje: false, partidos: 12, ciudad: "Buenos Aires", capacidad: 84000 },
  { idCancha: 2, nombreCancha: "La Bombonera", categoria: "ELITE", fueraDeJuego: false, estado: true, necesitaViaje: false, partidos: 10, ciudad: "Buenos Aires", capacidad: 57000 },
  { idCancha: 3, nombreCancha: "Cilindro de Avellaneda", categoria: "ELITE", fueraDeJuego: false, estado: true, necesitaViaje: false, partidos: 8, ciudad: "Avellaneda", capacidad: 55000 },
  { idCancha: 4, nombreCancha: "Libertadores de América", categoria: "ELITE", fueraDeJuego: false, estado: true, necesitaViaje: false, partidos: 6, ciudad: "Avellaneda", capacidad: 48000 },
  { idCancha: 5, nombreCancha: "El Coloso del Parque", categoria: "INTERMEDIO", fueraDeJuego: false, estado: true, necesitaViaje: true, partidos: 5, ciudad: "Rosario", capacidad: 42000 },
  { idCancha: 6, nombreCancha: "Gigante de Arroyito", categoria: "INTERMEDIO", fueraDeJuego: false, estado: true, necesitaViaje: true, partidos: 4, ciudad: "Rosario", capacidad: 45000 },
  { idCancha: 7, nombreCancha: "Estadio Pedro Bidegain", categoria: "ELITE", fueraDeJuego: true, estado: false, necesitaViaje: false, partidos: 2, ciudad: "Buenos Aires", capacidad: 47900 }
];

const initialArbitros = [
  { idArbitro: 1, nombre: "Néstor", apellido: "Pitana", rol: "Árbitro Principal", whatsapp: "5493415550101", estado: true, disponibleSabado: true, disponibleDomingo: true, categoria: "AVANZADO", talleCamiseta: "L", talleShort: "L", estadoSistema: true },
  { idArbitro: 2, nombre: "Patricio", apellido: "Loustau", rol: "Árbitro Principal", whatsapp: "5493415550102", estado: true, disponibleSabado: true, disponibleDomingo: true, categoria: "AVANZADO", talleCamiseta: "M", talleShort: "M", estadoSistema: true },
  { idArbitro: 3, nombre: "Fernando", apellido: "Rapallini", rol: "Árbitro Principal", whatsapp: "5493415550103", estado: true, disponibleSabado: true, disponibleDomingo: false, categoria: "AVANZADO", talleCamiseta: "L", talleShort: "L", estadoSistema: true },
  { idArbitro: 4, nombre: "Facundo", apellido: "Tello", rol: "Árbitro Principal", whatsapp: "5493415550104", estado: true, disponibleSabado: false, disponibleDomingo: true, categoria: "INTERMEDIO", talleCamiseta: "M", talleShort: "L", estadoSistema: true },
  { idArbitro: 5, nombre: "Darío", apellido: "Herrera", rol: "Árbitro Principal", whatsapp: "5493415550105", estado: true, disponibleSabado: true, disponibleDomingo: true, categoria: "PRINCIPAL_1", talleCamiseta: "XL", talleShort: "XL", estadoSistema: true },
  { idArbitro: 6, nombre: "Yael", apellido: "Falcón Pérez", rol: "Árbitro Principal", whatsapp: "5493415550106", estado: true, disponibleSabado: true, disponibleDomingo: true, categoria: "PRINCIPAL_2", talleCamiseta: "M", talleShort: "M", estadoSistema: true },
  { idArbitro: 7, nombre: "Mauro", apellido: "Vigliano", rol: "VAR", whatsapp: "5493415550107", estado: false, disponibleSabado: false, disponibleDomingo: false, categoria: "ASISTENTE", talleCamiseta: "L", talleShort: "M", estadoSistema: true },
  { idArbitro: 8, nombre: "Germán", apellido: "Delfino", rol: "Árbitro Asistente 1", whatsapp: "5493415550108", estado: true, disponibleSabado: true, disponibleDomingo: true, categoria: "INCIAL", talleCamiseta: "S", talleShort: "M", estadoSistema: true }
];

const initialAranceles = [
  { idArancel: 1, categoriaCancha: "ELITE", rolArbitro: "Árbitro Principal", monto: 150000 },
  { idArancel: 2, categoriaCancha: "ELITE", rolArbitro: "Árbitro Asistente 1", monto: 95000 },
  { idArancel: 3, categoriaCancha: "ELITE", rolArbitro: "Árbitro Asistente 2", monto: 95000 },
  { idArancel: 4, categoriaCancha: "ELITE", rolArbitro: "Cuarto Árbitro", monto: 50000 },
  { idArancel: 5, categoriaCancha: "ELITE", rolArbitro: "VAR", monto: 120000 },
  { idArancel: 6, categoriaCancha: "ELITE", rolArbitro: "Asistente VAR", monto: 80000 },
  { idArancel: 7, categoriaCancha: "INTERMEDIO", rolArbitro: "Árbitro Principal", monto: 110000 },
  { idArancel: 8, categoriaCancha: "INTERMEDIO", rolArbitro: "Árbitro Asistente 1", monto: 70000 }
];

const initialSuspensiones = [
  { idSuspencion: 1, idArbitro: 3, arbitroNombre: "Rapallini, Fernando", fechaInicio: "2026-08-01", fechaFin: "2026-08-10", motivo: "Lesión muscular en gemelo izquierdo" },
  { idSuspencion: 2, idArbitro: 7, arbitroNombre: "Vigliano, Mauro", fechaInicio: "2026-08-03", fechaFin: "2026-08-20", motivo: "Suspensión disciplinaria AFA" }
];

// Helper to get formatted dates relative to today
const getRelativeDateStr = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const initialDesignaciones = [
  { idDesignacion: 1, idCancha: 1, canchaId: 1, fecha: `${getRelativeDateStr(-10)}T16:00:00`, cantidadPartidos: 1, etapaCampeonato: "FECHA_NORMAL", detalle: "Clásico nacional jugado con normalidad", editable: false, estadoDesignacion: 2, montoPorArbitro: 150000 },
  { idDesignacion: 2, idCancha: 2, canchaId: 2, fecha: `${getRelativeDateStr(-5)}T18:30:00`, cantidadPartidos: 1, etapaCampeonato: "FECHA_NORMAL", detalle: "Partido reprogramado previamente", editable: false, estadoDesignacion: 2, montoPorArbitro: 150000 },
  { idDesignacion: 3, idCancha: 3, canchaId: 3, fecha: `${getRelativeDateStr(-2)}T20:00:00`, cantidadPartidos: 1, etapaCampeonato: "PLAYOFFS", detalle: "Partido de alta tensión", editable: false, estadoDesignacion: 2, montoPorArbitro: 150000 },
  { idDesignacion: 4, idCancha: 1, canchaId: 1, fecha: `${getRelativeDateStr(2)}T17:00:00`, cantidadPartidos: 1, etapaCampeonato: "FECHA_NORMAL", detalle: "Transmisión por TV pública", editable: true, estadoDesignacion: 1, montoPorArbitro: 150000 },
  { idDesignacion: 5, idCancha: 2, canchaId: 2, fecha: `${getRelativeDateStr(3)}T19:00:00`, cantidadPartidos: 1, etapaCampeonato: "FECHA_NORMAL", detalle: "", editable: true, estadoDesignacion: 0, montoPorArbitro: 150000 },
  { idDesignacion: 6, idCancha: 4, canchaId: 4, fecha: `${getRelativeDateStr(7)}T21:30:00`, cantidadPartidos: 1, etapaCampeonato: "FINALES", detalle: "Cotejo definitivo ida", editable: true, estadoDesignacion: 0, montoPorArbitro: 150000 },
  { idDesignacion: 7, idCancha: 5, canchaId: 5, fecha: `${getRelativeDateStr(10)}T15:00:00`, cantidadPartidos: 1, etapaCampeonato: "FECHA_NORMAL", detalle: "Requiere viaje del equipo arbitral", editable: true, estadoDesignacion: 0, montoPorArbitro: 110000 },
  { idDesignacion: 8, idCancha: 6, canchaId: 6, fecha: `${getRelativeDateStr(-15)}T16:00:00`, cantidadPartidos: 1, etapaCampeonato: "FECHA_NORMAL", detalle: "Suspendido por tormenta eléctrica", editable: false, estadoDesignacion: 3, montoPorArbitro: 110000 }
];

const initialDesignados = [
  // Match 1 (Historical - Finished)
  { idDesignado: 1, idDesignacion: 1, idArbitro: 1, rol: "Árbitro Principal", montoPercibido: 150000 },
  { idDesignado: 2, idDesignacion: 1, idArbitro: 8, rol: "Árbitro Asistente 1", montoPercibido: 95000 },
  { idDesignado: 3, idDesignacion: 1, idArbitro: 2, rol: "Árbitro Asistente 2", montoPercibido: 95000 },
  
  // Match 2 (Historical - Finished)
  { idDesignado: 4, idDesignacion: 2, idArbitro: 2, rol: "Árbitro Principal", montoPercibido: 150000 },
  { idDesignado: 5, idDesignacion: 2, idArbitro: 1, rol: "Árbitro Asistente 1", montoPercibido: 95000 },

  // Match 3 (Historical - Finished)
  { idDesignado: 6, idDesignacion: 3, idArbitro: 5, rol: "Árbitro Principal", montoPercibido: 150000 },
  { idDesignado: 7, idDesignacion: 3, idArbitro: 6, rol: "Árbitro Asistente 1", montoPercibido: 95000 },

  // Match 4 (Accepted - Future)
  { idDesignado: 8, idDesignacion: 4, idArbitro: 1, rol: "Árbitro Principal", montoPercibido: 150000 },
  { idDesignado: 9, idDesignacion: 4, idArbitro: 2, rol: "Árbitro Asistente 1", montoPercibido: 95000 },

  // Match 5 (Pending - Future)
  { idDesignado: 10, idDesignacion: 5, idArbitro: 5, rol: "Árbitro Principal", montoPercibido: 150000 }
];

// Initialize localStorage
const initDb = () => {
  if (!localStorage.getItem("db_initialized")) {
    localStorage.setItem("db_canchas", JSON.stringify(initialCanchas));
    localStorage.setItem("db_arbitros", JSON.stringify(initialArbitros));
    localStorage.setItem("db_aranceles", JSON.stringify(initialAranceles));
    localStorage.setItem("db_suspensiones", JSON.stringify(initialSuspensiones));
    localStorage.setItem("db_designaciones", JSON.stringify(initialDesignaciones));
    localStorage.setItem("db_designados", JSON.stringify(initialDesignados));
    localStorage.setItem("db_initialized", "true");
  }
};

initDb();

// Load arrays from localStorage
const getDbTable = (key) => JSON.parse(localStorage.getItem(`db_${key}`) || "[]");
const saveDbTable = (key, data) => localStorage.setItem(`db_${key}`, JSON.stringify(data));

// Get next ID helper
const getNextId = (tableKey, idFieldName) => {
  const data = getDbTable(tableKey);
  if (data.length === 0) return 1;
  const ids = data.map((item) => Number(item[idFieldName])).filter((id) => !isNaN(id));
  return Math.max(...ids, 0) + 1;
};

// Log Mock Request helper
const logRequest = (method, url, data, params) => {
  console.log(`[Mock DB Request] ${method.toUpperCase()} ${url}`, { data, params });
};

// Route handlers matching the endpoints
export const mockDatabaseAdapter = (config) => {
  initDb();
  const url = config.url;
  const method = config.method.toLowerCase();
  const data = config.data ? (typeof config.data === "string" ? JSON.parse(config.data) : config.data) : null;
  const params = config.params || {};

  logRequest(method, url, data, params);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        let responseData = null;

        // AUTH ENDPOINTS
        if (url === "/auth/login") {
          responseData = {
            status: true,
            jwt: "mock-jwt-token-abcd-12345",
            username: "Administrador de Demo"
          };
          return resolve({ data: responseData, status: 200 });
        }
        if (url === "/auth/logout") {
          responseData = { status: true, message: "Sesión cerrada correctamente" };
          return resolve({ data: responseData, status: 200 });
        }

        // CANCHAS ENDPOINTS
        if (url === "/canchas") {
          if (method === "get") {
            responseData = getDbTable("canchas");
          } else if (method === "post") {
            const list = getDbTable("canchas");
            const newCancha = {
              idCancha: getNextId("canchas", "idCancha"),
              nombreCancha: data.nombreCancha,
              categoria: data.categoria || "ELITE",
              fueraDeJuego: data.fueraDeJuego || false,
              estado: data.estado !== undefined ? data.estado : true,
              necesitaViaje: data.necesitaViaje || false,
              partidos: 0,
              ciudad: data.ciudad || "Buenos Aires",
              capacidad: data.capacidad || 20000
            };
            list.push(newCancha);
            saveDbTable("canchas", list);
            responseData = newCancha;
          }
        }
        else if (url === "/canchas/activas" && method === "get") {
          responseData = getDbTable("canchas").filter((c) => c.estado === true);
        }
        else if (url.startsWith("/canchas/actualizar/") && method === "put") {
          const id = parseInt(url.split("/").pop(), 10);
          const list = getDbTable("canchas");
          const idx = list.findIndex((c) => c.idCancha === id);
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...data };
            saveDbTable("canchas", list);
            responseData = list[idx];
          } else {
            return reject({ response: { status: 404, data: { message: "Cancha no encontrada" } } });
          }
        }
        else if (url.includes("/toggle") && url.includes("/canchas/") && method === "put") {
          const parts = url.split("/");
          const id = parseInt(parts[parts.indexOf("canchas") + 1], 10);
          const list = getDbTable("canchas");
          const idx = list.findIndex((c) => c.idCancha === id);
          if (idx !== -1) {
            list[idx].estado = !list[idx].estado;
            saveDbTable("canchas", list);
            responseData = list[idx];
          } else {
            return reject({ response: { status: 404, data: { message: "Cancha no encontrada" } } });
          }
        }
        else if (url === "/canchas/designaciones" && method === "get") {
          const idCancha = parseInt(params.idCancha, 10);
          const desList = getDbTable("designaciones");
          responseData = desList.filter((d) => d.idCancha === idCancha || d.canchaId === idCancha);
        }

        // ARBITROS ENDPOINTS
        else if (url === "/arbitros") {
          if (method === "get") {
            const list = getDbTable("arbitros");
            // compute designaciones count for each referee
            const desList = getDbTable("designados");
            const countMap = {};
            desList.forEach((d) => {
              countMap[d.idArbitro] = (countMap[d.idArbitro] || 0) + 1;
            });
            list.forEach((a) => {
              a.designaciones = countMap[a.idArbitro] || 0;
            });
            responseData = list;
          } else if (method === "post") {
            const list = getDbTable("arbitros");
            const newArb = {
              idArbitro: getNextId("arbitros", "idArbitro"),
              nombre: data.nombre,
              apellido: data.apellido,
              rol: data.rol || "Árbitro Principal",
              whatsapp: data.whatsapp || "",
              estado: data.estado !== undefined ? data.estado : true,
              disponibleSabado: data.disponibleSabado !== undefined ? data.disponibleSabado : true,
              disponibleDomingo: data.disponibleDomingo !== undefined ? data.disponibleDomingo : true,
              categoria: data.categoria || "INCIAL",
              talleCamiseta: data.talleCamiseta || "M",
              talleShort: data.talleShort || "M",
              estadoSistema: data.estadoSistema !== undefined ? data.estadoSistema : true
            };
            list.push(newArb);
            saveDbTable("arbitros", list);
            if (window.triggerMockNotification) {
              window.triggerMockNotification(`Nuevo árbitro registrado: ${newArb.apellido}, ${newArb.nombre}`, "CREACION");
            }
            responseData = newArb;
          }
        }
        else if (url === "/arbitros/traer-disponibles" && method === "get") {
          responseData = getDbTable("arbitros").filter((a) => a.estado === true && a.estadoSistema === true);
        }
        else if (url === "/arbitros/no-disponibles" && method === "get") {
          responseData = getDbTable("arbitros").filter((a) => a.estado === false || a.estadoSistema === false);
        }
        else if (url.startsWith("/arbitros/") && url.endsWith("/disponibilidad") && method === "put") {
          const parts = url.split("/");
          const id = parseInt(parts[parts.indexOf("arbitros") + 1], 10);
          const list = getDbTable("arbitros");
          const idx = list.findIndex((a) => a.idArbitro === id);
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...data };
            saveDbTable("arbitros", list);
            responseData = list[idx];
          } else {
            return reject({ response: { status: 404, data: { message: "Árbitro no encontrado" } } });
          }
        }
        else if (url === "/arbitros/modificar-disponibilidad-total" && method === "put") {
          const list = getDbTable("arbitros");
          list.forEach((a) => {
            a.estado = false;
          });
          saveDbTable("arbitros", list);
          responseData = { success: true };
        }
        else if (url.startsWith("/arbitros/") && url.includes("/suspenciones") && method === "get") {
          const parts = url.split("/");
          const idArbitro = parseInt(parts[parts.indexOf("arbitros") + 1], 10);
          responseData = getDbTable("suspensiones").filter((s) => s.idArbitro === idArbitro);
        }
        else if (url.startsWith("/arbitros/") && url.includes("/suspenciones") && method === "post") {
          const parts = url.split("/");
          const idArbitro = parseInt(parts[parts.indexOf("arbitros") + 1], 10);
          const list = getDbTable("suspensiones");
          const arbList = getDbTable("arbitros");
          const arb = arbList.find((a) => a.idArbitro === idArbitro);
          
          const newSusp = {
            idSuspencion: getNextId("suspensiones", "idSuspencion"),
            idArbitro,
            arbitroNombre: arb ? `${arb.apellido}, ${arb.nombre}` : "Árbitro Desconocido",
            fechaInicio: data.fechaInicio,
            fechaFin: data.fechaFin,
            motivo: data.motivo || ""
          };
          list.push(newSusp);
          saveDbTable("suspensiones", list);

          // also make the referee unavailable during suspension (optional but nice)
          if (arb) {
            const idx = arbList.findIndex((a) => a.idArbitro === idArbitro);
            arbList[idx].estado = false;
            saveDbTable("arbitros", arbList);
          }

          if (window.triggerMockNotification) {
            window.triggerMockNotification(`Nueva suspensión registrada para ${arb ? arb.apellido : 'Árbitro'}: ${newSusp.motivo}`, "SUSPENSION");
          }
          responseData = newSusp;
        }
        else if (url === "/arbitros/suspenciones" && method === "get") {
          responseData = getDbTable("suspensiones");
        }
        else if (url.startsWith("/arbitros/suspenciones/") && method === "delete") {
          const id = parseInt(url.split("/").pop(), 10);
          let list = getDbTable("suspensiones");
          list = list.filter((s) => s.idSuspencion !== id);
          saveDbTable("suspensiones", list);
          responseData = { success: true };
        }
        else if (url === "/arbitros/designaciones" && method === "get") {
          const idArbitro = parseInt(params.idArbitro, 10);
          const designated = getDbTable("designados").filter((d) => d.idArbitro === idArbitro);
          const desIds = designated.map((d) => d.idDesignacion);
          const allDes = getDbTable("designaciones");
          responseData = allDes.filter((d) => desIds.includes(d.idDesignacion));
        }
        else if (url.startsWith("/arbitros/") && method === "put") {
          const id = parseInt(url.split("/").pop(), 10);
          const list = getDbTable("arbitros");
          const idx = list.findIndex((a) => a.idArbitro === id);
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...data };
            saveDbTable("arbitros", list);
            responseData = list[idx];
          } else {
            return reject({ response: { status: 404, data: { message: "Árbitro no encontrado" } } });
          }
        }
        else if (url.startsWith("/arbitros/") && method === "delete") {
          const id = parseInt(url.split("/").pop(), 10);
          let list = getDbTable("arbitros");
          const arb = list.find((a) => a.idArbitro === id);
          list = list.filter((a) => a.idArbitro !== id);
          saveDbTable("arbitros", list);
          
          let desList = getDbTable("designados");
          desList = desList.filter((d) => d.idArbitro !== id);
          saveDbTable("designados", desList);

          if (window.triggerMockNotification && arb) {
            window.triggerMockNotification(`Árbitro eliminado del sistema: ${arb.apellido}, ${arb.nombre}`, "DESASIGNACION");
          }
          responseData = { success: true };
        }

        // ARANCELES ENDPOINTS
        else if (url === "/aranceles") {
          if (method === "get") {
            responseData = getDbTable("aranceles");
          } else if (method === "post") {
            const list = getDbTable("aranceles");
            const newArancel = {
              idArancel: getNextId("aranceles", "idArancel"),
              categoriaCancha: data.categoriaCancha,
              rolArbitro: data.rolArbitro,
              monto: data.monto || 0
            };
            list.push(newArancel);
            saveDbTable("aranceles", list);
            responseData = newArancel;
          }
        }
        else if (url === "/aranceles/actualizar" && method === "put") {
          const id = parseInt(params.idArancel, 10);
          const list = getDbTable("aranceles");
          const idx = list.findIndex((a) => a.idArancel === id);
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...data };
            saveDbTable("aranceles", list);
            responseData = list[idx];
          } else {
            return reject({ response: { status: 404, data: { message: "Arancel no encontrado" } } });
          }
        }

        // DESIGNACIONES ENDPOINTS
        else if (url === "/designaciones") {
          if (method === "get") {
            const desList = getDbTable("designaciones");
            const canchas = getDbTable("canchas");
            
            // Map cancha object and load designados
            desList.forEach((d) => {
              d.cancha = canchas.find((c) => c.idCancha === d.idCancha) || null;
              d.canchaId = d.idCancha;
              
              // Load designados for this designacion
              const designados = getDbTable("designados").filter((dg) => dg.idDesignacion === d.idDesignacion);
              const arbitros = getDbTable("arbitros");
              d.arbitrosDesignados = designados.map((dg) => {
                const arb = arbitros.find((a) => a.idArbitro === dg.idArbitro);
                return {
                  idDesignado: dg.idDesignado,
                  rol: dg.rol,
                  montoPercibido: dg.montoPercibido,
                  arbitro: arb || null,
                  idArbitro: dg.idArbitro
                };
              });
            });

            if (params.estado !== undefined) {
              const est = parseInt(params.estado, 10);
              responseData = desList.filter((d) => d.estadoDesignacion === est);
            } else {
              responseData = desList;
            }
          } else if (method === "post") {
            const list = getDbTable("designaciones");
            const canchas = getDbTable("canchas");
            const c = canchas.find((ch) => ch.idCancha === data.idCancha);
            
            // Compute a default base fee for primary referee
            const aranceles = getDbTable("aranceles");
            const arancel = aranceles.find((a) => a.categoriaCancha === (c ? c.categoria : "ELITE") && a.rolArbitro === "Árbitro Principal");
            const baseMonto = arancel ? arancel.monto : 150000;

            const newDes = {
              idDesignacion: getNextId("designaciones", "idDesignacion"),
              idCancha: data.idCancha,
              canchaId: data.idCancha,
              fecha: data.fecha,
              cantidadPartidos: data.cantidadPartidos || 1,
              etapaCampeonato: data.etapaCampeonato || "FECHA_NORMAL",
              detalle: data.detalle || "",
              editable: data.editable !== undefined ? data.editable : true,
              estadoDesignacion: data.estadoDesignacion !== undefined ? data.estadoDesignacion : 0,
              montoPorArbitro: baseMonto * (data.cantidadPartidos || 1)
            };
            list.push(newDes);
            saveDbTable("designaciones", list);
            if (window.triggerMockNotification) {
              const canchaNombre = c ? c.nombreCancha : `ID ${data.idCancha}`;
              window.triggerMockNotification(`Nueva designación creada en ${canchaNombre} para el ${data.fecha.split("T")[0]}`, "CREACION");
            }
            responseData = newDes;
          }
        }
        else if (url === "/designaciones/ultimas-designaciones" && method === "get") {
          // returns all designaciones with populated fields
          const desList = getDbTable("designaciones");
          const canchas = getDbTable("canchas");
          
          desList.forEach((d) => {
            d.cancha = canchas.find((c) => c.idCancha === d.idCancha) || null;
            d.canchaId = d.idCancha;
            
            const designados = getDbTable("designados").filter((dg) => dg.idDesignacion === d.idDesignacion);
            const arbitros = getDbTable("arbitros");
            d.arbitrosDesignados = designados.map((dg) => {
              const arb = arbitros.find((a) => a.idArbitro === dg.idArbitro);
              return {
                idDesignado: dg.idDesignado,
                rol: dg.rol,
                montoPercibido: dg.montoPercibido,
                arbitro: arb || null,
                idArbitro: dg.idArbitro
              };
            });
          });
          responseData = desList;
        }
        else if (url.startsWith("/designaciones/") && method === "put") {
          const id = parseInt(url.split("/").pop(), 10);
          const list = getDbTable("designaciones");
          const idx = list.findIndex((d) => d.idDesignacion === id);
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...data };
            saveDbTable("designaciones", list);
            responseData = list[idx];
          } else {
            return reject({ response: { status: 404, data: { message: "Designación no encontrada" } } });
          }
        }
        else if (url.startsWith("/designaciones/") && method === "delete") {
          const id = parseInt(url.split("/").pop(), 10);
          let list = getDbTable("designaciones");
          list = list.filter((d) => d.idDesignacion !== id);
          saveDbTable("designaciones", list);
          
          let desList = getDbTable("designados");
          desList = desList.filter((d) => d.idDesignacion !== id);
          saveDbTable("designados", desList);

          responseData = { success: true };
        }
        else if (url === "/designaciones/mes" && method === "get") {
          const mes = parseInt(params.mes, 10);
          const anio = parseInt(params.anio, 10);
          const list = getDbTable("designaciones");
          
          responseData = list.filter((d) => {
            const parts = d.fecha.split("-");
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            return y === anio && m === mes;
          });
        }
        else if (url === "/designaciones/buscar" && method === "get") {
          const inicio = params.inicio;
          const fin = params.fin;
          const list = getDbTable("designaciones");
          responseData = list.filter((d) => {
            const fd = d.fecha.split("T")[0];
            return fd >= inicio && fd <= fin;
          });
        }
        else if (url === "/designaciones/obtener-por-fecha" && method === "get") {
          const fecha = params.fecha;
          const list = getDbTable("designaciones");
          responseData = list.filter((d) => d.fecha.split("T")[0] === fecha);
        }
        else if (url.endsWith("/cambiar-cancelado") && method === "put") {
          const parts = url.split("/");
          const id = parseInt(parts[parts.indexOf("designaciones") + 1], 10);
          const list = getDbTable("designaciones");
          const idx = list.findIndex((d) => d.idDesignacion === id);
          if (idx !== -1) {
            list[idx].estadoDesignacion = 3;
            list[idx].detalle = params.detalle || "Cancelada en Modo Demo";
            saveDbTable("designaciones", list);
            if (window.triggerMockNotification) {
              const canchas = getDbTable("canchas");
              const c = canchas.find((ch) => ch.idCancha === list[idx].idCancha);
              const canchaNombre = c ? c.nombreCancha : `ID ${list[idx].idCancha}`;
              window.triggerMockNotification(`Designación cancelada en ${canchaNombre} del ${list[idx].fecha.split("T")[0]}`, "CANCELADO");
            }
            responseData = list[idx];
          } else {
            return reject({ response: { status: 404, data: { message: "Designación no encontrada" } } });
          }
        }
        else if (url.endsWith("/finalizar") && method === "put") {
          const parts = url.split("/");
          const id = parseInt(parts[parts.indexOf("designaciones") + 1], 10);
          const list = getDbTable("designaciones");
          const idx = list.findIndex((d) => d.idDesignacion === id);
          if (idx !== -1) {
            list[idx].estadoDesignacion = 2;
            list[idx].editable = false;
            saveDbTable("designaciones", list);
            if (window.triggerMockNotification) {
              const canchas = getDbTable("canchas");
              const c = canchas.find((ch) => ch.idCancha === list[idx].idCancha);
              const canchaNombre = c ? c.nombreCancha : `ID ${list[idx].idCancha}`;
              window.triggerMockNotification(`Partido finalizado con éxito en ${canchaNombre}`, "ACEPTADA");
            }
            responseData = list[idx];
          } else {
            return reject({ response: { status: 404, data: { message: "Designación no encontrada" } } });
          }
        }
        else if (url.endsWith("/aceptar") && method === "put") {
          const parts = url.split("/");
          const id = parseInt(parts[parts.indexOf("designaciones") + 1], 10);
          const list = getDbTable("designaciones");
          const idx = list.findIndex((d) => d.idDesignacion === id);
          if (idx !== -1) {
            list[idx].estadoDesignacion = 1;
            saveDbTable("designaciones", list);
            if (window.triggerMockNotification) {
              const canchas = getDbTable("canchas");
              const c = canchas.find((ch) => ch.idCancha === list[idx].idCancha);
              const canchaNombre = c ? c.nombreCancha : `ID ${list[idx].idCancha}`;
              window.triggerMockNotification(`Designación confirmada y aceptada en ${canchaNombre}`, "ACEPTADA");
            }
            responseData = list[idx];
          } else {
            return reject({ response: { status: 404, data: { message: "Designación no encontrada" } } });
          }
        }
        else if (url.endsWith("/reprogramar") && method === "put") {
          const parts = url.split("/");
          const id = parseInt(parts[parts.indexOf("designaciones") + 1], 10);
          const list = getDbTable("designaciones");
          const idx = list.findIndex((d) => d.idDesignacion === id);
          if (idx !== -1) {
            list[idx].estadoDesignacion = 0;
            saveDbTable("designaciones", list);
            responseData = list[idx];
          } else {
            return reject({ response: { status: 404, data: { message: "Designación no encontrada" } } });
          }
        }
        else if (url.endsWith("/asignar-automatico") && method === "post") {
          const parts = url.split("/");
          const idDes = parseInt(parts[parts.indexOf("designaciones") + 1], 10);
          
          const desList = getDbTable("designaciones");
          const des = desList.find((d) => d.idDesignacion === idDes);
          if (!des) return reject({ response: { status: 404, data: { message: "Designación no encontrada" } } });

          // Pick 3 available referees that aren't suspended
          const arbitros = getDbTable("arbitros").filter((a) => a.estado === true && a.estadoSistema === true);
          const designados = getDbTable("designados");
          
          // delete existing ones
          const cleanDesignados = designados.filter((dg) => dg.idDesignacion !== idDes);
          
          const roles = ["Árbitro Principal", "Árbitro Asistente 1", "Árbitro Asistente 2"];
          const added = [];

          for (let i = 0; i < Math.min(roles.length, arbitros.length); i++) {
            const arb = arbitros[i];
            const newDg = {
              idDesignado: getNextId("designados", "idDesignado") + i,
              idDesignacion: idDes,
              idArbitro: arb.idArbitro,
              rol: roles[i],
              montoPercibido: des.montoPorArbitro || 150000
            };
            cleanDesignados.push(newDg);
            added.push(newDg);
          }

          saveDbTable("designados", cleanDesignados);
          des.estadoDesignacion = added.length >= 3 ? 1 : 0; // complete if we have 3 referees
          saveDbTable("designaciones", desList);

          responseData = added;
        }
        else if (url.endsWith("/asignar-arbitro") && method === "post") {
          const parts = url.split("/");
          const idDes = parseInt(parts[parts.indexOf("designaciones") + 1], 10);
          const idArbitro = parseInt(params.idArbitro, 10);

          const desList = getDbTable("designaciones");
          const des = desList.find((d) => d.idDesignacion === idDes);
          if (!des) return reject({ response: { status: 404, data: { message: "Designación no encontrada" } } });

          const dgList = getDbTable("designados");
          const existingCount = dgList.filter((dg) => dg.idDesignacion === idDes).length;
          
          let rol = "Árbitro Principal";
          if (existingCount === 1) rol = "Árbitro Asistente 1";
          else if (existingCount === 2) rol = "Árbitro Asistente 2";
          else if (existingCount === 3) rol = "Cuarto Árbitro";

          const newDg = {
            idDesignado: getNextId("designados", "idDesignado"),
            idDesignacion: idDes,
            idArbitro,
            rol,
            montoPercibido: des.montoPorArbitro || 150000
          };
          dgList.push(newDg);
          saveDbTable("designados", dgList);

          // If we reach 3 referees, mark as Complete/Accepted (1) automatically
          const totalReferees = dgList.filter((dg) => dg.idDesignacion === idDes).length;
          if (totalReferees >= 3 && des.estadoDesignacion === 0) {
            des.estadoDesignacion = 1;
            saveDbTable("designaciones", desList);
          }

          responseData = newDg;
        }
        else if (url.endsWith("/asignar-arbitro/historico") && method === "post") {
          const parts = url.split("/");
          const idDes = parseInt(parts[parts.indexOf("designaciones") + 1], 10);
          const idArbitro = parseInt(params.idArbitro, 10);

          const desList = getDbTable("designaciones");
          const des = desList.find((d) => d.idDesignacion === idDes);
          if (!des) return reject({ response: { status: 404, data: { message: "Designación no encontrada" } } });

          const dgList = getDbTable("designados");
          const newDg = {
            idDesignado: getNextId("designados", "idDesignado"),
            idDesignacion: idDes,
            idArbitro,
            rol: "Árbitro Principal",
            montoPercibido: des.montoPorArbitro || 150000
          };
          dgList.push(newDg);
          saveDbTable("designados", dgList);

          responseData = newDg;
        }
        else if (url.includes("/arbitros/") && url.includes("/designaciones/") && method === "delete") {
          // DELETE /designaciones/{idDesignacion}/arbitros/{idArbitro}
          const parts = url.split("/");
          const idDes = parseInt(parts[parts.indexOf("designaciones") + 1], 10);
          const idArbitro = parseInt(parts[parts.indexOf("arbitros") + 1], 10);

          let dgList = getDbTable("designados");
          dgList = dgList.filter((dg) => !(dg.idDesignacion === idDes && dg.idArbitro === idArbitro));
          saveDbTable("designados", dgList);

          // If referees are less than 3, change status back to Pending (0)
          const remaining = dgList.filter((dg) => dg.idDesignacion === idDes).length;
          if (remaining < 3) {
            const desList = getDbTable("designaciones");
            const idx = desList.findIndex((d) => d.idDesignacion === idDes);
            if (idx !== -1 && desList[idx].estadoDesignacion === 1) {
              desList[idx].estadoDesignacion = 0;
              saveDbTable("designaciones", desList);
            }
          }

          responseData = { success: true };
        }
        else if (url.endsWith("/arbitros/bulk") && method === "post") {
          const parts = url.split("/");
          const idDes = parseInt(parts[parts.indexOf("designaciones") + 1], 10);
          const idsArbitros = data; // Array of IDs

          const desList = getDbTable("designaciones");
          const des = desList.find((d) => d.idDesignacion === idDes);
          if (!des) return reject({ response: { status: 404, data: { message: "Designación no encontrada" } } });

          let dgList = getDbTable("designados");
          // delete existing ones for this designacion
          dgList = dgList.filter((dg) => dg.idDesignacion !== idDes);

          const roles = ["Árbitro Principal", "Árbitro Asistente 1", "Árbitro Asistente 2", "Cuarto Árbitro", "VAR", "Asistente VAR"];
          
          idsArbitros.forEach((idArb, i) => {
            dgList.push({
              idDesignado: getNextId("designados", "idDesignado") + i,
              idDesignacion: idDes,
              idArbitro: idArb,
              rol: roles[i] || "Árbitro Principal",
              montoPercibido: des.montoPorArbitro || 150000
            });
          });

          saveDbTable("designados", dgList);
          
          if (idsArbitros.length >= 3 && des.estadoDesignacion === 0) {
            des.estadoDesignacion = 1;
            saveDbTable("designaciones", desList);
          }

          responseData = { success: true };
        }

        // STATS ENDPOINTS
        else if (url === "/designaciones/estadisticas" && method === "get") {
          const inicio = params.inicio || "2000-01-01";
          const fin = params.fin || "2099-12-31";

          const desList = getDbTable("designaciones").filter((d) => {
            const fd = d.fecha.split("T")[0];
            return fd >= inicio && fd <= fin;
          });

          const totalDesignaciones = desList.length;
          const totalPartidosDirigidos = desList.filter((d) => d.estadoDesignacion === 2).length;

          // state proportions
          const designacionesPorEstado = { Aceptada: 0, Cancelada: 0, Pendiente: 0, Finalizada: 0 };
          desList.forEach((d) => {
            if (d.estadoDesignacion === 0) designacionesPorEstado.Pendiente++;
            else if (d.estadoDesignacion === 1) designacionesPorEstado.Aceptada++;
            else if (d.estadoDesignacion === 2) designacionesPorEstado.Finalizada++;
            else if (d.estadoDesignacion === 3) designacionesPorEstado.Cancelada++;
          });

          // canchas count
          const canchaMap = {};
          const canchas = getDbTable("canchas");
          desList.forEach((d) => {
            const c = canchas.find((ch) => ch.idCancha === d.idCancha || ch.idCancha === d.canchaId);
            const name = c ? c.nombreCancha : "Cancha Desconocida";
            if (!canchaMap[d.idCancha]) {
              canchaMap[d.idCancha] = { idCancha: d.idCancha, nombreCancha: name, totalDesignaciones: 0, totalPartidos: 0 };
            }
            canchaMap[d.idCancha].totalDesignaciones++;
            if (d.estadoDesignacion === 2) {
              canchaMap[d.idCancha].totalPartidos++;
            }
          });
          const estadisticasCanchas = Object.values(canchaMap).sort((a, b) => b.totalDesignaciones - a.totalDesignaciones);

          // arbitros count and category share
          const arbMap = {};
          const categoryShare = {};
          const arbitros = getDbTable("arbitros");
          const designados = getDbTable("designados");

          desList.forEach((d) => {
            const matchDg = designados.filter((dg) => dg.idDesignacion === d.idDesignacion);
            matchDg.forEach((dg) => {
              const a = arbitros.find((arb) => arb.idArbitro === dg.idArbitro);
              if (a) {
                const name = `${a.apellido}, ${a.nombre}`;
                if (!arbMap[a.idArbitro]) {
                  arbMap[a.idArbitro] = { idArbitro: a.idArbitro, nombreCompleto: name, categoria: a.categoria, totalDesignaciones: 0, totalPartidos: 0, totalMontoPercibido: 0 };
                }
                arbMap[a.idArbitro].totalDesignaciones++;
                if (d.estadoDesignacion === 2) {
                  arbMap[a.idArbitro].totalPartidos++;
                  arbMap[a.idArbitro].totalMontoPercibido += dg.montoPercibido || d.montoPorArbitro || 150000;
                }

                categoryShare[a.categoria] = (categoryShare[a.categoria] || 0) + 1;
              }
            });
          });
          const estadisticasArbitros = Object.values(arbMap).sort((a, b) => b.totalDesignaciones - a.totalDesignaciones);

          responseData = {
            totalDesignaciones,
            totalPartidosDirigidos,
            designacionesPorEstado,
            designacionesPorCategoriaArbitro: categoryShare,
            estadisticasCanchas,
            estadisticasArbitros
          };
        }
        else if (url.startsWith("/designaciones/estadisticas/arbitro/") && method === "get") {
          const idArbitro = parseInt(url.split("/").pop(), 10);
          const inicio = params.inicio || "2000-01-01";
          const fin = params.fin || "2099-12-31";

          const allDes = getDbTable("designaciones");
          const allDg = getDbTable("designados");
          const canchas = getDbTable("canchas");
          const arbitros = getDbTable("arbitros");
          const a = arbitros.find((arb) => arb.idArbitro === idArbitro);
          
          const refereeDg = allDg.filter((dg) => dg.idArbitro === idArbitro);
          const refereeDesIds = refereeDg.map((dg) => dg.idDesignacion);
          
          const filteredDes = allDes.filter((d) => {
            const fd = d.fecha.split("T")[0];
            return refereeDesIds.includes(d.idDesignacion) && fd >= inicio && fd <= fin;
          });

          let totalMontoPercibido = 0;
          let totalPartidosDirigidos = 0;
          const canchaMap = {};
          const designacionesDetalle = [];

          filteredDes.forEach((d) => {
            const dg = refereeDg.find((dgItem) => dgItem.idDesignacion === d.idDesignacion);
            const c = canchas.find((ch) => ch.idCancha === d.idCancha);
            const nameCancha = c ? c.nombreCancha : "Cancha Desconocida";
            const amount = dg ? dg.montoPercibido : d.montoPorArbitro;

            if (d.estadoDesignacion === 2) {
              totalPartidosDirigidos++;
              totalMontoPercibido += amount;
            }

            if (!canchaMap[d.idCancha]) {
              canchaMap[d.idCancha] = { idCancha: d.idCancha, nombreCancha: nameCancha, totalDesignaciones: 0, totalPartidos: 0 };
            }
            canchaMap[d.idCancha].totalDesignaciones++;
            if (d.estadoDesignacion === 2) {
              canchaMap[d.idCancha].totalPartidos++;
            }

            let estadoText = "Pendiente";
            if (d.estadoDesignacion === 1) estadoText = "Aceptada";
            else if (d.estadoDesignacion === 2) estadoText = "Finalizada";
            else if (d.estadoDesignacion === 3) estadoText = "Cancelada";

            designacionesDetalle.push({
              idDesignacion: d.idDesignacion,
              nombreCancha: nameCancha,
              montoPercibido: amount,
              fecha: d.fecha,
              categoriaArbitroEnDesignacion: a ? a.categoria : "INCIAL",
              etapaCampeonato: d.etapaCampeonato,
              estadoDesignacion: estadoText,
              detalle: d.detalle
            });
          });

          responseData = {
            totalDesignaciones: filteredDes.length,
            totalPartidosDirigidos,
            totalMontoPercibido,
            estadisticasCanchas: Object.values(canchaMap),
            designacionesDetalle
          };
        }
        else if (url === "/designaciones/estadisticas/comparacion" && method === "get") {
          const idsStr = params.idsArbitros || "";
          const ids = idsStr.split(",").map((s) => parseInt(s, 10)).filter((id) => !isNaN(id));
          const mesInicio = parseInt(params.mesInicio, 10) || 1;
          const mesFin = parseInt(params.mesFin, 10) || 12;

          const allDes = getDbTable("designaciones");
          const allDg = getDbTable("designados");
          const arbitros = getDbTable("arbitros");
          const canchas = getDbTable("canchas");

          const currentYear = new Date().getFullYear();

          const comparacionArbitros = ids.map((idArbitro) => {
            const a = arbitros.find((arb) => arb.idArbitro === idArbitro);
            const name = a ? `${a.nombre} ${a.apellido}` : "Desconocido";

            const refereeDg = allDg.filter((dg) => dg.idArbitro === idArbitro);
            const refereeDesIds = refereeDg.map((dg) => dg.idDesignacion);
            
            const filteredDes = allDes.filter((d) => {
              const parts = d.fecha.split("-");
              const y = parseInt(parts[0], 10);
              const m = parseInt(parts[1], 10);
              return refereeDesIds.includes(d.idDesignacion) && y === currentYear && m >= mesInicio && m <= mesFin;
            });

            let totalMontoPercibido = 0;
            let totalPartidosDirigidos = 0;
            const designacionesPorEstado = { Finalizada: 0, Aceptada: 0, Pendiente: 0, Cancelada: 0 };
            const designacionesDetalle = [];

            filteredDes.forEach((d) => {
              const dg = refereeDg.find((dgItem) => dgItem.idDesignacion === d.idDesignacion);
              const c = canchas.find((ch) => ch.idCancha === d.idCancha);
              const amount = dg ? dg.montoPercibido : d.montoPorArbitro;

              if (d.estadoDesignacion === 0) designacionesPorEstado.Pendiente++;
              else if (d.estadoDesignacion === 1) designacionesPorEstado.Aceptada++;
              else if (d.estadoDesignacion === 2) {
                designacionesPorEstado.Finalizada++;
                totalPartidosDirigidos++;
                totalMontoPercibido += amount;
              }
              else if (d.estadoDesignacion === 3) designacionesPorEstado.Cancelada++;

              let estadoText = "Pendiente";
              if (d.estadoDesignacion === 1) estadoText = "Aceptada";
              else if (d.estadoDesignacion === 2) estadoText = "Finalizada";
              else if (d.estadoDesignacion === 3) estadoText = "Cancelada";

              designacionesDetalle.push({
                idDesignacion: d.idDesignacion,
                nombreCancha: c ? c.nombreCancha : "Cancha Desconocida",
                montoPercibido: amount,
                fecha: d.fecha,
                categoriaArbitroEnDesignacion: a ? a.categoria : "INCIAL",
                etapaCampeonato: d.etapaCampeonato,
                estadoDesignacion: estadoText,
                detalle: d.detalle
              });
            });

            return {
              idArbitro,
              nombreCompleto: name,
              totalDesignaciones: filteredDes.length,
              totalPartidosDirigidos,
              totalMontoPercibido,
              designacionesPorEstado,
              designacionesDetalle
            };
          });

          responseData = { comparacionArbitros };
        }

        // DESIGNADOS ENDPOINTS
        else if (url === "/designados" && method === "get") {
          const idDes = parseInt(params.idDesignacion, 10);
          const dgList = getDbTable("designados").filter((dg) => dg.idDesignacion === idDes);
          const arbitros = getDbTable("arbitros");
          
          responseData = dgList.map((dg) => {
            const arb = arbitros.find((a) => a.idArbitro === dg.idArbitro);
            return {
              idDesignado: dg.idDesignado,
              rol: dg.rol,
              montoPercibido: dg.montoPercibido,
              arbitro: arb || null,
              idArbitro: dg.idArbitro
            };
          });
        }
        else if (url === "/designados/eliminar-designado" && method === "delete") {
          const idDes = parseInt(params.idDesignacion, 10);
          const idDesignado = parseInt(params.idDesignado, 10);

          let dgList = getDbTable("designados");
          dgList = dgList.filter((dg) => dg.idDesignado !== idDesignado);
          saveDbTable("designados", dgList);

          // If referees are less than 3, change status back to Pending (0)
          const remaining = dgList.filter((dg) => dg.idDesignacion === idDes).length;
          if (remaining < 3) {
            const desList = getDbTable("designaciones");
            const idx = desList.findIndex((d) => d.idDesignacion === idDes);
            if (idx !== -1 && desList[idx].estadoDesignacion === 1) {
              desList[idx].estadoDesignacion = 0;
              saveDbTable("designaciones", desList);
            }
          }

          responseData = { success: true };
        }
        else if (url.includes("/actualizar-monto-percibido") && method === "put") {
          // PUT /designados/{idDesignado}/actualizar-monto-percibido
          const parts = url.split("/");
          const idDesignado = parseInt(parts[parts.indexOf("designados") + 1], 10);
          const nuevoMonto = parseFloat(params.nuevoMonto);

          const dgList = getDbTable("designados");
          const idx = dgList.findIndex((dg) => dg.idDesignado === idDesignado);
          if (idx !== -1) {
            dgList[idx].montoPercibido = nuevoMonto;
            saveDbTable("designados", dgList);
            responseData = dgList[idx];
          } else {
            return reject({ response: { status: 404, data: { message: "Designado no encontrado" } } });
          }
        }
        else if (url === "/designados/actualizar-monto-a-designados" && method === "put") {
          const idDes = parseInt(params.idDesignacion, 10);
          const montoPorArbitro = parseFloat(params.montoPorArbitro);

          const dgList = getDbTable("designados");
          dgList.forEach((dg) => {
            if (dg.idDesignacion === idDes) {
              dg.montoPercibido = montoPorArbitro;
            }
          });
          saveDbTable("designados", dgList);

          const desList = getDbTable("designaciones");
          const idx = desList.findIndex((d) => d.idDesignacion === idDes);
          if (idx !== -1) {
            desList[idx].montoPorArbitro = montoPorArbitro;
            saveDbTable("designaciones", desList);
          }

          responseData = { success: true };
        }

        // BACKUPS ENDPOINTS
        else if (url.startsWith("/backup") && method === "get") {
          responseData = { canchas: getDbTable("canchas"), arbitros: getDbTable("arbitros"), designaciones: getDbTable("designaciones") };
        }
        else if (url.startsWith("/backup") && method === "post") {
          responseData = { success: true, message: "Backup restaurado (Simulado)" };
        }

        // DEFAULT FALLBACK FOR UNHANDLED PATHS
        else {
          console.warn(`[Mock DB] Unhandled endpoint: ${method} ${url}`);
          responseData = { status: true, info: "Unhandled endpoint mocked successfully" };
        }

        // Return standard resolved response
        resolve({
          data: responseData,
          status: 200,
          statusText: "OK",
          headers: {},
          config
        });

      } catch (err) {
        console.error("[Mock DB Error]", err);
        reject({
          response: {
            status: 500,
            data: { message: "Error interno de base de datos simulada: " + err.message }
          }
        });
      }
    }, LATENCY);
  });
};
