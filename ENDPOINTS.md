# Documentación de Endpoints del Backend

Listado completo y detallado de los endpoints de la API de Designaciones.

---

## 1. Árbitros (`/arbitros`)

Administración de árbitros, disponibilidades, estados y suspensiones.

| Método | Endpoint | Parámetros / Body | Respuesta | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/arbitros` | **Body:** `ArbitroDTO` (incluye `estadoSistema`) | `GetArbitroDTO` | Registra un nuevo árbitro en el sistema. |
| `PUT` | `/arbitros/{idArbitro}` | **Path:** `idArbitro` (Long)<br>**Body:** `ArbitroDTO` | `GetArbitroDTO` | Modifica los datos personales y de contacto de un árbitro existente. |
| `GET` | `/arbitros` | **Query:** `page` (int), `size` (int) | `Page<GetArbitroDTO>` | Obtiene el listado general y paginado de árbitros. |
| `GET` | `/arbitros/no-disponibles` | **Query:** `page` (int), `size` (int) | `Page<GetArbitroDTO>` | Lista árbitros que no están disponibles para ser designados. |
| `PUT` | `/arbitros/{idArbitro}/disponibilidad` | **Path:** `idArbitro` (Long)<br>**Body:** `ArbitroDisponibilidadDTO` (`estadoSistema`, `disponibleSabado`, `disponibleDomingo`) | `GetArbitroDTO` | Actualiza los días y franjas de disponibilidad de un árbitro. |
| `GET` | `/arbitros/traer-disponibles` | **Query:** `page` (int), `size` (int) | `Page<GetArbitroDTO>` | Retorna todos los árbitros activos y marcados como disponibles. |
| `DELETE` | `/arbitros/{idArbitro}` | **Path:** `idArbitro` (Long) | `String` | Elimina un árbitro del sistema. |
| `POST` | `/arbitros/{idArbitro}/toggle` | **Path:** `idArbitro` (Long) | `GetArbitroDTO` | Conmuta la propiedad `estadoSistema` (habilitado/deshabilitado) de un árbitro. |
| `PUT` | `/arbitros/modificar-disponibilidad-total` | *Ninguno* | `String` | Actualiza o restablece masivamente la disponibilidad de todos los árbitros. |
| `GET` | `/arbitros/{idArbitro}/suspenciones` | **Path:** `idArbitro` (Long)<br>**Query:** `page` (int), `size` (int) | `Page<GetSuspencionDTO>` | Consulta el historial de sanciones/suspensiones de un árbitro específico. |
| `POST` | `/arbitros/{idArbitro}/suspenciones` | **Path:** `idArbitro` (Long)<br>**Body:** `SuspencionDTO` | `GetSuspencionDTO` | Registra una nueva suspensión para el árbitro indicado. |
| `GET` | `/arbitros/suspenciones` | **Query:** `page` (int), `size` (int) | `Page<GetSuspencionDTO>` | Lista todas las suspensiones globales registradas en el sistema. |
| `DELETE` | `/arbitros/suspenciones/{idSuspencion}` | **Path:** `idSuspencion` (Long) | `String` | Elimina o levanta una sanción/suspensión por su ID. |
| `GET` | `/arbitros/designaciones` | **Query:** `idArbitro` (Long), `page` (int), `size` (int) | `Page<GetDesignacionDTO>` | Obtiene el historial de designaciones asignadas a un árbitro. |

---

## 2. Autenticación (`/auth`)

Control de acceso y seguridad mediante tokens JWT.

| Método | Endpoint | Parámetros / Body | Respuesta | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | **Body:** `AuthLogin` (`username`, `password`) | `AuthResponse` | Autentica las credenciales y genera el token Bearer JWT con roles y expiración. |
| `POST` | `/auth/logout` | **Header:** `Authorization: Bearer <token>` | `String` | Cierra la sesión activa del usuario e invalida el contexto de seguridad. |

## 3. Canchas (`/canchas`)

Administración de canchas, predios y estados de operatividad.

| Método | Endpoint | Parámetros / Body | Respuesta | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/canchas` | **Query:** `page` (int), `size` (int) | `Page<GetCanchaDTO>` | Lista paginada de todas las canchas registradas. |
| `GET` | `/canchas/activas` | **Query:** `page` (int), `size` (int) | `Page<GetCanchaDTO>` | Lista únicamente las canchas que están actualmente habilitadas para juego. |
| `PUT` | `/canchas/{idCancha}/toggle` | **Path:** `idCancha` (Long) | `Void` (204) | Alterna el estado activo/inactivo de una cancha. |
| `POST` | `/canchas` | **Body:** `CanchaDTO` | `GetCanchaDTO` | Registra una nueva cancha en el sistema. |
| `GET` | `/canchas/designaciones` | **Query:** `idCancha` (Long), `page` (int), `size` (int) | `Page<GetDesignacionDTO>` | Retorna todas las designaciones asociadas a una cancha determinada. |
| `PUT` | `/canchas/actualizar/{idCancha}` | **Path:** `idCancha` (Long)<br>**Body:** `CanchaDTO` | `GetCanchaDTO` | Actualiza la información y configuración de una cancha existente. |

