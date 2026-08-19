<template>
  <div>
    <div class="topbar">
      <div>
        <div class="topbar-title">Designaciones</div>
        <div class="topbar-sub">Asignación de árbitros por cancha</div>
      </div>
      <div class="topbar-actions">
        <button
          v-if="
            filteredCompletas.length > 0 ||
            filteredIncompletas.length > 0 ||
            filteredFinalizadas.length > 0 ||
            filteredAceptadas.length > 0
          "
          class="btn"
          @click="openModal('arbitrosPorDia')"
          style="border-color: #3b82f6; color: #3b82f6; background: transparent"
          onmouseover="this.style.background = '#f0f7ff'"
          onmouseout="this.style.background = 'transparent'"
        >
          <i class="ti ti-calendar-event" style="font-size: 16px"></i>Árbitros
          por día
        </button>
        <button
          v-if="
            filteredCompletas.length > 0 ||
            filteredIncompletas.length > 0 ||
            filteredFinalizadas.length > 0 ||
            filteredAceptadas.length > 0
          "
          class="btn"
          @click="openModal('comparativaWeekend')"
          style="border-color: #f59e0b; color: #d97706; background: transparent"
          onmouseover="this.style.background = '#fffbeb'"
          onmouseout="this.style.background = 'transparent'"
        >
          <i class="ti ti-git-compare" style="font-size: 16px"></i>Comparativa
          Finde
        </button>
        <button
          v-if="filteredCompletas.length > 0"
          class="btn"
          @click="openModal('whatsappMessage')"
          style="border-color: #25d366; color: #25d366; background: transparent"
          onmouseover="this.style.background = '#e8f9f0'"
          onmouseout="this.style.background = 'transparent'"
        >
          <i class="ti ti-brand-whatsapp" style="font-size: 16px"></i>Compartir
          WhatsApp
        </button>
        <button class="btn primary" @click="openModal('addDesignacion')">
          <i class="ti ti-plus"></i>Nueva designación
        </button>
      </div>
    </div>

    <div class="content animate-fade-in">
      <!-- Buscador de Árbitros en Tiempo Real -->
      <div
        class="card"
        style="
          margin-bottom: 1.5rem;
          padding: 12px 16px;
          border-radius: var(--border-radius-md);
        "
      >
        <div
          style="
            position: relative;
            display: flex;
            align-items: center;
            width: 100%;
          "
        >
          <i
            class="ti ti-search"
            style="
              position: absolute;
              left: 12px;
              color: var(--color-text-secondary);
              font-size: 16px;
            "
          ></i>
          <input
            type="text"
            v-model="searchRefereeQuery"
            placeholder="Buscar árbitro por nombre o apellido para ver sus canchas asignadas..."
            class="form-input"
            style="
              padding-left: 36px;
              padding-right: 36px;
              margin-bottom: 0;
              width: 100%;
              border-radius: 8px;
              border: 1px solid var(--color-border-primary);
              height: 38px;
              font-size: 13px;
            "
          />
          <button
            v-if="searchRefereeQuery"
            @click="searchRefereeQuery = ''"
            style="
              position: absolute;
              right: 12px;
              border: none;
              background: transparent;
              cursor: pointer;
              color: var(--color-text-secondary);
              display: flex;
              align-items: center;
            "
          >
            <i class="ti ti-x" style="font-size: 16px"></i>
          </button>
        </div>

        <!-- Panel de Resultados del Buscador -->
        <div
          v-if="searchRefereeQuery.trim() !== ''"
          class="animate-fade-in"
          style="
            margin-top: 12px;
            border-top: 1px dashed var(--color-border-tertiary);
            padding-top: 12px;
          "
        >
          <div
            style="
              font-size: 12px;
              font-weight: 600;
              color: var(--color-text-secondary);
              margin-bottom: 8px;
            "
          >
            ⚽ Canchas y designaciones del árbitro:
          </div>

          <div
            v-if="filteredRefMatchList.length === 0"
            style="
              font-size: 12px;
              color: var(--color-text-secondary);
              font-style: italic;
              padding: 4px 0;
            "
          >
            No se encontraron designaciones activas para "{{
              searchRefereeQuery
            }}" en este fin de semana.
          </div>

          <div v-else style="display: flex; flex-direction: column; gap: 8px">
            <div
              v-for="match in filteredRefMatchList"
              :key="match.id"
              class="card"
              style="
                padding: 10px 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--color-background-secondary);
                border-color: var(--color-border-tertiary);
                font-size: 12px;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
                border-radius: 8px;
              "
            >
              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  flex-wrap: wrap;
                "
              >
                <span
                  style="font-weight: 600; color: var(--color-text-primary)"
                >
                  🏃‍♂️ {{ match.refereeName }}
                </span>
                <span style="color: var(--color-text-secondary)">en</span>
                <span
                  style="
                    font-weight: 600;
                    color: var(--color-primary);
                    display: flex;
                    align-items: center;
                    gap: 2px;
                  "
                >
                  🏟️ {{ match.canchaName }}
                </span>
                <span style="color: var(--color-text-secondary)">·</span>
                <span
                  style="color: var(--color-text-secondary); font-weight: 500"
                >
                  {{ match.fechaFormateada }}
                </span>
              </div>

              <div style="display: flex; align-items: center; gap: 8px">
                <span
                  class="badge badge-gray"
                  style="font-size: 8px; padding: 1px 5px"
                >
                  {{ match.rol }}
                </span>
                <span
                  :class="['badge', match.statusClass]"
                  style="font-size: 8px; padding: 1px 5px"
                >
                  {{ match.statusLabel }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Designaciones Incompletas -->
      <div v-if="filteredIncompletas.length > 0">
        <div class="alert alert-warning">
          <i class="ti ti-alert-triangle"></i>
          {{ filteredIncompletas.length }} designación(es) por completar -
          Asigna árbitros
        </div>

        <div style="margin-bottom: 2rem">
          <div
            style="
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 1rem;
              color: var(--color-text-secondary);
            "
          >
            📋 Pendientes a Completar (Incompletas)
          </div>
          <div class="grid-2">
            <!-- Columna Sábado -->
            <div>
              <div
                style="
                  font-weight: 600;
                  font-size: 13px;
                  color: var(--color-text-secondary);
                  margin-bottom: 8px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                "
              >
                <span
                  style="
                    background: #faeeda;
                    color: #854f0b;
                    padding: 2px 8px;
                    border-radius: 12px;
                  "
                  >Sábado</span
                >
              </div>
              <div
                v-if="incSabado.length === 0"
                style="
                  padding: 1rem;
                  border: 1px dashed var(--color-border-tertiary);
                  border-radius: var(--border-radius-lg);
                  text-align: center;
                  color: var(--color-text-secondary);
                  font-size: 12px;
                  margin-bottom: 1rem;
                  background: var(--color-background-primary);
                "
              >
                Sin designaciones pendientes para el sábado
              </div>
              <div class="flex flex-col gap-3">
                <DesignacionCard
                  v-for="d in incSabado"
                  :key="`inc-${d.idDesignacion || d.id}`"
                  :designacion="d"
                  :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
                  show-ver-arbitros-btn
                  @ver-arbitros="verArbitros"
                  @action-complete="onActionComplete"
                />
              </div>
            </div>

            <!-- Columna Domingo -->
            <div>
              <div
                style="
                  font-weight: 600;
                  font-size: 13px;
                  color: var(--color-text-secondary);
                  margin-bottom: 8px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                "
              >
                <span
                  style="
                    background: #faeeda;
                    color: #854f0b;
                    padding: 2px 8px;
                    border-radius: 12px;
                  "
                  >Domingo</span
                >
              </div>
              <div
                v-if="incDomingo.length === 0"
                style="
                  padding: 1rem;
                  border: 1px dashed var(--color-border-tertiary);
                  border-radius: var(--border-radius-lg);
                  text-align: center;
                  color: var(--color-text-secondary);
                  font-size: 12px;
                  margin-bottom: 1rem;
                  background: var(--color-background-primary);
                "
              >
                Sin designaciones pendientes para el domingo
              </div>
              <div class="flex flex-col gap-3">
                <DesignacionCard
                  v-for="d in incDomingo"
                  :key="`inc-${d.idDesignacion || d.id}`"
                  :designacion="d"
                  :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
                  show-ver-arbitros-btn
                  @ver-arbitros="verArbitros"
                  @action-complete="onActionComplete"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Designaciones Creadas / Completas -->
      <div>
        <div
          style="
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--color-text-secondary);
          "
          v-if="filteredCompletas.length > 0"
        >
          ✅ Pendientes de Aceptar (Completadas)
        </div>

        <div v-if="filteredCompletas.length > 0" class="alert alert-success">
          <i class="ti ti-check"></i>
          {{ filteredCompletas.length }} designación(es) completada(s).
        </div>

        <div
          v-if="
            filteredCompletas.length === 0 && filteredIncompletas.length === 0
          "
          class="empty-state"
        >
          <div class="empty-icon">
            <i
              class="ti ti-clipboard-list"
              style="font-size: 36px; color: var(--color-text-secondary)"
            ></i>
          </div>
          <div>No hay designaciones registradas</div>
          <div style="margin-top: 0.75rem">
            <button class="btn primary" @click="openModal('addDesignacion')">
              <i class="ti ti-plus"></i> Crear primera designación
            </button>
          </div>
        </div>

        <div class="grid-2" v-if="filteredCompletas.length > 0">
          <!-- Columna Sábado -->
          <div>
            <div
              style="
                font-weight: 600;
                font-size: 13px;
                color: var(--color-text-secondary);
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 6px;
              "
            >
              <span
                style="
                  background: #e1f5ee;
                  color: #0f6e56;
                  padding: 2px 8px;
                  border-radius: 12px;
                "
                >Sábado</span
              >
              <button
                v-if="compSabado.length > 0"
                class="btn text-xs"
                @click="openModal('whatsappMessage', 'sabado')"
                style="
                  padding: 2px 6px;
                  border-color: #25d366;
                  color: #25d366;
                  background: transparent;
                  font-size: 10px;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                "
                onmouseover="this.style.background = '#e8f9f0'"
                onmouseout="this.style.background = 'transparent'"
              >
                <i class="ti ti-brand-whatsapp"></i>Compartir Sábado
              </button>
            </div>
            <div
              v-if="compSabado.length === 0"
              style="
                padding: 1rem;
                border: 1px dashed var(--color-border-tertiary);
                border-radius: var(--border-radius-lg);
                text-align: center;
                color: var(--color-text-secondary);
                font-size: 12px;
                margin-bottom: 1rem;
                background: var(--color-background-primary);
              "
            >
              Sin designaciones completadas para el sábado
            </div>
            <div class="flex flex-col gap-3">
              <DesignacionCard
                v-for="d in compSabado"
                :key="`comp-${d.idDesignacion || d.id}`"
                :designacion="d"
                :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
                show-ver-arbitros-btn
                @ver-arbitros="verArbitros"
                @action-complete="onActionComplete"
              />
            </div>
          </div>

          <!-- Columna Domingo -->
          <div>
            <div
              style="
                font-weight: 600;
                font-size: 13px;
                color: var(--color-text-secondary);
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 6px;
              "
            >
              <span
                style="
                  background: #e1f5ee;
                  color: #0f6e56;
                  padding: 2px 8px;
                  border-radius: 12px;
                "
                >Domingo</span
              >
              <button
                v-if="compDomingo.length > 0"
                class="btn text-xs"
                @click="openModal('whatsappMessage', 'domingo')"
                style="
                  padding: 2px 6px;
                  border-color: #25d366;
                  color: #25d366;
                  background: transparent;
                  font-size: 10px;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                "
                onmouseover="this.style.background = '#e8f9f0'"
                onmouseout="this.style.background = 'transparent'"
              >
                <i class="ti ti-brand-whatsapp"></i>Compartir Domingo
              </button>
            </div>
            <div
              v-if="compDomingo.length === 0"
              style="
                padding: 1rem;
                border: 1px dashed var(--color-border-tertiary);
                border-radius: var(--border-radius-lg);
                text-align: center;
                color: var(--color-text-secondary);
                font-size: 12px;
                margin-bottom: 1rem;
                background: var(--color-background-primary);
              "
            >
              Sin designaciones completadas para el domingo
            </div>
            <div class="flex flex-col gap-3">
              <DesignacionCard
                v-for="d in compDomingo"
                :key="`comp-${d.idDesignacion || d.id}`"
                :designacion="d"
                :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
                show-ver-arbitros-btn
                @ver-arbitros="verArbitros"
                @action-complete="onActionComplete"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- Designaciones Pendientes de Confirmar por Cancha (Envío al Backend) -->
      <div v-if="filteredAConfirmar.length > 0" class="mt-4 mb-4">
        <div
          style="
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--color-text-secondary);
            display: flex;
            align-items: center;
            gap: 6px;
          "
        >
          📤 Confirmar Envío al Backend por Cancha ({{
            agrupadasPorCancha.length
          }}
          Cancha(s) Pendientes)
        </div>

        <div
          class="alert alert-info"
          style="
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 8px;
          "
        >
          <i class="ti ti-info-circle text-base"></i>
          <span style="font-size: 12px">
            Las designaciones aquí listadas han sido finalizadas localmente.
            Revisa los árbitros asignados y haz clic en
            <strong>"Confirmar y Enviar al Backend"</strong> para registrar todo
            el lote de esa cancha.
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.5rem">
          <div
            v-for="grupo in agrupadasPorCancha"
            :key="grupo.id"
            class="card"
            style="
              padding: 1.25rem;
              border-top: 4px solid var(--color-primary);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            "
          >
            <!-- Cabecera del Grupo Cancha -->
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid var(--color-border-tertiary);
                padding-bottom: 0.75rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
                gap: 10px;
              "
            >
              <div>
                <h4
                  style="
                    margin: 0;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--color-text-primary);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                  "
                >
                  🏟️ {{ grupo.nombre }}
                </h4>
                <div
                  style="
                    font-size: 11px;
                    color: var(--color-text-secondary);
                    margin-top: 2px;
                  "
                >
                  Tiene
                  <strong>{{ grupo.designaciones.length }}</strong>
                  designación(es) pendientes de confirmación.
                </div>
              </div>
              <button
                class="btn primary"
                style="
                  padding: 6px 14px;
                  font-size: 12px;
                  font-weight: 600;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                "
                @click="confirmarEnvioCancha(grupo.id)"
              >
                <i class="ti ti-cloud-upload"></i>
                Confirmar y Enviar al Backend
              </button>
            </div>

            <!-- Listado de Designaciones en esa Cancha -->
            <div class="grid-2">
              <div
                v-for="d in grupo.designaciones"
                :key="d.idDesignacion || d.id"
                class="card"
                style="
                  padding: 10px 12px;
                  background: var(--color-background-secondary);
                  border-color: var(--color-border-tertiary);
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                "
              >
                <div>
                  <div
                    style="
                      display: flex;
                      justify-content: space-between;
                      align-items: flex-start;
                    "
                  >
                    <div
                      style="
                        font-size: 12px;
                        font-weight: 600;
                        color: var(--color-text-primary);
                      "
                    >
                      📅 {{ formatFecha(d.fecha) }}
                    </div>
                    <span
                      class="badge badge-amber"
                      style="font-size: 9px; padding: 1px 5px"
                      >Listo para enviar</span
                    >
                  </div>
                  <div
                    style="
                      font-size: 11px;
                      color: var(--color-text-secondary);
                      margin-top: 3px;
                      display: flex;
                      gap: 8px;
                    "
                  >
                    <span>⚽ {{ d.cantidadPartidos }} partidos</span>
                    <span>🏆 {{ d.etapaCampeonato || "FECHA_NORMAL" }}</span>
                  </div>

                  <!-- Árbitros en tiempo real -->
                  <div
                    style="
                      margin-top: 8px;
                      border-top: 1px dashed var(--color-border-tertiary);
                      padding-top: 6px;
                    "
                  >
                    <div
                      style="
                        font-size: 10px;
                        font-weight: 600;
                        color: var(--color-text-secondary);
                        margin-bottom: 4px;
                      "
                    >
                      🏃‍♂️ Árbitros Asignados:
                    </div>
                    <div
                      v-if="
                        state.arbitrosDesignadosMap[d.idDesignacion || d.id] &&
                        state.arbitrosDesignadosMap[d.idDesignacion || d.id]
                          .length > 0
                      "
                      style="display: flex; flex-direction: column; gap: 4px"
                    >
                      <div
                        v-for="arb in state.arbitrosDesignadosMap[
                          d.idDesignacion || d.id
                        ]"
                        :key="arb.idDesignados || arb.id"
                        style="
                          font-size: 11px;
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                          background: white;
                          padding: 4px 8px;
                          border-radius: 4px;
                          border: 0.5px solid var(--color-border-tertiary);
                        "
                      >
                        <span
                          style="
                            font-weight: 500;
                            color: var(--color-text-primary);
                          "
                        >
                          {{ arb.arbitro?.nombre }} {{ arb.arbitro?.apellido }}
                        </span>
                        <span
                          class="badge badge-gray"
                          style="font-size: 8px; padding: 0.5px 3px"
                        >
                          {{ arb.arbitro?.rol }}
                        </span>
                      </div>
                    </div>
                    <div
                      v-else
                      style="
                        font-size: 10px;
                        color: var(--color-text-secondary);
                        font-style: italic;
                      "
                    >
                      Sin árbitros asignados.
                    </div>
                  </div>
                </div>

                <div
                  style="
                    display: flex;
                    gap: 8px;
                    margin-top: 10px;
                    justify-content: flex-end;
                    border-top: 0.5px solid var(--color-border-tertiary);
                    padding-top: 8px;
                    flex-wrap: wrap;
                  "
                >
                  <button
                    class="btn primary text-xs"
                    style="
                      padding: 3px 8px;
                      font-size: 10px;
                      border-color: #0f6e56;
                      background-color: #0f6e56;
                      color: white;
                    "
                    @click="confirmarEnvioDesignacion(d.idDesignacion || d.id)"
                  >
                    <i class="ti ti-send"></i> Confirmar y Enviar
                  </button>
                  <button
                    class="btn text-xs"
                    style="padding: 3px 8px; font-size: 10px"
                    @click="
                      openModal('manageReferees', d.idDesignacion || d.id)
                    "
                  >
                    <i class="ti ti-users"></i> Editar Árbitros
                  </button>
                  <button
                    class="btn danger text-xs"
                    style="
                      padding: 3px 8px;
                      font-size: 10px;
                      border-color: #64748b;
                      color: #64748b;
                      background: transparent;
                    "
                    onmouseover="this.style.background = '#f1f5f9'"
                    onmouseout="this.style.background = 'transparent'"
                    @click="deshacerFinalizacionLocal(d.idDesignacion || d.id)"
                  >
                    <i class="ti ti-arrow-back-up"></i> Devolver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Designaciones Aceptadas -->
      <div
        v-if="filteredAceptadas.length > 0"
        class="mt-4"
        style="margin-bottom: 2rem"
      >
        <div
          style="
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--color-text-secondary);
          "
        >
          🤝 Designaciones Aceptadas ({{ filteredAceptadas.length }})
        </div>

        <div class="grid-2">
          <!-- Columna Sábado -->
          <div>
            <div
              style="
                font-weight: 600;
                font-size: 13px;
                color: var(--color-text-secondary);
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 6px;
              "
            >
              <span
                style="
                  background: #e0f2fe;
                  color: #0369a1;
                  padding: 2px 8px;
                  border-radius: 12px;
                "
                >Sábado</span
              >
            </div>
            <div
              v-if="aceptadasSabado.length === 0"
              style="
                padding: 1rem;
                border: 1px dashed var(--color-border-tertiary);
                border-radius: var(--border-radius-lg);
                text-align: center;
                color: var(--color-text-secondary);
                font-size: 12px;
                margin-bottom: 1rem;
                background: var(--color-background-primary);
              "
            >
              Sin designaciones aceptadas para el sábado
            </div>
            <div class="flex flex-col gap-3">
              <DesignacionCard
                v-for="d in aceptadasSabado"
                :key="`acept-${d.idDesignacion || d.id}`"
                :designacion="d"
                :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
                show-ver-arbitros-btn
                @ver-arbitros="verArbitros"
                @action-complete="onActionComplete"
              />
            </div>
          </div>

          <!-- Columna Domingo -->
          <div>
            <div
              style="
                font-weight: 600;
                font-size: 13px;
                color: var(--color-text-secondary);
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 6px;
              "
            >
              <span
                style="
                  background: #e0f2fe;
                  color: #0369a1;
                  padding: 2px 8px;
                  border-radius: 12px;
                "
                >Domingo</span
              >
            </div>
            <div
              v-if="aceptadasDomingo.length === 0"
              style="
                padding: 1rem;
                border: 1px dashed var(--color-border-tertiary);
                border-radius: var(--border-radius-lg);
                text-align: center;
                color: var(--color-text-secondary);
                font-size: 12px;
                margin-bottom: 1rem;
                background: var(--color-background-primary);
              "
            >
              Sin designaciones aceptadas para el domingo
            </div>
            <div class="flex flex-col gap-3">
              <DesignacionCard
                v-for="d in aceptadasDomingo"
                :key="`acept-${d.idDesignacion || d.id}`"
                :designacion="d"
                :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
                show-ver-arbitros-btn
                @ver-arbitros="verArbitros"
                @action-complete="onActionComplete"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Designaciones Finalizadas -->
      <div v-if="filteredFinalizadas.length > 0" class="mt-4">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          "
        >
          <div
            style="
              font-size: 14px;
              font-weight: 600;
              color: var(--color-text-secondary);
            "
          >
            🏁 Designaciones Finalizadas ({{ filteredFinalizadas.length }})
          </div>
          <button
            class="btn"
            style="
              font-size: 11px;
              padding: 4px 8px;
              display: flex;
              align-items: center;
              gap: 4px;
            "
            @click="showFinalizadas = !showFinalizadas"
          >
            <i
              :class="showFinalizadas ? 'ti ti-eye-off' : 'ti ti-eye'"
              style="font-size: 14px"
            ></i>
            {{ showFinalizadas ? "Ocultar" : "Mostrar" }}
          </button>
        </div>

        <div v-if="showFinalizadas" class="grid-2 animate-fade-in">
          <!-- Columna Sábado -->
          <div>
            <div
              style="
                font-weight: 600;
                font-size: 13px;
                color: var(--color-text-secondary);
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 6px;
              "
            >
              <span
                style="
                  background: #e6f1fb;
                  color: #185fa5;
                  padding: 2px 8px;
                  border-radius: 12px;
                "
                >Sábado</span
              >
            </div>
            <div
              v-if="finSabado.length === 0"
              style="
                padding: 1rem;
                border: 1px dashed var(--color-border-tertiary);
                border-radius: var(--border-radius-lg);
                text-align: center;
                color: var(--color-text-secondary);
                font-size: 12px;
                margin-bottom: 1rem;
                background: var(--color-background-primary);
              "
            >
              Sin designaciones finalizadas para el sábado
            </div>
            <div class="flex flex-col gap-3">
              <DesignacionCard
                v-for="d in finSabado"
                :key="`fin-${d.idDesignacion || d.id}`"
                :designacion="d"
                :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
                show-ver-arbitros-btn
                @ver-arbitros="verArbitros"
                @action-complete="onActionComplete"
              />
            </div>
          </div>

          <!-- Columna Domingo -->
          <div>
            <div
              style="
                font-weight: 600;
                font-size: 13px;
                color: var(--color-text-secondary);
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 6px;
              "
            >
              <span
                style="
                  background: #e6f1fb;
                  color: #185fa5;
                  padding: 2px 8px;
                  border-radius: 12px;
                "
                >Domingo</span
              >
            </div>
            <div
              v-if="finDomingo.length === 0"
              style="
                padding: 1rem;
                border: 1px dashed var(--color-border-tertiary);
                border-radius: var(--border-radius-lg);
                text-align: center;
                color: var(--color-text-secondary);
                font-size: 12px;
                margin-bottom: 1rem;
                background: var(--color-background-primary);
              "
            >
              Sin designaciones finalizadas para el domingo
            </div>
            <div class="flex flex-col gap-3">
              <DesignacionCard
                v-for="d in finDomingo"
                :key="`fin-${d.idDesignacion || d.id}`"
                :designacion="d"
                :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
                show-ver-arbitros-btn
                @ver-arbitros="verArbitros"
                @action-complete="onActionComplete"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import {
  state,
  openModal,
  loadDesignacionesIncompletas,
  loadDesignacionesCompletas,
  loadDesignacionesAceptadas,
  loadDesignacionesFinalizadas,
  loadArbitrosDesignados,
  minArbitros,
  confirmarEnvioCancha,
  confirmarEnvioDesignacion,
  deshacerFinalizacionLocal,
  getCancha,
  formatFecha,
  getDayOfWeekLocal,
} from "../store";
import DesignacionCard from "../components/DesignacionCard.vue";

