# FaltaUno

Aplicación frontend desarrollada con React para encontrar y crear partidos deportivos amateur a los que les faltan jugadores.

Taller Evaluado 2 de Desarrollo Web y Móvil, segundo semestre 2026.

## Integrantes

| Integrante | Responsabilidad principal | Rama |
| --- | --- | --- |
| Jordan | Base React, estado compartido, formulario, inscripción y baja, persistencia | `feature/base-react-interacciones` |
| Kevin | Diseño previo, feed de partidos, búsqueda y filtros | `feature/feed-filtros-diseno` |
| Alonso | Integración de la API del clima y documentación | `feature/api-clima-documentacion` |

## Descripción de la problemática

Quienes practican deporte de forma amateur suelen organizar sus partidos por mensajería. Cuando falta una persona para completar el equipo, no existe un lugar único donde publicar el cupo ni donde alguien interesado pueda encontrarlo. FaltaUno reúne esos partidos en un solo listado: permite buscar un partido por deporte o lugar, inscribirse en un cupo disponible, darse de baja y publicar un partido nuevo.

## Usuarios objetivo

- Personas que buscan un partido al cual sumarse.
- Personas que organizan un partido y necesitan completar cupos.

## Funcionalidades principales

- Listado de partidos con deporte, lugar, fecha, hora, nivel y cupos faltantes.
- Búsqueda por deporte, lugar o nivel y filtro por deporte (Fútbol, Básquetbol, Pádel).
- Inscripción ("Yo apaño") y baja de un partido, con actualización de cupos.
- Panel "Mis partidos" con los partidos en los que la persona está inscrita.
- Creación de partidos mediante un formulario con validación.
- Avisos de confirmación al inscribirse, darse de baja o publicar un partido.
- Persistencia de los cambios en el navegador mediante `localStorage`.
- Pronóstico del clima para la fecha y hora de cada partido, obtenido desde la API pública Open-Meteo.

## Tecnologías utilizadas

| Tecnología | Uso en el proyecto |
| --- | --- |
| React 19 | Componentes, props, estado (`useState`) y efectos (`useEffect`) |
| Vite 8 | Creación, ejecución y compilación del proyecto |
| JavaScript | Lógica, transformación de datos y eventos |
| HTML5 / JSX | Estructura de las vistas |
| Bootstrap 5.3 | Grilla, botones, formularios y utilidades |
| CSS3 | Estilos propios, identidad visual y diseño responsive |
| Fetch API | Consumo de la API pública Open-Meteo |
| JSON y `localStorage` | Datos iniciales y persistencia local, sin backend |
| Git, GitHub y Git Flow | Versionamiento y trabajo colaborativo |

## Instrucciones para ejecutar el proyecto

