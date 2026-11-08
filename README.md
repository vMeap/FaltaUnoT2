# FaltaUno — Plataforma Web (Taller 2 y Hito 3)

Aplicación web para encontrar, publicar e inscribirse en partidos deportivos amateur (Fútbol, Pádel y Básquetbol).

---

## 1. Cómo ejecutar el proyecto

Puedes levantar el proyecto de dos maneras: **en local con Node.js** (dos terminales) o **completo con Docker Compose**.

### Opción A: Ejecutar en local con Node.js (sin Docker)

> El backend detecta automáticamente si PostgreSQL y MongoDB están activos; si no están levantados localmente, funciona con una lista en memoria de respaldo para que puedas desarrollar y probar todo sin bloqueos.

**1. Instalar dependencias (solo la primera vez):**

```bash
# En la carpeta raíz (Frontend)
npm install

# Instalar dependencias del Backend
cd backend
npm install
cd ..
```

**2. Iniciar el Backend (Terminal 1):**

```bash
npm run start:backend
```
*(Para modo desarrollo con recarga automática puedes usar `npm run dev:backend`).*

**3. Iniciar el Frontend React (Terminal 2):**

```bash
npm run dev
```

---

### Opción B: Ejecutar todo con Docker Compose (PostgreSQL + MongoDB + Backend + Frontend)

Si tienes **Docker Desktop** abierto, ejecuta en la raíz del proyecto:

```bash
docker compose up --build
```

Esto levanta automáticamente:
- **PostgreSQL 16** en el puerto `5432` (ejecutando el script inicial `backend/sql/init.sql`).
- **MongoDB 7** en el puerto `27017`.
- **Backend API REST** en `http://localhost:4000`.
- **Frontend React** en `http://localhost:5173`.

---

## 2. Accesos y puertos principales

| Servicio | URL | Descripción |
| :--- | :--- | :--- |
| **Aplicación Web (React)** | `http://localhost:5173` | Interfaz de login, registro, cartelera y mis partidos |
| **API REST (Backend)** | `http://localhost:4000/api` | Servidor Express con conexión a PostgreSQL y MongoDB |
| **Swagger / OpenAPI** | `http://localhost:4000/api/docs` | Documentación interactiva para probar los endpoints |

---

## 3. Autenticación y cuentas de prueba

El proyecto incluye un sistema de **Inicio de Sesión** y **Registro** (`src/components/Login.jsx`) conectado al backend (`src/services/api.js`). Solo los correos registrados pueden ingresar a la aplicación; también es posible registrar cuentas nuevas desde la vista **Registrarse**.

Las cuentas iniciales se encuentran en `backend/sql/init.sql` y `src/data/initialUsers.json`:

| Nombre | Correo electrónico | Contraseña | Deporte favorito |
| :--- | :--- | :--- | :--- |
| **Kevin** | `kevin@faltauno.cl` | `123456` | Fútbol |
| **Matías Rojas** | `matias@faltauno.cl` | `123456` | Fútbol |
| **Camila Soto** | `camila@faltauno.cl` | `123456` | Pádel |
| **Diego Morales** | `diego@faltauno.cl` | `123456` | Básquetbol |

---

## 4. Estructura del Backend y Persistencia (SQL + NoSQL)

El backend se ubica en la carpeta `backend/` y está organizado en archivos simples:

- `backend/src/index.js`: configuración del servidor Express, CORS y Swagger (`/api/docs`).
- `backend/src/db.js`: conexión a **PostgreSQL** (`pg`) y **MongoDB** (`mongodb`).
- `backend/src/controllers/authController.js`: inicio de sesión, registro de usuarios y bitácora de actividad.
- `backend/src/controllers/matchController.js`: CRUD de partidos e indicadores de cupos.
- `backend/src/routes/authRoutes.js` y `matchRoutes.js`: definición de rutas de la API.
- `backend/src/swagger.js`: especificación OpenAPI 3.0.

### Uso de Bases de Datos

1. **PostgreSQL (SQL Relacional)**:
   - Tabla `users`: almacena los usuarios registrados (`id`, `name`, `email`, `password`, `role`, `favorite_sport`).
   - Tabla `matches`: almacena los partidos publicados (`id`, `sport`, `location`, `date`, `time`, `level`, `slots`, `latitude`, `longitude`, `organizer_id` con clave foránea a `users`).