onMounted(() => {
  loadDesignacionesIncompletas();
  loadDesignacionesCompletas();
  loadDesignacionesAceptadas();
  loadDesignacionesFinalizadas();
});

const visibleArbitros = ref({});
const showFinalizadas = ref(true);
const searchRefereeQuery = ref("");

const filteredRefMatchList = computed(() => {
  const query = searchRefereeQuery.value.toLowerCase().trim();
  if (!query) return [];

  const matches = [];
  const lists = [
    ...filteredIncompletas.value,
    ...filteredCompletas.value,
    ...filteredAceptadas.value,
    ...filteredAConfirmar.value,
  ];

  const visited = new Set();

  lists.forEach((d) => {
    const id = d.idDesignacion || d.id;
    if (!id || visited.has(id)) return;
    visited.add(id);

    const assigned = state.arbitrosDesignadosMap[id] || [];
    assigned.forEach((asg) => {
      const arb = asg.arbitro;
      if (!arb) return;

      const nombre = (arb.nombre || "").toLowerCase();
      const apellido = (arb.apellido || "").toLowerCase();

      if (nombre.includes(query) || apellido.includes(query)) {
        const canchaId =
          d.idCancha || d.canchaId || d.cancha?.idCancha || d.cancha?.id;
        const canchaObj = canchaId ? getCancha(canchaId) : null;
        const canchaName =
          d.cancha?.nombreCancha ||
          d.cancha?.nombre ||
          canchaObj?.nombre ||
          "Cancha";

        let hora = "";
        if (d.fecha && d.fecha.includes("T")) {
          const timePart = d.fecha.split("T")[1];
          if (timePart) {
            const parts = timePart.split(":");
            const hh = Number(parts[0]);
            const min = Number(parts[1]);
            if (hh === 0 && min === 0) {
              hora = "Horario a confirmar";
            } else {
              hora = parts.slice(0, 2).join(":") + "hs";
            }
          }
        }

        const dateOfWeek = getDayOfWeekLocal(d.fecha);
        const diaStr = dateOfWeek === 0 ? "Domingo" : "Sábado";

        let statusLabel = "Incompleta";
        let statusClass = "badge-amber";

        if (
          filteredCompletas.value.some(
            (item) => (item.id || item.idDesignacion) === id,
          )
        ) {
          statusLabel = "Completa";
          statusClass = "badge-green";
        } else if (
          filteredAceptadas.value.some(
            (item) => (item.id || item.idDesignacion) === id,
          )
        ) {
          statusLabel = "Aceptada";
          statusClass = "badge-blue";
        } else if (
          filteredAConfirmar.value.some(
            (item) => (item.id || item.idDesignacion) === id,
          )
        ) {
          statusLabel = "A Confirmar";
          statusClass = "badge-primary";
        }

        matches.push({
          id: `${id}-${arb.idArbitro || arb.id}`,
          refereeName: `${arb.nombre} ${arb.apellido}`,
          canchaName,
          fechaFormateada: `${diaStr} · ${hora}`,
          rol: arb.rol || "Árbitro",
          statusLabel,
          statusClass,
        });
      }
    });
  });

  return matches;
});

