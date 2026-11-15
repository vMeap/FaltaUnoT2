import crypto from 'node:crypto'

const sesiones = new Map()

export function crearSesion(usuario) {
    const token = crypto.randomUUID()
    const usuarioSesion = {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        role: usuario.email.toLowerCase() === 'kevin@faltauno.cl' ? 'admin' : 'jugador'
    }
    sesiones.set(token, { user: usuarioSesion, expires: Date.now() + 24 * 60 * 60 * 1000 })
    return { ...usuarioSesion, token }
}

export function verificarUsuario(solicitud, salida, continuar) {
    const token = solicitud.headers.authorization?.replace(/^Bearer /, '')
    const sesion = sesiones.get(token)
    if (!sesion || sesion.expires < Date.now()) {
        sesiones.delete(token)
        return salida.status(401).json({ error: 'Inicia sesión nuevamente.' })
    }
    solicitud.user = sesion.user
    continuar()
}

export function verificarAdministrador(solicitud, salida, continuar) {
    if (solicitud.user.role !== 'admin') {
        return salida.status(403).json({ error: 'Solo Kevin puede administrar los partidos.' })
    }
    continuar()
}

export function cerrarSesion(solicitud, salida) {
    sesiones.delete(solicitud.headers.authorization?.replace(/^Bearer /, ''))
    return salida.json({ ok: true })
}
