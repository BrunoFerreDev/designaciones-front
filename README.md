# Sistema de Designación y Gestión de Árbitros

Sistema completo para la administración de designaciones arbitrales en campeonatos o ligas. Permite gestionar árbitros, designaciones, etapas, categorías, zonas, sedes y estadios, con un sistema inteligente de asignación automática.

## Características Principales

### 📋 Gestión de Designaciones

- **Creación y Edición**: Formularios completos con validación en tiempo real y carga de designaciones existentes.
- **Estados de Designación**:
  - **0 - Incompleta**: Aún faltan árbitros por asignar.
  - **1 - Completa**: Designación cerrada con todos los árbitros requeridos.
  - **2 - Finalizada**: Jornada completada y confirmada.
  - **3 - Cancelada**: Designación eliminada o reprogramada.
- **Reprogramación**: Posibilidad de cambiar fecha y hora de designaciones completas o canceladas.
- **Cancelación**: Opción para cancelar designaciones que ya han sido confirmadas.
- **Eliminación**: Eliminación de designaciones (solo en estado incompleto).
- **Sistema de Eliminación con Soft Delete**: Las designaciones eliminadas se marcan como inactivas (`eliminado = true`) en lugar de borrarse físicamente.

### 🧠 Asignación Inteligente de Árbitros

- **Asignación Automática**: Algoritmo que selecciona árbitros según:
  - Disponibilidad horaria (Sábado/Domingo).
  - Especialidad de árbitro (Central/Asistente).
  - Criterio de rotación para balanced.
  - Disponibilidad en sedes (zona geográfica).
- **Reasignación Automática**: Reemplaza árbitros en designaciones existentes.
- **Asignación Manual**: Lista completa de árbitros activos con filtros y búsqueda.

### 👨‍✈️ Gestión de Árbitros

- **Formulario Completo**: Incluye datos personales, contacto, especialidad, estado, ciudad y días de disponibilidad (Sábado/Domingo).
- **Edición Rápida**: Botones de acción rápida para marcar disponibilidad ("Sáb", "Dom", "Activo") directamente desde la tarjeta.
- **Etiquetas Visuales**: Muestra días disponibles y especialidad del árbitro.
- **Sistema de Eliminación con Soft Delete**.

### 📅 Gestión de Fechas

- **Configuración de Jornadas**: Creación de fechas con rangos de horas de inicio y fin.
- **Fechas en el Pasado**: Solo se permite crear designaciones en fechas pasadas si el "Fin de Jornada" aún no ha concluido.
- **Filtro de Jornadas**: Las designaciones canceladas (estado 3) se listan en la columna de pendientes del dashboard.

### 🗺️ Configuración de Infraestructura

- **Canal**: Asignación de canales a designaciones.
- **Etapas**: Administración de etapas del campeonato.
- **Categorías**: Gestión de categorías de equipos.
- **Ciudades**: Ciudades de las sedes.
- **Sedes**: Sedes del campeonato.
- **Estadios**: Estadios asociados a sedes.

## 🚀 Instalación

1. **Clonar el repositorio:**

   ```bash
   git clone <url-del-repositorio>
   cd designacion-arbitros
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Vue 3 + Vite
- **Gestión de Estados**: Pinia
- **Framework**: Flowbite
- **Iconos**: Tabler Icons
- **Lenguaje**: JavaScript