const arbitrosDesignados = computed(() => {
  const res = {};
  Object.keys(visibleArbitros.value).forEach((id) => {
    if (visibleArbitros.value[id]) {
      res[id] = state.arbitrosDesignadosMap[id] || [];
    }
  });
  return res;
});

const filteredIncompletas = computed(() =>
  state.designacionesIncompletas.filter((d) => d.editable !== false),
);
const filteredCompletas = computed(() =>
  state.designaciones.filter((d) => d.editable !== false),
);
const filteredFinalizadas = computed(() =>
  state.designacionesFinalizadas.filter((d) => d.editable !== false),
);
const filteredAceptadas = computed(() =>
  state.designacionesAceptadas.filter((d) => d.editable !== false),
);
const filteredAConfirmar = computed(() =>
  state.designacionesAConfirmar.filter((d) => d.editable !== false),
);

const getDayOfWeek = getDayOfWeekLocal;

// Incomplete designations split
const incSabado = computed(() =>
  filteredIncompletas.value.filter((d) => getDayOfWeek(d.fecha) !== 0),
);
const incDomingo = computed(() =>
  filteredIncompletas.value.filter((d) => getDayOfWeek(d.fecha) === 0),
);

// Complete designations split
const compSabado = computed(() =>
  filteredCompletas.value.filter((d) => getDayOfWeek(d.fecha) !== 0),
);
const compDomingo = computed(() =>
  filteredCompletas.value.filter((d) => getDayOfWeek(d.fecha) === 0),
);

