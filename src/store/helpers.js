import { computed } from "vue";
import { state } from "./state";

export const getCancha = (id) =>
  state.canchas.find(
    (c) =>
      c.id === id ||
      c.idCancha === id ||
      String(c.id) === String(id) ||
      String(c.idCancha) === String(id),
  );

export const isCanchaActiva = (c) => {
  if (!c) return false;
  if (c.estado !== undefined) return Boolean(c.estado);
  return true;
};

export const getArbitro = (id) =>
  state.arbitros.find((a) => a.idArbitro === id) ||
  (state.arbitrosNoDisponibles || []).find((a) => a.idArbitro === id);

export const isArbitroActivo = (a) => {
  if (!a) return false;
  if (a.estadoSistema !== undefined) return a.estadoSistema !== false;
  if (a.estado !== undefined) return a.estado !== false;
  return true;
};

export const disponiblesCount = computed(
  () =>
    state.arbitros.filter(
      (a) => isArbitroActivo(a) && (a.disponibleSabado || a.disponibleDomingo),
    ).length,
);
export const noDisponiblesCount = computed(
  () =>
    state.arbitros.filter(
      (a) => isArbitroActivo(a) && !a.disponibleSabado && !a.disponibleDomingo,
    ).length,
);
export const disponiblesSabadoCount = computed(
  () =>
    state.arbitros.filter((a) => isArbitroActivo(a) && a.disponibleSabado)
      .length,
);

export const disponiblesDomingoCount = computed(
  () =>
    state.arbitros.filter((a) => isArbitroActivo(a) && a.disponibleDomingo)
      .length,
);

export const calcStatus = (partidos) => {
  if (partidos >= 7) return { label: "Alta carga", cls: "badge-red" };
  if (partidos >= 5) return { label: "Media-alta", cls: "badge-amber" };
  if (partidos >= 3) return { label: "Normal", cls: "badge-green" };
  return { label: "Baja", cls: "badge-gray" };
};

export const minArbitros = (partidos) => (partidos >= 5 ? 4 : 3);

export const formatFecha = (fechaStr) => {
  if (!fechaStr) return "";
  try {
    const diasSemana = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];

    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    if (fechaStr.includes("T")) {
      const [datePart, timePart] = fechaStr.split("T");
      const [yyyy, mm, dd] = datePart.split("-").map(Number);
      const [hh, min] = timePart.split(":").map(Number);

      const dateObj = new Date(yyyy, mm - 1, dd);
      const nombreDia = diasSemana[dateObj.getDay()];

      const hhStr = String(hh).padStart(2, "0");
      const minStr = String(min).padStart(2, "0");

      if (hh === 0 && min === 0) {
        return `${nombreDia} ${dd} de ${meses[mm - 1]} (Horario a confirmar)`;
      }

      const timePartFormatted =
        min === 0 ? `${hhStr}hs` : `${hhStr}:${minStr}hs`;
      return `${nombreDia} ${dd} de ${meses[mm - 1]} a las ${timePartFormatted}`;
    } else {
      const parts = fechaStr.split("-").map(Number);
      if (parts.length === 3) {
        const [yyyy, mm, dd] = parts;
        const dateObj = new Date(yyyy, mm - 1, dd);
        const nombreDia = diasSemana[dateObj.getDay()];
        return `${nombreDia} ${dd} de ${meses[mm - 1]}`;
      }
    }
  } catch (e) {
    console.warn("Error formatting date", e);
  }
  return fechaStr;
};

