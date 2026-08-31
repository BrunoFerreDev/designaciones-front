export const getCategoryLabel = (cat) => {
  const map = {
    ELITE: "Elite",
    AVANZADO: "Avanzado",
    INTERMEDIO_ALTO: "Intermedio Alto",
    INTERMEDIO: "Intermedio",
    INTERMEDIO_BAJO: "Intermedio Bajo",
    PRINCIPAL_1: "Principal 1",
    PRINCIPAL_2: "Principal 2",
    PRINCIPAL_3: "Principal 3",
    PRINCIPAL_4: "Principal 4",
    EN_FORMACION: "En Formación",
    INICIAL: "Inicial",
    INCIAL: "Inicial",
    ASISTENTE: "Asistente",
  };
  return map[cat] || (cat ? String(cat).replace(/_/g, " ") : "Inicial");
};

export const getCategoryBadgeClass = (cat) => {
  const map = {
    ELITE: "badge-green",
    AVANZADO: "badge-blue",
    INTERMEDIO_ALTO: "badge-blue",
    INTERMEDIO: "badge-amber",
    INTERMEDIO_BAJO: "badge-amber",
    PRINCIPAL_1: "badge-blue",
    PRINCIPAL_2: "badge-blue",
    PRINCIPAL_3: "badge-amber",
    PRINCIPAL_4: "badge-amber",
    EN_FORMACION: "badge-gray",
    INICIAL: "badge-red",
    INCIAL: "badge-red",
    ASISTENTE: "badge-gray",
  };
  return map[cat] || "badge-gray";
};

export const getCategoryProgressBarClass = (cat) => {
  const map = {
    ELITE: "bg-emerald-600",
    AVANZADO: "bg-blue-600",
    INTERMEDIO_ALTO: "bg-cyan-600",
    INTERMEDIO: "bg-amber-500",
    INTERMEDIO_BAJO: "bg-orange-400",
    PRINCIPAL_1: "bg-blue-600",
    PRINCIPAL_2: "bg-cyan-600",
    PRINCIPAL_3: "bg-amber-500",
    PRINCIPAL_4: "bg-orange-500",
    EN_FORMACION: "bg-slate-400",
    INICIAL: "bg-rose-500",
    INCIAL: "bg-rose-500",
    ASISTENTE: "bg-slate-500",
  };
  return map[cat] || "bg-emerald-500";
};

export const getEstadoColor = (estado) => {
  if (!estado) return "#64748b";
  const norm = String(estado).toUpperCase();
  if (norm.includes("FIN") || norm.includes("COMPLETA")) return "#0f6e56";
  if (norm.includes("ACEPTADA")) return "#185fa5";
  if (norm.includes("PENDIENTE")) return "#d97706";
  if (norm.includes("CANCEL")) return "#ef4444";
  if (norm.includes("SUSPEND")) return "#7c3aed";
  return "#64748b";
};

export const getEstadoBgColor = (estado) => {
  if (!estado) return "#f1f5f9";
  const norm = String(estado).toUpperCase();
  if (norm.includes("FIN") || norm.includes("COMPLETA")) return "#ecfdf5";
  if (norm.includes("ACEPTADA")) return "#eff6ff";
  if (norm.includes("PENDIENTE")) return "#fffbeb";
  if (norm.includes("CANCEL")) return "#fef2f2";
  if (norm.includes("SUSPEND")) return "#f5f3ff";
  return "#f1f5f9";
};

export const getEtapaLabel = (etapa) => {
  if (!etapa) return "-";
  return String(etapa).replace(/_/g, " ");
};

export const getPorcentaje = (val, total) => {
  if (!total || !val) return 0;
  return Math.min(100, Math.round((val / total) * 100));
};