// Finished designations split
const finSabado = computed(() =>
  filteredFinalizadas.value.filter((d) => getDayOfWeek(d.fecha) !== 0),
);
const finDomingo = computed(() =>
  filteredFinalizadas.value.filter((d) => getDayOfWeek(d.fecha) === 0),
);

// Accepted designations split
const aceptadasSabado = computed(() =>
  filteredAceptadas.value.filter((d) => getDayOfWeek(d.fecha) !== 0),
);
const aceptadasDomingo = computed(() =>
  filteredAceptadas.value.filter((d) => getDayOfWeek(d.fecha) === 0),
);

const verArbitros = async (d) => {
  const idDesignacion = d.idDesignacion || d.id;
  if (visibleArbitros.value[idDesignacion]) {
    visibleArbitros.value[idDesignacion] = false;
  } else {
    if (!state.arbitrosDesignadosMap[idDesignacion]) {
      await loadArbitrosDesignados(idDesignacion);
    }
    visibleArbitros.value[idDesignacion] = true;
  }
};

const agrupadasPorCancha = computed(() => {
  const groups = {};
  filteredAConfirmar.value.forEach((d) => {
    const canchaId =
      d.idCancha || d.canchaId || d.cancha?.idCancha || d.cancha?.id;
    const canchaName =
      d.cancha?.nombreCancha ||
      d.cancha?.nombre ||
      getCancha(canchaId)?.nombre ||
      "Cancha Desconocida";
    if (!groups[canchaId]) {
      groups[canchaId] = {
        id: canchaId,
        nombre: canchaName,
        designaciones: [],
      };
    }
    groups[canchaId].designaciones.push(d);
  });
  return Object.values(groups);
});

const onActionComplete = (id) => {
  visibleArbitros.value[id] = true;
};
</script>