2. **MongoDB (NoSQL Documental)**:
   - Utiliza la colección `logs` para guardar el historial de accesos e interacciones de los usuarios (`LOGIN`, `REGISTRO`, `INSCRIPCION`, `BAJA`, `NUEVO_PARTIDO`, `EDITAR_PARTIDO`).
   - Se puede consultar desde la interfaz haciendo clic en el **nombre del usuario en la barra superior** (`src/components/ActivityModal.jsx`).

### Endpoints implementados (Parte 1 y Parte 2)

| Método | Ruta | Descripción | Base de datos |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Valida correo y contraseña del usuario y registra el acceso | PostgreSQL + MongoDB |
| `POST` | `/api/auth/register` | Crea un nuevo usuario verificando que el correo no exista | PostgreSQL + MongoDB |
| `GET` | `/api/matches` | Lista todos los partidos disponibles (con filtro opcional por deporte) | PostgreSQL |
| `GET` | `/api/matches/stats` | Entrega indicadores de partidos publicados, abiertos y cupos | PostgreSQL |
| `POST` | `/api/matches` | Publica un nuevo partido deportivo | PostgreSQL + MongoDB |
| `PUT` | `/api/matches/:id` | Edita los datos o cupos de un partido existente | PostgreSQL + MongoDB |
| `DELETE` | `/api/matches/:id` | Elimina un partido de la cartelera | PostgreSQL |
| `GET` | `/api/logs` | Obtiene los últimos registros de actividad del sistema | MongoDB |
| `POST` | `/api/logs` | Guarda un nuevo evento de participación | MongoDB |

---

## 5. API Pública (Clima con Open-Meteo)

En `src/services/api.js` (`fetchWeather`) y `src/components/MatchCard.jsx` se consume la API pública **Open-Meteo** (`https://api.open-meteo.com/v1/forecast`) mediante `GET`, usando la latitud y longitud de cada partido para mostrar la temperatura actual de la cancha (`🌤️ °C`) sin requerir API Key.

---

## 6. Variables de entorno

En la raíz del proyecto y en `backend/` se incluye el archivo `.env.example` con la configuración por defecto:

```env
POSTGRES_USER=faltauno
POSTGRES_PASSWORD=faltauno123
POSTGRES_DB=faltauno_db

PORT=4000
DATABASE_URL=postgresql://faltauno:faltauno123@localhost:5432/faltauno_db
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=faltauno_nosql

VITE_API_URL=http://localhost:4000/api
```


---

## 7. Continuidad con el Taller 2 y Tecnologías

- **Qué se conserva del Taller 2**: El dominio de partidos deportivos amateur (**FaltaUno**), el diseño visual en verde cancha con Bootstrap 5, la cartelera filtrable por deporte y buscador, y el panel lateral *Mis partidos*.
- **Qué se amplía en el Hito 3**:
  - Sistema de autenticación (Login y Registro) con validación de cuentas registradas.
  - Backend API REST propio en Node.js + Express documentado con Swagger.
  - Persistencia relacional en **PostgreSQL** (`users` y `matches`) y documental en **MongoDB** (`logs`).
  - Indicadores superiores en tiempo real, edición/eliminación de partidos y pronóstico de temperatura con **Open-Meteo API**.
- **Tecnologías principales**: React 19, Vite 8, Bootstrap 5, Node.js, Express 4, PostgreSQL 16 (`pg`), MongoDB 7 (`mongodb`), `swagger-ui-express` y Docker Compose.

---

## 8. Uso de Inteligencia Artificial

| Elemento | Detalle |
| :--- | :--- |
| **Herramienta** | Asistente de código IA (Antigravity / Gemini) |
| **Propósito** | Apoyo en el diseño del login, estructuración de endpoints Express, conexión a PostgreSQL/MongoDB y documentación Swagger. |
| **Prompt representativo** | *"Necesito hacer un login y registro que valide correos registrados, conectarlo a un backend sencillo con PostgreSQL y MongoDB y agregar el CRUD de partidos con clima de Open-Meteo."* |
| **Resultado** | Componentes `Login.jsx` y `ActivityModal.jsx`, cliente `src/services/api.js`, controladores `authController.js` y `matchController.js`, y configuración de `docker-compose.yml`. |
| **Validación humana** | Se simplificó la estructura de carpetas del backend, se probaron manualmente los endpoints en Swagger (`/api/docs`), se ajustaron estilos CSS y se verificó el funcionamiento con y sin Docker. |
| **Aprendizaje** | Separación entre la capa de vista en React (`components/`) y la capa de llamadas HTTP (`services/api.js`), además del uso complementario de SQL para entidades relacionales y NoSQL para bitácoras de eventos. |
