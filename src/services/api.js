const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const CLAVE_ALMACENAMIENTO = 'faltauno.storage.v1'

export function obtenerAlmacenamiento() {
    const almacenamiento = localStorage.getItem(CLAVE_ALMACENAMIENTO)
    return ['memory', 'mysql', 'mongodb'].includes(almacenamiento) ? almacenamiento : 'mysql'
}

async function realizarSolicitud(ruta, opciones = {}, almacenamiento = obtenerAlmacenamiento()) {
    let token
    try {
        token = JSON.parse(localStorage.getItem('faltauno.user.v1') || sessionStorage.getItem('faltauno.user.v1') || 'null')?.token
    } catch {}
    const separador = ruta.includes('?') ? '&' : '?'
    const respuesta = await fetch(`${URL_API}${ruta}${separador}${new URLSearchParams({ storage: almacenamiento })}`, {
        ...opciones,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
    const datos = await respuesta.json()
    if (!respuesta.ok) {
        const error = new Error(datos.error || 'No se pudo completar la solicitud.')
        error.status = respuesta.status
        throw error
    }
    return datos
}

export async function iniciarSesionUsuario(correo, contrasena) {
    const datos = await realizarSolicitud('/auth/login', { method: 'POST', body: JSON.stringify({ email: correo, password: contrasena }) })
    return datos.user
}

export async function registrarCuenta(nombre, correo, contrasena) {
    const datos = await realizarSolicitud('/auth/register', { method: 'POST', body: JSON.stringify({ name: nombre, email: correo, password: contrasena }) })
    return datos.user
}

export function cerrarSesionUsuario() {
    return realizarSolicitud('/auth/logout', { method: 'POST' })
}

export function consultarPartidos(almacenamiento) {
    return realizarSolicitud('/matches', {}, almacenamiento)
}

export function crearPartidoApi(valores, almacenamiento) {
    return realizarSolicitud('/matches', { method: 'POST', body: JSON.stringify(valores) }, almacenamiento)
}

export function actualizarPartidoApi(identificador, valores, almacenamiento) {
    return realizarSolicitud(`/matches/${encodeURIComponent(identificador)}`, { method: 'PUT', body: JSON.stringify(valores) }, almacenamiento)
}

export function eliminarPartidoApi(identificador, almacenamiento) {
    return realizarSolicitud(`/matches/${encodeURIComponent(identificador)}`, { method: 'DELETE' }, almacenamiento)
}

export function consultarMisInscripciones(idUsuario, almacenamiento) {
    return realizarSolicitud(`/registrations?${new URLSearchParams({ userId: idUsuario })}`, {}, almacenamiento)
}

export function inscribirseEnPartidoApi(idPartido, idUsuario, correoUsuario, almacenamiento) {
    return realizarSolicitud('/registrations', { method: 'POST', body: JSON.stringify({ matchId: idPartido, userId: idUsuario, userEmail: correoUsuario }) }, almacenamiento)
}

export function cancelarInscripcionPartidoApi(idPartido, idUsuario, correoUsuario, almacenamiento) {
    const consulta = new URLSearchParams({ userId: idUsuario, userEmail: correoUsuario })
    return realizarSolicitud(`/registrations/${encodeURIComponent(idPartido)}?${consulta}`, { method: 'DELETE' }, almacenamiento)
}

export function consultarActividad(almacenamiento) {
    return realizarSolicitud('/logs', {}, almacenamiento)
}

export function enviarActividad(correoUsuario, accion, detalle) {
    return realizarSolicitud('/logs', { method: 'POST', body: JSON.stringify({ userEmail: correoUsuario, action: accion, detail: detalle }) })
}

export async function consultarClima(latitud = -32.883, longitud = -71.248) {
    const respuesta = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current_weather=true`)
    if (!respuesta.ok) throw new Error('Error al consultar clima.')
    const datos = await respuesta.json()
    return datos.current_weather
}