Requisitos: [Node.js](https://nodejs.org/) 20.19 o superior y npm.

```bash
git clone https://github.com/vMeap/FaltaUnoT2.git
cd FaltaUnoT2
npm install
npm run dev
```

La aplicación queda disponible en la dirección que indica la terminal, normalmente `http://localhost:5173`.

Otros comandos:

| Comando | Descripción |
| --- | --- |
| `npm run build` | Genera la versión de producción en la carpeta `dist/` |
| `npm run preview` | Sirve localmente la versión de producción ya generada |
| `npm run lint` | Revisa el código con oxlint |

La API del clima no requiere claves. La conexión del backend a MySQL y MongoDB se configura en `backend/.env`, como se indica en la sección del Hito 3.

## Estructura general de la aplicación

```text
FaltaUnoT2/
├── backend/
│   ├── sql/init.sql
│   └── src/
├── shared/
│   ├── dates.js
│   └── initialMatches.js
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AlertMessage.jsx
│   │   ├── CreateMatchModal.jsx
│   │   ├── MyMatchesPanel.jsx
│   │   ├── WeatherBadge.jsx
│   │   └── WeatherBadge.css
│   ├── data/
│   │   └── initialUsers.json
│   ├── services/
│   │   └── weatherService.js
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   └── styles.css
├── index.html
├── package.json
└── vite.config.js
```

- `components/`: componentes de la interfaz. Reciben sus datos y acciones por props. `CreateMatchModal` es el formulario para crear partidos, `MyMatchesPanel` muestra los partidos en que la persona está inscrita, `AlertMessage` muestra los avisos y `WeatherBadge` muestra el clima de cada tarjeta.
- `services/`: acceso a la API externa. `weatherService.js` consulta Open-Meteo y transforma la respuesta, para que el componente no tenga que conocer la URL ni el formato.
- `shared/initialMatches.js`: tiene los partidos iniciales con sus coordenadas y fechas relativas a hoy, compartidos por el frontend y el backend.
- `App.jsx`: guarda el estado compartido y dibuja el listado, la búsqueda y los filtros.
- `main.jsx`: punto de entrada, carga Bootstrap y los estilos.

### Estado compartido y contrato de integración

`App.jsx` es la fuente de verdad para los partidos y las inscripciones. El estado persiste en el navegador con las claves `faltauno.matches.v1` y `faltauno.myMatches.v1`.

Cada partido usa este formato:

```js
{
  id: string,
  sport: 'Fútbol' | 'Básquetbol' | 'Pádel',
  location: string,
  date: 'YYYY-MM-DD',
  time: 'HH:mm',
  level: 'Amateur' | 'Intermedio' | 'Competitivo',
  slots: number,
  latitude?: number,
  longitude?: number
}
```

`MyMatchesPanel` usa `matches`, `myMatchIds` y `onCancel`. El formulario usa `onSubmit` y `onClose`. `WeatherBadge` usa `latitude`, `longitude`, `date` y `time`. Los partidos iniciales están en `shared/initialMatches.js` y llevan coordenadas para consultar el clima.

## API pública utilizada: Open-Meteo

| Aspecto | Detalle |
| --- | --- |
| Nombre | Open-Meteo Weather Forecast API |
| Documentación oficial | <https://open-meteo.com/en/docs> |
| Endpoint | `https://api.open-meteo.com/v1/forecast` |
| Método HTTP | `GET` |
| Autenticación | No requiere clave ni registro para uso no comercial |
| Formato de respuesta | JSON |

### Parámetros enviados

| Parámetro | Valor | Propósito |
| --- | --- | --- |
| `latitude` | `latitude` del partido | Ubicación del partido |
| `longitude` | `longitude` del partido | Ubicación del partido |
| `hourly` | `temperature_2m,precipitation_probability,weather_code,wind_speed_10m` | Variables horarias solicitadas |
| `timezone` | `auto` | Entrega las horas en la zona horaria del lugar del partido |
| `start_date` | `date` del partido | Primer día consultado |
| `end_date` | `date` del partido | Último día consultado (el mismo: se pide un solo día) |

Ejemplo de solicitud para un partido en Quillota el 12 de octubre de 2026:

```text
GET https://api.open-meteo.com/v1/forecast?latitude=-32.883&longitude=-71.248&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&timezone=auto&start_date=2026-10-12&end_date=2026-10-12
```

### Datos de la respuesta utilizados

La API devuelve, dentro de `hourly`, un arreglo por variable con las 24 horas del día. Ejemplo abreviado, con valores ilustrativos:

```json
{
  "timezone": "America/Santiago",
  "hourly": {
    "time": ["2026-10-12T00:00", "2026-10-12T01:00", "..."],
    "temperature_2m": [11.4, 10.9, "..."],
    "precipitation_probability": [0, 0, "..."],
    "weather_code": [1, 1, "..."],
    "wind_speed_10m": [6.2, 5.8, "..."]
  }
}
```

| Campo de la respuesta | Unidad | Uso en FaltaUno |
| --- | --- | --- |
| `hourly.time` | Fecha y hora ISO 8601 | Ubicar la posición de la hora del partido |
| `hourly.temperature_2m` | °C | Temperatura a la hora del partido |
| `hourly.precipitation_probability` | % | Probabilidad de lluvia |
| `hourly.weather_code` | Código WMO | Descripción de la condición |
| `hourly.wind_speed_10m` | km/h | Velocidad del viento |

Transformación realizada en `toMatchWeather` (`src/services/weatherService.js`):

1. La hora del partido se lleva a la hora en punto: un partido a las `18:30` se busca como `2026-10-12T18:00`.
2. Se busca la posición de esa hora en `hourly.time`.
3. Con esa posición se toma el valor de cada arreglo.
4. La temperatura y el viento se redondean. El código WMO se traduce a una descripción en español, porque la API solo entrega el número.

El resultado es un objeto simple: `{ temperature, precipitationProbability, windSpeed, description }`.

### Dónde aparecen los datos en la interfaz

El componente `WeatherBadge` se muestra dentro de cada tarjeta del listado de partidos, en `App.jsx`, debajo de la fecha y la hora:

```jsx
<WeatherBadge latitude={match.latitude} longitude={match.longitude} date={match.date} time={match.time} />
```

| Estado | Cuándo ocurre | Qué ve la persona |
| --- | --- | --- |
| Carga | Mientras se espera la respuesta | "Cargando clima..." |
| Resultado | La API respondió con datos | Temperatura, condición, lluvia y viento |
| Error | Falló la red o la API respondió con error | "No se pudo cargar el clima" y botón "Reintentar" |
| Sin coordenadas | El partido no tiene `latitude` o `longitude` | "Clima no disponible" |
| Fecha lejana | Faltan 16 días o más para el partido | "Pronóstico disponible 15 días antes del partido" |
| Fecha pasada | El partido ya ocurrió | "Sin pronóstico: la fecha ya pasó" |
| Sin dato | La respuesta no trae valor para esa hora | "Sin pronóstico para esa hora" |

En los casos sin coordenadas, de fecha lejana y de fecha pasada no se realiza ninguna solicitud a la API.

### Manejo de errores

- Ante un parámetro inválido, Open-Meteo responde con código HTTP `400` y un cuerpo `{ "error": true, "reason": "..." }`. El servicio lee `reason` y lanza un `Error` con ese mensaje.
- Si no hay conexión o la API no responde, `fetch` rechaza la promesa.
- En ambos casos `WeatherBadge` muestra el estado de error con el botón "Reintentar" y registra el detalle en la consola.
- Un error del clima afecta solo a ese indicador. El listado, la inscripción, la baja y la creación de partidos siguen funcionando, porque dependen de datos locales.
- Si la tarjeta deja de mostrarse mientras la solicitud está pendiente (por ejemplo, al filtrar), la solicitud se cancela con `AbortController`.

### Restricciones, límites y licencia

Según los [términos de uso](https://open-meteo.com/en/terms) y la [licencia](https://open-meteo.com/en/licence) de Open-Meteo, revisados el 10-10-2026:

- **Uso permitido:** el acceso gratuito es solo para uso no comercial. Este proyecto es académico, sin publicidad ni suscripciones.
- **Límites:** menos de 10.000 solicitudes por día, 5.000 por hora y 600 por minuto.
- **Autenticación:** no requiere clave. La clave solo aplica a los planes comerciales.
- **Alcance del pronóstico:** hasta 16 días, contando el día actual.
- **Licencia de los datos:** Creative Commons Atribución 4.0 Internacional (CC BY 4.0).
- **Atribución:** la licencia exige un enlace a Open-Meteo junto a los datos mostrados. `WeatherBadge` incluye el enlace "Datos: Open-Meteo.com" en cada resultado.
- **Garantía:** el servicio se entrega sin garantía de disponibilidad ni de exactitud.

Para no repetir solicitudes, `weatherService.js` guarda en memoria las respuestas de la sesión: dos tarjetas con el mismo lugar, fecha y hora generan una sola consulta.

### Justificación funcional

Muchos de los partidos que se publican en FaltaUno se juegan al aire libre. Antes de inscribirse, una persona necesita saber si lloverá, si hará frío o calor y si habrá viento a la hora del partido. Sin ese dato tendría que salir de la aplicación para consultarlo.

Mostrar el pronóstico en la misma tarjeta permite:

- Decidir con más información si conviene inscribirse o darse de baja.
- Comparar partidos de distintos días y horarios según sus condiciones.
- Anticipar a quien organiza una posible suspensión por mal tiempo.

Open-Meteo se eligió porque entrega pronóstico por hora a partir de coordenadas, no exige clave ni registro y su licencia permite el uso académico con atribución.

## Uso de Inteligencia Artificial

Este proyecto utilizó herramientas de IA como apoyo. Cada integrante revisó el código asistido y es responsable de explicarlo.

### Alonso: API del clima y documentación

| Elemento | Detalle |
| --- | --- |
| Herramienta | Claude (Anthropic) |
| Propósito | Generación de código y documentación: `weatherService.js`, `WeatherBadge.jsx`, `WeatherBadge.css`, la conexión del indicador en `App.jsx` y el borrador de este README. Revisión de la documentación oficial de Open-Meteo. |
| Consulta representativa | "A partir de todo lo que falta, haz las cosas que le corresponden a Alonso", junto con la lista de tareas pendientes del equipo y el contrato de datos de cada partido. |
| Resultado | La herramienta consultó la documentación, los términos y la licencia de Open-Meteo, y entregó el servicio de clima, el componente con sus estados (carga, resultado, error y fallback), sus estilos y la documentación de la API. Probó el código con respuestas simuladas, sin llamar a la API real. |
| Modificación humana | Se ejecutó el proyecto en localhost y se revisó cómo se ve el indicador en las tarjetas. Se pidió quitar los íconos y los comentarios del código y adaptarlo al estilo de la base del proyecto. La conexión del componente en `App.jsx` se probó primero a mano en la copia local. |
| Aprendizaje | Pendiente. |

### Jordan: base React e interacciones

| Elemento | Detalle |
|---|---|
| Herramienta | Codex (OpenAI). |
| Propósito | Apoyar la migración del frontend a React, organizar la estructura inicial y desarrollar las interacciones asignadas. También se consultaron dudas sobre Git, ramas y Pull Requests. |
| Consulta representativa | “Recuerda que soy Jordan, así que haremos todo lo que es parte de mí”, junto con el frontend anterior, la pauta y el reparto de responsabilidades. |
| Resultado | Se obtuvo una base con React, Vite y Bootstrap, además de código para gestionar inscripciones, cancelaciones, creación de partidos y persistencia con `localStorage`. La IA también apoyó la resolución del conflicto entre los componentes del feed y el indicador del clima. |
| Modificación humana | Se definió el alcance de la participación de Jordan y se ajustó el reparto del equipo para asumir la base React. Se configuró el repositorio remoto, se publicaron los cambios y se gestionaron los Pull Requests. Durante la integración, se proporcionó el conflicto y se coordinó la combinación de los aportes del equipo. |
| Aprendizaje | Se trabajó con estado React, props, formularios controlados y actualizaciones inmutables. También se aprendió el propósito de las ramas `feature/*`, `develop` y `main`, y cómo integrar contribuciones mediante Pull Requests. |

### Kevin: diseño, feed, búsqueda y filtros

| Elemento | Detalle |
| --- | --- |
| Herramienta | Codex (OpenAI). |
| Propósito | Diseño de la interfaz visual, estructuración de la grilla del feed, desarrollo de la barra de búsqueda y filtros reactivos, además de componentes de presentación (tarjetas de partidos y estados vacíos). |
| Consulta representativa | "Soy Kevin, ayúdame a desarrollar los componentes del Feed, las tarjetas de partido y los filtros con búsqueda en tiempo real en React, asegurando un diseño responsivo y buenas prácticas de estado." |
| Resultado | Se obtuvo la estructura de componentes para listar partidos, la lógica de filtrado acumulativo (búsqueda por texto, deporte o comuna) y el diseño de las tarjetas con Bootstrap y CSS, junto con vistas alternativas cuando no hay resultados (*empty states*). |
| Modificación humana | Se corrigió la implementación para usar estado derivado en tiempo de render en vez de duplicar estados en memoria, evitando desincronizaciones con las inscripciones. Se asignaron `keys` únicas para la reconciliación del Virtual DOM, se ajustaron los estilos responsivos y se integró con el estado global de `App.jsx`. |
| Aprendizaje | Se profundizó en estado derivado vs. estado redundante, inmutabilidad con métodos funcionales (`filter`, `map`), optimización de renderizado en listas mediante Virtual DOM y diseño de interfaces responsivas y accesibles. |

## Limitaciones conocidas

**Datos y persistencia del Hito 2 (ver la evolución del Hito 3 más abajo)**

- No existe backend. Los partidos y las inscripciones se guardan en el `localStorage` del navegador, por lo que no se comparten entre personas ni entre dispositivos.
- Si se borran los datos del navegador, la aplicación vuelve a los partidos iniciales.
- En el Hito 3, el backend es la fuente de los partidos y el navegador guarda una copia por almacenamiento.
- Las inscripciones son simuladas: sin backend no hay cuentas de usuario ni autenticación real.

**Clima**

- Los partidos creados usan las coordenadas predeterminadas de Quillota; el formulario todavía no permite seleccionar coordenadas distintas.
- La aplicación limita las fechas a hoy y los próximos 14 días. Los ejemplos de `shared/initialMatches.js` generan sus fechas al iniciar.
- El pronóstico es por hora: un partido a las 18:30 muestra el valor de las 18:00.
- El dato corresponde a la celda del modelo meteorológico más cercana a la coordenada indicada, que puede estar a algunos kilómetros.
- Las horas se piden en la zona horaria del lugar del partido. Si hay un cambio de hora oficial entre el día de la consulta y el día del partido, el valor mostrado puede corresponder a la hora anterior o siguiente.
- El clima requiere conexión a internet y depende de la disponibilidad de Open-Meteo. Las respuestas se conservan solo en memoria: al recargar la página se consultan de nuevo.
- El acceso gratuito a la API no admite uso comercial.

## Flujo de trabajo con Git

- `main`: versión entregable.
- `develop`: integración del trabajo del equipo.
- Una rama `feature/` por integrante, integrada a `develop` mediante Pull Request con revisión de otro integrante.
- Pull Request final de `develop` hacia `main` una vez revisada la integración completa.


---

## Evolución Hito 3 — Plataforma Web Full Stack (MySQL + MongoDB)

### 1. Cómo activar las Bases de Datos y levantar el proyecto

1. **Base de datos SQL (MySQL)**:
   - Abre MySQL Workbench o la consola y ejecuta el script `backend/sql/init.sql`. Esto creará la base de datos `faltauno_db` con las tablas `users`, `matches` y `registrations` y sus datos iniciales. Si ya tenías la base creada, vuelve a ejecutar el script para agregar la tabla `registrations`; no borra los datos existentes.
   - Si tu usuario de MySQL tiene contraseña, puedes copiar `backend/.env.example` a `backend/.env` y ajustar `MYSQL_USER` y `MYSQL_PASSWORD` (por defecto usa `root` sin contraseña en `localhost:3306`).
2. **Base de datos NoSQL (MongoDB)**:
   - Asegúrate de tener activo MongoDB Server local en `mongodb://localhost:27017`. Puedes visualizar los datos con MongoDB Compass. La base de datos `faltauno_nosql` utiliza las colecciones `matches` y `logs`. La primera vez que se crea `matches` se agregan tres partidos de ejemplo.
3. **Levantar Backend y Frontend en dos terminales**:

```bash
# Instalar dependencias del backend (solo la primera vez)
cd backend
npm install
cd ..

# Terminal 1: levantar el Backend (http://localhost:4000)
npm run start:backend

# Terminal 2: levantar el Frontend React (http://localhost:5173)
npm run dev
```

| Servicio | Dirección | Descripción |
| :--- | :--- | :--- |
| **Frontend React** | `http://localhost:5173` | Interfaz principal con Login, Registro, Cartelera e Indicadores |
| **Backend API REST** | `http://localhost:4000/api` | Servidor Express conectado a MySQL y MongoDB |
| **Swagger / OpenAPI** | `http://localhost:4000/api/docs` | Documentación interactiva para probar todos los endpoints |

### 2. Autenticación y cuentas de prueba

El sistema de Login y Registro (`src/components/Login.jsx`) valida que el correo exista antes de permitir el ingreso. Las cuentas iniciales precargadas en `backend/sql/init.sql` y `src/data/initialUsers.json` son:

| Nombre | Correo electrónico | Contraseña | Rol |
| :--- | :--- | :--- | :--- |
| **Kevin** | `kevin@faltauno.cl` | `123456` | Administrador |
| **Matías Rojas** | `matias@faltauno.cl` | `123456` | Jugador |
| **Camila Soto** | `camila@faltauno.cl` | `123456` | Jugador |
| **Diego Morales** | `diego@faltauno.cl` | `123456` | Jugador |

Kevin es el único administrador y puede crear, editar y eliminar partidos. Las cuentas nuevas siempre son jugadores. Todos pueden consultar partidos, inscribirse, cancelar su propia participación y descargar el calendario. Los permisos también se verifican en el backend mediante un token de sesión, válido durante 24 horas. Al reiniciar el backend se debe iniciar sesión nuevamente.

Las cuentas son compartidas entre los tres almacenamientos: se validan en MySQL o en memoria cuando MySQL no está disponible. Cambiar de almacenamiento cambia los partidos y sus inscripciones.

### 3. Persistencia SQL (MySQL) y NoSQL (MongoDB)

- **MySQL (`backend/sql/init.sql`)**:
  - Tabla `users`: almacena las cuentas registradas (`id`, `name`, `email` único, `password`, `role`, `favorite_sport`).
  - Tabla `matches`: almacena los partidos publicados (`id`, `sport`, `location`, `date`, `time`, `level`, `slots`, `latitude`, `longitude`, `organizer_id`).
  - Tabla `registrations`: guarda las inscripciones (`id`, `match_id`, `user_id`, `created_at`). Cada usuario puede inscribirse una sola vez en cada partido. Al eliminar un usuario o partido se eliminan sus inscripciones en cascada.
- **MongoDB (`backend/src/db.js`)**:
  - Colección `matches`: guarda sus propios partidos. Cada documento incluye un arreglo `registrations` con `id`, `userId` y `created_at`. La inscripción y el cambio de cupo se actualizan juntos en el documento, sin requerir configurar un replica set.
  - Colección `logs`: guarda la actividad de los tres almacenamientos (`LOGIN`, `REGISTRO`, `INSCRIPCION`, `BAJA`, `NUEVO_PARTIDO`, `EDITAR_PARTIDO`, `ELIMINAR_PARTIDO`, `AJUSTAR_FECHA`). El campo `storage` indica `memory`, `mysql` o `mongodb`.
- **Memoria (`backend/src/db.js`)**: utiliza `localMatches` y `localRegistrations`. Es un conjunto independiente y temporal; se reinicia al apagar el backend.

### 4. Endpoints del Backend (`/api`)

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Inicia sesión validando correo y contraseña en MySQL y guarda acceso en MongoDB |
| `POST` | `/api/auth/register` | Registra un nuevo usuario en MySQL y guarda el evento en MongoDB |
| `POST` | `/api/auth/logout` | Cierra la sesión e invalida su token |
| `GET` | `/api/matches` | Lista los partidos del almacenamiento elegido dentro del rango de fechas |
| `GET` | `/api/matches/stats` | Obtiene indicadores de partidos publicados, abiertos y cupos |
| `POST` | `/api/matches` | Kevin crea un partido en el almacenamiento elegido |
| `PUT` | `/api/matches/:id` | Kevin edita un partido en el almacenamiento elegido |
| `DELETE` | `/api/matches/:id` | Kevin elimina el partido y sus inscripciones del almacenamiento elegido |
| `GET` | `/api/registrations?userId=...` | Lista los IDs de partidos en los que está inscrito el usuario |
| `POST` | `/api/registrations` | Recibe `matchId`, `userId`, `userEmail`; guarda la inscripción, descuenta un cupo y registra `INSCRIPCION` |
| `DELETE` | `/api/registrations/:matchId?userId=...&userEmail=...` | Cancela la inscripción, devuelve un cupo y registra `BAJA` |
| `GET` | `/api/logs` | Lista los últimos 20 eventos del almacenamiento elegido; cada jugador ve los suyos y Kevin ve todos |
| `POST` | `/api/logs` | Registra un evento de actividad en MongoDB |

### 5. Inscripciones y calendario (Integrante 3)

- Al iniciar sesión o cambiar de almacenamiento se consultan los partidos y las inscripciones correspondientes. El navegador conserva una copia por usuario y almacenamiento en `faltauno.myMatches.v1.<storage>.<userId>` y guarda los partidos en `faltauno.matches.v1.<storage>` como respaldo de lectura.
- "Yo apaño" y "Dar de baja" esperan la confirmación del backend y usan los cupos devueltos por este. Si la operación falla, se muestra el error. MySQL guarda la inscripción y el cambio de cupos en una transacción para evitar sobrecupos y cambios parciales.
- Cada inscripción o baja genera un solo evento en MongoDB, visible en "Actividad reciente" al hacer clic en el nombre del usuario.
- El selector "Almacenamiento" permite elegir Memoria, MySQL o MongoDB. Cada opción conserva sus propios partidos, cupos e inscripciones. Si se elige una base no disponible se informa el error y se puede elegir otra opción. El modo memoria también requiere tener el backend encendido.
- En "Mis partidos", "Agendar en calendario" descarga un archivo `.ics` con deporte, lugar, fecha y hora local del partido. Se puede importar en un calendario compatible. No se fija una duración porque el partido no tiene hora de término.

### 6. Fechas y pruebas desde Swagger

La fecha de un partido debe estar entre hoy y los próximos 14 días, usando la zona `America/Santiago`. Se valida al crear y editar tanto en el formulario como en el backend. Los ejemplos de memoria generan fechas relativas a hoy. Al arrancar el backend, los partidos existentes fuera del rango se reubican dentro de los próximos 14 días, conservando sus IDs, cupos e inscripciones; el ajuste queda registrado en el historial.

En Swagger, ejecutar primero `POST /api/auth/login`, copiar `user.token` y pegarlo en **Authorize**. Los endpoints de partidos, inscripciones e historial aceptan `storage=memory`, `storage=mysql` o `storage=mongodb`. Ejemplo: `GET /api/matches?storage=mongodb`.

En Compass se pueden consultar `faltauno_nosql.matches` (incluido su arreglo `registrations`) y `faltauno_nosql.logs`. El historial de la aplicación muestra el almacenamiento elegido. Si MongoDB falla al guardar un evento, ese evento se conserva temporalmente en `localLogs`.

Para verificar el frontend, ejecutar desde la raíz:

```bash
npm run lint
npm run build
```