---

## 4. Designaciones (`/designaciones`)

Gestión de jornadas, asignación de árbitros, estados del partido y reportes estadísticos.

| Método | Endpoint | Parámetros / Body | Respuesta | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/designaciones` | **Body:** `DesignacionDTO` | `GetDesignacionDTO` | Crea una nueva jornada de designación. |
| `PUT` | `/designaciones/{idDesignacion}` | **Path:** `idDesignacion` (Long)<br>**Body:** `DesignacionDTO` | `GetDesignacionDTO` | Modifica datos generales de una designación (cancha, fecha, aranceles, etc.). |
| `GET` | `/designaciones/{idDesignacion}` | **Path:** `idDesignacion` (Long) | `GetDesignacionDTO` | Obtiene el detalle completo de una designación por su identificador. |
| `POST` | `/designaciones/{idDesignacion}/sincronizar-arancel` | **Path:** `idDesignacion` (Long) | `String` | Calcula y sincroniza automáticamente los montos y aranceles según la cancha y partidos. |
| `GET` | `/designaciones/mes` | **Query:** `mes` (int), `anio` (int) | `List<GetDesignacionDTO>` | Obtiene todas las designaciones calendarizadas para un mes y año dados. |
| `PUT` | `/designaciones/{idDesignacion}/cambiar-cancelado` | **Path:** `idDesignacion` (Long)<br>**Query:** `detalle` (String) | `GetDesignacionDTO` | Pasa la designación a estado **Cancelada** (estado 3) indicando el motivo. |
| `GET` | `/designaciones/buscar` | **Query:** `inicio` (LocalDate `YYYY-MM-DD`, opcional), `fin` (LocalDate `YYYY-MM-DD`, opcional), `fecha` (LocalDate `YYYY-MM-DD`, opcional) | `List<GetDesignacionDTO>` | Busca designaciones en un rango o para una fecha puntual (unificado). |
| `GET` | `/designaciones` | **Query:** `estado` (int, default: 1), `page` (int), `size` (int) | `Page<GetDesignacionDTO>` | Lista paginada por estado *(0: Pendiente, 1: Aceptada, 2: Finalizada, 3: Cancelada)*. |
| `PUT` | `/designaciones/{idDesignacion}/finalizar` | **Path:** `idDesignacion` (Long)<br>**Query:** `detalle` (String, opcional) | `GetDesignacionDTO` | Marca la jornada como **Finalizada** (estado 2) e impacta las estadísticas/finanzas. |
| `PUT` | `/designaciones/{idDesignacion}/aceptar` | **Path:** `idDesignacion` (Long) | `GetDesignacionDTO` | Confirma y pasa la designación a estado **Aceptada** (estado 1). |
| `PUT` | `/designaciones/{idDesignacion}/reprogramar` | **Path:** `idDesignacion` (Long) | `GetDesignacionDTO` | Marca la designación para reprogramación. |
| `POST` | `/designaciones/{idDesignacion}/arbitros` | **Path:** `idDesignacion` (Long)<br>**Query:** `idArbitro` (Long), `forzar` (boolean, default: false), `historico` (boolean, default: false) | `GetDesignacionDTO` | **Endpoint Unificado de Asignación**: Asigna un árbitro en modo normal, forzado o histórico. |
| `DELETE` | `/designaciones/{idDesignacion}/arbitros/{idArbitro}` | **Path:** `idDesignacion` (Long), `idArbitro` (Long) | `GetDesignacionDTO` | Desvincula a un árbitro de la designación y actualiza el estado si queda incompleta. |
| `DELETE` | `/designaciones/{idDesignacion}` | **Path:** `idDesignacion` (Long) | `Void` (204) | Elimina por completo una designación. |
| `POST` | `/designaciones/{idDesignacion}/arbitros/bulk` | **Path:** `idDesignacion` (Long)<br>**Body:** `List<Long>` (idsArbitros) | `GetDesignacionDTO` | Asigna masivamente una lista de árbitros a la jornada. |
| `GET` | `/designaciones/estadisticas` | **Query:** `inicio` (LocalDate, opcional), `fin` (LocalDate, opcional) | `GetEstadisticasDesignacionesDTO` | Obtiene métricas generales de partidos, importes y designaciones en un periodo. |
| `GET` | `/designaciones/estadisticas/arbitro/{idArbitro}` | **Path:** `idArbitro` (Long)<br>**Query:** `inicio` (LocalDate, opcional), `fin` (LocalDate, opcional) | `GetEstadisticasArbitroDetalleDTO` | Retorna estadísticas individuales de desempeño y partidos de un árbitro. |
| `GET` | `/designaciones/estadisticas/comparacion` | **Query:** `idsArbitros` (List<Long>), `mesInicio` (int, default: 1), `mesFin` (int, default: 12) | `GetComparacionEstadisticasArbitrosDTO` | Comparativa estadística de actividad e ingresos entre múltiples árbitros. |
| `GET` | `/designaciones/ultimas-designaciones` | *Ninguno* | `List<GetDesignacionDTO>` | Retorna las designaciones más recientes cargadas en el sistema. |

### Cómo realizar las peticiones en `/designaciones/{idDesignacion}/arbitros`:
- **Asignación Normal**: `POST /designaciones/10/arbitros?idArbitro=5` (Aplica todas las validaciones de etapa, chofer, cancha repetida, etc.)
- **Asignación Forzada**: `POST /designaciones/10/arbitros?idArbitro=5&forzar=true` (Omite restricciones de etapa y cancha repetida si es necesario)
- **Asignación Histórica**: `POST /designaciones/10/arbitros?idArbitro=5&historico=true` (Carga histórica directa sin validaciones en tiempo real)

---

## 5. Designados (`/designados`)

Operaciones sobre los árbitros asignados a cada jornada y sus importes percibidos.

| Método | Endpoint | Parámetros / Body | Respuesta | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/designados` | **Query:** `idDesignacion` (Long) | `List<GetDesignadosDTO>` | Lista todos los árbitros designados a una jornada con sus datos y montos asignados. |
| `DELETE` | `/designados/eliminar-designado` | **Query:** `idDesignacion` (Long), `idDesignado` (Long) | `Void` (204) | Elimina un registro de árbitro designado por ID de asignación. |
| `PUT` | `/designados/{idDesignado}/actualizar-monto-percibido` | **Path:** `idDesignado` (Long)<br>**Query:** `nuevoMonto` (BigDecimal) | `String` | Modifica el monto a percibir asignado a un árbitro designado específico. |
| `PUT` | `/designados/actualizar-monto-a-designados` | **Query:** `idDesignacion` (Long), `montoPorArbitro` (BigDecimal) | `String` | Actualiza de forma uniforme el monto a cobrar para todos los designados de la jornada. |
| `PUT` | `/designados/actualizar-cantidad-partidos` | **Query:** `idDesignacion` (Long), `idDesignado` (Long), `cantidad` (int) | `String` | Asigna o modifica la cantidad de partidos dirigidos por un árbitro en esa designación. |

---

## 6. Notificaciones (`/api/notificaciones`)

Transmisión de eventos en tiempo real hacia el cliente web.

| Método | Endpoint | Parámetros / Body | Respuesta | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/notificaciones/subscribe` | *Ninguno* | `SseEmitter` (`text/event-stream`) | Establece una conexión SSE (Server-Sent Events) para recibir notificaciones y cambios de estado en vivo. |
