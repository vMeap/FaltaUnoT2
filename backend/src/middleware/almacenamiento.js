import { mysqlDisponible, coleccionPartidos } from '../baseDeDatos.js'

export function seleccionarAlmacenamiento(solicitud, salida, continuar) {
    const almacenamiento = solicitud.query.storage || (mysqlDisponible ? 'mysql' : 'memory')
    if (!['memory', 'mysql', 'mongodb'].includes(almacenamiento)) {
        return salida.status(400).json({ error: 'Almacenamiento inválido.' })
    }
    solicitud.storage = almacenamiento
    if (solicitud.path.startsWith('/auth/') || solicitud.path === '/logs') return continuar()
    if (almacenamiento === 'mysql' && !mysqlDisponible) {
        return salida.status(503).json({ error: 'MySQL no está disponible. Selecciona otro almacenamiento.' })
    }
    if (almacenamiento === 'mongodb' && !coleccionPartidos) {
        return salida.status(503).json({ error: 'MongoDB no está disponible. Selecciona otro almacenamiento.' })
    }
    continuar()
}
