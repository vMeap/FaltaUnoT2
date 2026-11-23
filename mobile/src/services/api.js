export const URL_API =
    process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api'

async function realizarSolicitud(ruta, opciones = {}, almacenamiento = 'mysql', token = '') {
    const separador = ruta.includes('?') ? '&' : '?'
    const url = `${URL_API}${ruta}${separador}storage=${encodeURIComponent(almacenamiento)}`

    const respuesta = await fetch(url, {
        ...opciones,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(opciones.headers || {})
        }
    })

    const datos = await respuesta.json().catch(() => ({}))

    if (!respuesta.ok) {
        const error = new Error(datos.error || 'No se pudo conectar con el servidor.')
        error.status = respuesta.status
        throw error
    }

    return datos
}

export async function iniciarSesionUsuario(correo, contrasena, almacenamiento = 'mysql') {
    const datos = await realizarSolicitud(
        '/auth/login',
        {
            method: 'POST',
            body: JSON.stringify({ email: correo, password: contrasena })
        },
        almacenamiento
    )
    return datos.user
}

export async function registrarCuenta(nombre, correo, contrasena, almacenamiento = 'mysql') {
    const datos = await realizarSolicitud(
        '/auth/register',
        {
            method: 'POST',
            body: JSON.stringify({ name: nombre, email: correo, password: contrasena })
        },
        almacenamiento
    )
    return datos.user
}

export function cerrarSesionUsuario(token, almacenamiento = 'mysql') {
    return realizarSolicitud('/auth/logout', { method: 'POST' }, almacenamiento, token)
}

export function consultarPartidos(almacenamiento = 'mysql', token = '') {
    return realizarSolicitud('/matches', { method: 'GET' }, almacenamiento, token)
}

export function consultarMisInscripciones(idUsuario, almacenamiento = 'mysql', token = '') {
    return realizarSolicitud(
        `/registrations?userId=${encodeURIComponent(idUsuario)}`,
        { method: 'GET' },
        almacenamiento,
        token
    )
}

export function inscribirseEnPartidoApi(idPartido, idUsuario, correoUsuario, almacenamiento = 'mysql', token = '') {
    return realizarSolicitud(
        '/registrations',
        {
            method: 'POST',
            body: JSON.stringify({ matchId: idPartido, userId: idUsuario, userEmail: correoUsuario })
        },
        almacenamiento,
        token
    )
}

export function cancelarInscripcionPartidoApi(idPartido, idUsuario, correoUsuario, almacenamiento = 'mysql', token = '') {
    return realizarSolicitud(
        `/registrations/${encodeURIComponent(idPartido)}?userId=${encodeURIComponent(idUsuario)}&userEmail=${encodeURIComponent(correoUsuario)}`,
        { method: 'DELETE' },
        almacenamiento,
        token
    )
}
