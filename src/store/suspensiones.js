import { state } from "./state";
import { getArbitro } from "./helpers";
import {
  persistSuspensionesStorage,
  updateSuspensionInStorage,
  removeSuspensionFromStorage,
} from "./storage";
import suspencionService from "../services/suspencionService";
import arbitroService from "../services/arbitroService";

export const loadSuspensiones = async () => {
  try {
    const res = await suspencionService.getAll();
    state.suspensiones = Array.isArray(res) ? res : res.content || res;
    persistSuspensionesStorage(state);
  } catch (e) {
    console.warn("Failed to load suspensiones, using local state", e);
  }
};

export const saveSuspencion = async (dto) => {
  try {
    const idArbitro = dto.arbitro || dto.idArbitro;
    const created = await suspencionService.create(idArbitro, dto);
    const newSusp = {
      id: created?.id || created?.idSuspencion || state.nextSuspId++,
      ...dto,
      ...created,
    };
    updateSuspensionInStorage(state, newSusp);

    if (dto.tipoSuspencion === 2) {
      const arb = getArbitro(dto.arbitro);
      if (arb && arb.estado) {
        arb.estado = false;
        try {
          await arbitroService.updateDisponibilidad(dto.arbitro);
        } catch (err) {
          console.warn("Failed to persist availability change in backend", err);
        }
      }
    }
    return newSusp;
  } catch (e) {
    console.warn("create suspencion failed, using local fallback", e);
    const newSusp = {
      id: state.nextSuspId++,
      ...dto,
    };
    updateSuspensionInStorage(state, newSusp);

    if (dto.tipoSuspencion === 2) {
      const arb = getArbitro(dto.arbitro);
      if (arb && arb.estado) {
        arb.estado = false;
      }
    }
    return newSusp;
  }
};

export const deleteSuspencion = async (idSuspencion) => {
  if (!confirm("¿Deseas eliminar/revocar esta sanción?")) return;
  removeSuspensionFromStorage(state, idSuspencion);
  try {
    await suspencionService.deleteSuspencion(idSuspencion);
  } catch (e) {
    console.warn("delete suspencion backend failed, kept local removal", e);
  }
};