export const sortDesignaciones = (list) => {
  if (!Array.isArray(list)) return [];
  const parseTime = (raw) => {
    if (!raw) return 0;
    const val =
      typeof raw === "object" && !(raw instanceof Date) && !Array.isArray(raw)
        ? raw.fecha ||
          raw.fechaDesignacion ||
          raw.Designacion?.fecha ||
          raw.designacion?.fecha ||
          raw
        : raw;
    if (!val) return 0;
    if (val instanceof Date) return val.getTime();
    if (typeof val === "number") return val;
    if (Array.isArray(val)) {
      const [y = 0, m = 1, d = 1, h = 0, min = 0, s = 0] = val;
      return new Date(y, m - 1, d, h, min, s).getTime();
    }
    if (typeof val === "string") {
      const match = val.match(
        /(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/,
      );
      if (match) {
        return new Date(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3]),
          Number(match[4] || 0),
          Number(match[5] || 0),
          Number(match[6] || 0),
        ).getTime();
      }
      const parsed = new Date(val).getTime();
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  return list.slice().sort((a, b) => {
    const timeA = parseTime(a);
    const timeB = parseTime(b);
    if (timeA !== timeB) {
      return timeB - timeA; // Descendente: de más recientes a más viejas
    }
    const nameA = a.cancha?.nombreCancha || a.cancha?.nombre || "";
    const nameB = b.cancha?.nombreCancha || b.cancha?.nombre || "";
    return nameA.localeCompare(nameB);
  });
};

export const getLocalDateString = (fechaStr) => {
  if (!fechaStr) return "";
  if (fechaStr instanceof Date) {
    const yyyy = fechaStr.getFullYear();
    const mm = String(fechaStr.getMonth() + 1).padStart(2, "0");
    const dd = String(fechaStr.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  const str = String(fechaStr);
  if (!str.includes("T") && !str.includes(" ")) {
    const datePart = str;
    const separator = datePart.includes("-")
      ? "-"
      : datePart.includes("/")
        ? "/"
        : "";
    if (separator) {
      const parts = datePart.split(separator).map(Number);
      if (parts.length === 3) {
        let yyyy, mm, dd;
        if (parts[0] > 1000) {
          [yyyy, mm, dd] = parts;
        } else {
          [dd, mm, yyyy] = parts;
        }
        return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
      }
    }
    return str;
  }
  const hasTimezone =
    str.includes("Z") ||
    str.includes("+") ||
    (str.split("T")[1] && str.split("T")[1].includes("-"));
  if (hasTimezone) {
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  return str.split(/[T ]/)[0];
};

export const getDayOfWeekLocal = (fechaStr) => {
  if (!fechaStr) return -1;
  try {
    if (fechaStr instanceof Date) {
      return fechaStr.getDay();
    }
    const localDateStr = getLocalDateString(fechaStr);
    const parts = localDateStr.split("-").map(Number);
    if (parts.length === 3) {
      const [yyyy, mm, dd] = parts;
      const dateObj = new Date(yyyy, mm - 1, dd);
      return dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    }
  } catch (e) {
    console.warn("Error parsing date in getDayOfWeekLocal", e);
  }
  return -1;
};

export const isRefereeAssignedToDifferentCourtOnSameDay = (
  idArbitro,
  targetDes,
) => {
  const targetDateStr = targetDes.fecha ? targetDes.fecha.split("T")[0] : "";
  const targetCanchaId =
    targetDes.idCancha ||
    targetDes.canchaId ||
    targetDes.cancha?.idCancha ||
    targetDes.cancha?.id;

  if (!targetDateStr) return false;

  const allLists = [
    ...state.designacionesIncompletas,
    ...state.designaciones,
    ...state.designacionesFinalizadas,
    ...state.designacionesAConfirmar,
    ...(state.designacionesAceptadas || []),
  ];

  for (const otherD of allLists) {
    const otherId = otherD.idDesignacion || otherD.id;
    const targetId = targetDes.idDesignacion || targetDes.id;
    if (otherId !== targetId) {
      const otherDateStr = otherD.fecha ? otherD.fecha.split("T")[0] : "";
      if (otherDateStr && otherDateStr === targetDateStr) {
        const assigned = state.arbitrosDesignadosMap[otherId] || [];
        const isAssigned = assigned.some(
          (asg) => (asg.arbitro?.idArbitro || asg.idArbitro) === idArbitro,
        );
        if (isAssigned) {
          const otherCanchaId =
            otherD.idCancha ||
            otherD.canchaId ||
            otherD.cancha?.idCancha ||
            otherD.cancha?.id;
          if (String(otherCanchaId) !== String(targetCanchaId)) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

export const ESTADOS_DESIGNACION = [
  { id: 0, label: "Pendiente a completar", shortLabel: "Pendiente", badge: "badge-amber", color: "#d97706", bg: "#fef3c7" },
  { id: 1, label: "Aceptada", shortLabel: "Aceptada", badge: "badge-blue", color: "#185fa5", bg: "#e0f2fe" },
  { id: 2, label: "Jornada finalizada", shortLabel: "Finalizada", badge: "badge-green", color: "#0f6e56", bg: "#e1f5ee" },
  { id: 3, label: "Jornada cancelada", shortLabel: "Cancelada", badge: "badge-red", color: "#b91c1c", bg: "#fee2e2" },
  { id: 4, label: "Suspendida en juego", shortLabel: "Suspendida", badge: "badge-purple", color: "#7e22ce", bg: "#f3e8ff" },
];

export const getEstadoDesignacionInfo = (estado) => {
  const num = Number(estado);
  const found = ESTADOS_DESIGNACION.find((e) => e.id === num);
  return found || { id: num, label: "Desconocido", shortLabel: "Desconocido", badge: "badge-gray", color: "#64748b", bg: "#f1f5f9" };
};

export const formatLocalDateTime = (dateStr) => {
  if (!dateStr) return "";
  let s = String(dateStr).trim();
  if (s.includes(" ")) {
    s = s.replace(" ", "T");
  }
  const parts = s.split("T");
  if (parts.length === 2) {
    const timeParts = parts[1].split(":");
    if (timeParts.length === 2) {
      return `${parts[0]}T${timeParts[0]}:${timeParts[1]}:00`;
    }
  }
  return s;
};
