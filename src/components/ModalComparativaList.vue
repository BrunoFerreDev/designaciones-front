<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem">
    <!-- Navigation tabs -->
    <div
      style="
        display: flex;
        background: var(--color-background-secondary);
        padding: 4px;
        border-radius: 20px;
        gap: 4px;
        flex-wrap: wrap;
      "
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        style="
          flex: 1;
          min-width: 100px;
          text-align: center;
          padding: 6px 10px;
          font-size: 11px;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        "
        :style="{
          background:
            activeTab === tab.id
              ? 'var(--color-background-primary)'
              : 'transparent',
          color:
            activeTab === tab.id
              ? 'var(--color-text-primary)'
              : 'var(--color-text-secondary)',
          fontWeight: activeTab === tab.id ? '600' : '500',
          boxShadow:
            activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        }"
        @click="$emit('update:activeTab', tab.id)"
      >
        {{ tab.label }}
        <span
          style="font-size: 9px; padding: 1px 5px; border-radius: 10px"
          :style="{
            background:
              activeTab === tab.id
                ? tab.id === 'repitentesSabDom'
                  ? '#ef4444'
                  : 'var(--color-primary)'
                : 'var(--color-border-primary)',
            color:
              activeTab === tab.id ? 'white' : 'var(--color-text-secondary)',
          }"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- List panel -->
    <div
      style="
        max-height: 40vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-right: 4px;
      "
    >
      <div
        v-if="currentList.length === 0"
        style="
          text-align: center;
          padding: 2rem;
          color: var(--color-text-secondary);
          font-size: 13px;
          font-style: italic;
        "
      >
        No hay árbitros en esta categoría.
      </div>

      <div
        v-for="arb in currentList"
        :key="arb.idArbitro"
        class="card animate-fade-in"
        style="
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--color-background-primary);
          border-color: var(--color-border-tertiary);
          border-radius: var(--border-radius-md, 10px);
        "
        :style="
          arb.isExtremeLoad
            ? 'border: 1.5px solid #fca5a5; background: #fffdfd; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.04);'
            : ''
        "
      >
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <div style="display: flex; align-items: center; gap: 8px">
            <div
              style="
                width: 34px;
                height: 34px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 12px;
              "
              :style="
                arb.isExtremeLoad
                  ? 'background: #fee2e2; color: #991b1b;'
                  : 'background: #e0f2fe; color: #0369a1;'
              "
            >
              {{ arb.nombre.charAt(0) }}{{ arb.apellido.charAt(0) }}
            </div>
            <div>
              <h4
                style="
                  margin: 0;
                  font-size: 13px;
                  font-weight: 600;
                  color: var(--color-text-primary);
                "
              >
                {{ arb.nombre }} {{ arb.apellido }}
              </h4>
              <div
                style="
                  font-size: 10px;
                  color: var(--color-text-secondary);
                  margin-top: 1px;
                  display: flex;
                  gap: 4px;
                "
              >
                <span
                  class="badge badge-gray"
                  style="font-size: 8px; padding: 0px 4px"
                  >{{ arb.rol }}</span
                >
                <span
                  class="badge badge-gray"
                  style="font-size: 8px; padding: 0px 4px"
                  >{{ arb.categoria }}</span
                >
              </div>
            </div>
          </div>

          <div>
            <span
              v-if="arb.isExtremeLoad"
              class="badge"
              style="
                font-size: 8px;
                background: #fee2e2;
                color: #991b1b;
                border: 0.5px solid #fca5a5;
                font-weight: 600;
                padding: 2px 8px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 4px;
              "
            >
              ⚠️ Repite Sáb/Dom
            </span>
            <span
              v-else-if="arb.lastWeekendCount > 0 && arb.thisWeekendCount > 0"
              class="badge"
              style="
                font-size: 8px;
                background: #fffbeb;
                color: #b45309;
                font-weight: 600;
                padding: 2px 8px;
                border-radius: 12px;
              "
            >
              Repite Finde
            </span>
          </div>
        </div>

        <!-- Comparative Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
          <!-- Last Weekend Column -->
          <div
            style="
              background: var(--color-background-secondary);
              border-radius: 8px;
              padding: 8px 10px;
              font-size: 10px;
            "
          >
            <div
              style="
                font-weight: 600;
                color: var(--color-text-secondary);
                border-bottom: 0.5px solid var(--color-border-tertiary);
                padding-bottom: 4px;
                margin-bottom: 6px;
                display: flex;
                justify-content: space-between;
              "
            >
              <span>📅 Finde Pasado:</span>
              <strong style="color: var(--color-text-primary)"
                >{{ arb.lastWeekendCount }} part.</strong
              >
            </div>
            <ul
              style="
                list-style: none;
                padding-left: 0;
                margin: 0;
                display: flex;
                flex-direction: column;
                gap: 4px;
              "
            >
              <li
                v-if="arb.lastSaturday.length > 0"
                style="color: var(--color-text-primary)"
              >
                <span style="font-weight: 600; color: #0f6e56">Sáb:</span>
                <div
                  v-for="m in arb.lastSaturday"
                  :key="m.id"
                  style="margin-left: 6px; color: var(--color-text-secondary)"
                >
                  🏟️ {{ m.cancha }} · ⏰ {{ m.hora }}
                </div>
              </li>
              <li
                v-if="arb.lastSunday.length > 0"
                style="color: var(--color-text-primary)"
              >
                <span style="font-weight: 600; color: #185fa5">Dom:</span>
                <div
                  v-for="m in arb.lastSunday"
                  :key="m.id"
                  style="margin-left: 6px; color: var(--color-text-secondary)"
                >
                  🏟️ {{ m.cancha }} · ⏰ {{ m.hora }}
                </div>
              </li>
              <li
                v-if="arb.lastWeekendCount === 0"
                style="
                  color: var(--color-text-secondary);
                  font-style: italic;
                  text-align: center;
                  padding: 4px 0;
                "
              >
                Sin partidos
              </li>
            </ul>
          </div>

          <!-- This Weekend Column -->
          <div
            style="
              background: var(--color-background-secondary);
              border-radius: 8px;
              padding: 8px 10px;
              font-size: 10px;
            "
            :style="arb.isExtremeLoad ? 'background: #fff8f8;' : ''"
          >
            <div
              style="
                font-weight: 600;
                color: var(--color-text-secondary);
                border-bottom: 0.5px solid var(--color-border-tertiary);
                padding-bottom: 4px;
                margin-bottom: 6px;
                display: flex;
                justify-content: space-between;
              "
            >
              <span>📅 Este Finde:</span>
              <strong style="color: var(--color-text-primary)"
                >{{ arb.thisWeekendCount }} part.</strong
              >
            </div>
            <ul
              style="
                list-style: none;
                padding-left: 0;
                margin: 0;
                display: flex;
                flex-direction: column;
                gap: 4px;
              "
            >
              <li
                v-if="arb.thisSaturday.length > 0"
                style="color: var(--color-text-primary)"
              >
                <span style="font-weight: 600; color: #0f6e56">Sáb:</span>
                <div
                  v-for="m in arb.thisSaturday"
                  :key="m.id"
                  style="margin-left: 6px; color: var(--color-text-secondary)"
                >
                  🏟️ {{ m.cancha }} · ⏰ {{ m.hora }}
                </div>
              </li>
              <li
                v-if="arb.thisSunday.length > 0"
                style="color: var(--color-text-primary)"
              >
                <span style="font-weight: 600; color: #185fa5">Dom:</span>
                <div
                  v-for="m in arb.thisSunday"
                  :key="m.id"
                  style="margin-left: 6px; color: var(--color-text-secondary)"
                >
                  🏟️ {{ m.cancha }} · ⏰ {{ m.hora }}
                </div>
              </li>
              <li
                v-if="arb.thisWeekendCount === 0"
                style="
                  color: var(--color-text-secondary);
                  font-style: italic;
                  text-align: center;
                  padding: 4px 0;
                "
              >
                Sin partidos
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeTab: String,
  tabs: Array,
  currentList: Array,
});
defineEmits(["update:activeTab"]);
</script>
