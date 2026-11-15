import crypto from 'node:crypto'
import { conexionesMySQL, coleccionPartidos, inscripcionesEnMemoria, partidosEnMemoria, guardarActividad } from '../baseDeDatos.js'
import { esFechaPartidoValida } from '../../../shared/fechas.js'

export async function obtenerInscripciones(solicitud, salida) {
    try {
        const { userId: idUsuario } = solicitud.query
        if (!idUsuario) {
            return salida.status(400).json({ error: 'Falta el usuario.' })
        }
        if (idUsuario !== solicitud.user.id && solicitud.user.role !== 'admin') {
            return salida.status(403).json({ error: 'Solo puedes consultar tus inscripciones.' })
        }

        if (solicitud.storage === 'mysql') {
            const [filas] = await conexionesMySQL.query('SELECT match_id FROM registrations WHERE user_id = ?', [idUsuario])
            return salida.json(filas.map((fila) => fila.match_id))
        }
        if (solicitud.storage === 'mongodb') {
            const partidos = await coleccionPartidos.find({ 'registrations.userId': idUsuario }, { projection: { id: 1 } }).toArray()
            return salida.json(partidos.map((partido) => partido.id))
        }

        return salida.json(inscripcionesEnMemoria.filter((registro) => registro.userId === idUsuario).map((registro) => registro.matchId))
    } catch {
        return salida.status(500).json({ error: 'Error al obtener inscripciones.' })
    }
}

export async function inscribirseEnPartido(solicitud, salida) {
    let conexion
    let confirmado = false

    try {
        const { matchId: idPartido, userId: idUsuario } = solicitud.body
        if (!idPartido || !idUsuario) {
            return salida.status(400).json({ error: 'Faltan datos de la inscripción.' })
        }
        if (idUsuario !== solicitud.user.id) {
            return salida.status(403).json({ error: 'Solo puedes inscribirte con tu cuenta.' })
        }

        let partido
        let existe

        if (solicitud.storage === 'mysql') {
            conexion = await conexionesMySQL.getConnection()
            await conexion.beginTransaction()
            const [filas] = await conexion.query('SELECT * FROM matches WHERE id = ? FOR UPDATE', [idPartido])
            partido = filas[0]
            const [inscripciones] = await conexion.query(
                'SELECT id FROM registrations WHERE match_id = ? AND user_id = ?', [idPartido, idUsuario]
            )
            existe = inscripciones.length > 0
        } else if (solicitud.storage === 'mongodb') {
            partido = await coleccionPartidos.findOne({ id: idPartido })
            existe = partido?.registrations?.some((registro) => registro.userId === idUsuario)
        } else {
            partido = partidosEnMemoria.find((partidoActual) => partidoActual.id === idPartido)
            existe = inscripcionesEnMemoria.some((registro) => registro.matchId === idPartido && registro.userId === idUsuario)
        }

        if (!partido) {
            return salida.status(404).json({ error: 'Partido no encontrado.' })
        }
        if (existe) {
            return salida.status(409).json({ error: 'Ya estás inscrito en este partido.' })
        }
        if (!esFechaPartidoValida(partido.date)) {
            return salida.status(400).json({ error: 'El partido debe estar entre hoy y los próximos 14 días.' })
        }
        if (Number(partido.slots) <= 0) {
            return salida.status(409).json({ error: 'El partido no tiene cupos disponibles.' })
        }

        const identificador = crypto.randomUUID()
        let cupos = Number(partido.slots) - 1

        if (conexion) {
            await conexion.query('INSERT INTO registrations (id, match_id, user_id) VALUES (?, ?, ?)', [identificador, idPartido, idUsuario])
            await conexion.query('UPDATE matches SET slots = slots - 1 WHERE id = ?', [idPartido])
            await conexion.commit()
            confirmado = true
        } else if (solicitud.storage === 'mongodb') {
            const actualizado = await coleccionPartidos.findOneAndUpdate(
                { id: idPartido, slots: { $gt: 0 }, 'registrations.userId': { $ne: idUsuario } },
                { $inc: { slots: -1 }, $push: { registrations: { id: identificador, userId: idUsuario, created_at: new Date().toISOString() } } },
                { returnDocument: 'after' }
            )
            if (!actualizado) return salida.status(409).json({ error: 'Ya estás inscrito o el partido quedó sin cupos.' })
            cupos = actualizado.slots
        } else {
            inscripcionesEnMemoria.push({ id: identificador, matchId: idPartido, userId: idUsuario })
            partido.slots = cupos
        }

        await guardarActividad(solicitud.user.email, 'INSCRIPCION', `Se inscribió en ${partido.sport} en ${partido.location}`, solicitud.storage)
        return salida.status(201).json({ ok: true, matchId: idPartido, slots: cupos })
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return salida.status(404).json({ error: 'Usuario no encontrado.' })
        }
        if (error.code === 'ER_DUP_ENTRY') {
            return salida.status(409).json({ error: 'Ya estás inscrito en este partido.' })
        }
        return salida.status(500).json({ error: 'Error al inscribirse en el partido.' })
    } finally {
        if (conexion) {
            if (!confirmado) await conexion.rollback().catch(() => {})
            conexion.release()
        }
    }
}

export async function cancelarInscripcionPartido(solicitud, salida) {
    let conexion
    let confirmado = false

    try {
        const { matchId: idPartido } = solicitud.params
        const { userId: idUsuario } = solicitud.query
        if (!idUsuario) {
            return salida.status(400).json({ error: 'Faltan datos de la inscripción.' })
        }
        if (idUsuario !== solicitud.user.id) {
            return salida.status(403).json({ error: 'Solo puedes cancelar tus inscripciones.' })
        }

        let partido

        if (solicitud.storage === 'mysql') {
            conexion = await conexionesMySQL.getConnection()
            await conexion.beginTransaction()
            const [filas] = await conexion.query('SELECT * FROM matches WHERE id = ? FOR UPDATE', [idPartido])
            partido = filas[0]
        } else if (solicitud.storage === 'mongodb') {
            partido = await coleccionPartidos.findOne({ id: idPartido })
        } else {
            partido = partidosEnMemoria.find((partidoActual) => partidoActual.id === idPartido)
        }

        if (!partido) {
            return salida.status(404).json({ error: 'Partido no encontrado.' })
        }

        let cupos = Number(partido.slots) + 1

        if (conexion) {
            const [resultado] = await conexion.query('DELETE FROM registrations WHERE match_id = ? AND user_id = ?', [idPartido, idUsuario])
            if (resultado.affectedRows === 0) {
                return salida.status(404).json({ error: 'No estás inscrito en este partido.' })
            }
            await conexion.query('UPDATE matches SET slots = slots + 1 WHERE id = ?', [idPartido])
            await conexion.commit()
            confirmado = true
        } else if (solicitud.storage === 'mongodb') {
            const actualizado = await coleccionPartidos.findOneAndUpdate(
                { id: idPartido, 'registrations.userId': idUsuario },
                { $inc: { slots: 1 }, $pull: { registrations: { userId: idUsuario } } },
                { returnDocument: 'after' }
            )
            if (!actualizado) return salida.status(404).json({ error: 'No estás inscrito en este partido.' })
            cupos = actualizado.slots
        } else {
            const indice = inscripcionesEnMemoria.findIndex((registro) => registro.matchId === idPartido && registro.userId === idUsuario)
            if (indice === -1) {
                return salida.status(404).json({ error: 'No estás inscrito en este partido.' })
            }
            inscripcionesEnMemoria.splice(indice, 1)
            partido.slots = cupos
        }

        await guardarActividad(solicitud.user.email, 'BAJA', `Canceló inscripción en ${partido.sport} en ${partido.location}`, solicitud.storage)
        return salida.json({ ok: true, matchId: idPartido, slots: cupos })
    } catch {
        return salida.status(500).json({ error: 'Error al cancelar la inscripción.' })
    } finally {
        if (conexion) {
            if (!confirmado) await conexion.rollback().catch(() => {})
            conexion.release()
        }
    }
}
