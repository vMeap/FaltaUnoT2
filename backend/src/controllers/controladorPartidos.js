import crypto from 'node:crypto'
import { conexionesMySQL, coleccionPartidos, partidosEnMemoria, inscripcionesEnMemoria, guardarActividad } from '../baseDeDatos.js'
import { fechaPartido, esFechaPartidoValida } from '../../../shared/fechas.js'
import { buscarSede } from '../../../shared/sedes.js'

function formatearFila(fila) {
    return {
        id: fila.id,
        sport: fila.sport,
        location: fila.location,
        date: fila.date,
        time: fila.time,
        level: fila.level,
        slots: Number(fila.slots),
        latitude: fila.latitude ?? -32.883,
        longitude: fila.longitude ?? -71.248,
        organizerId: fila.organizer_id || fila.organizerId || null
    }
}

function validarPartido(partido) {
    if (['sport', 'level', 'location'].some((clave) => typeof partido[clave] !== 'string' || !partido[clave].trim())) {
        return 'Completa los datos del partido.'
    }
    if (!buscarSede(partido.sport, partido.location)) return 'Selecciona una cancha disponible para el deporte elegido.'
    if (!esFechaPartidoValida(partido.date)) return 'La fecha debe estar entre hoy y los próximos 14 días.'
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(partido.time)) return 'Indica una hora válida.'
    if (!Number.isInteger(partido.slots) || partido.slots < 0 || partido.slots > 20) return 'Indica entre 0 y 20 cupos.'
    return ''
}

async function listarPartidos(almacenamiento) {
    if (almacenamiento === 'mysql') {
        const [filas] = await conexionesMySQL.query('SELECT * FROM matches WHERE date BETWEEN ? AND ? ORDER BY date, time', [fechaPartido(), fechaPartido(14)])
        return filas.map(formatearFila)
    }
    if (almacenamiento === 'mongodb') {
        const filas = await coleccionPartidos.find({ date: { $gte: fechaPartido(), $lte: fechaPartido(14) } }).sort({ date: 1, time: 1 }).toArray()
        return filas.map(formatearFila)
    }
    return partidosEnMemoria.filter((partido) => esFechaPartidoValida(partido.date)).map(formatearFila).sort((primero, segundo) => `${primero.date} ${primero.time}`.localeCompare(`${segundo.date} ${segundo.time}`))
}

export async function obtenerPartidos(solicitud, salida) {
    try {
        let lista = await listarPartidos(solicitud.storage)
        if (solicitud.query.sport && solicitud.query.sport !== 'Todos') lista = lista.filter((partido) => partido.sport === solicitud.query.sport)
        return salida.json(lista)
    } catch {
        return salida.status(500).json({ error: 'Error al obtener partidos.' })
    }
}

export async function obtenerEstadisticasPartidos(solicitud, salida) {
    try {
        const lista = await listarPartidos(solicitud.storage)
        return salida.json({
            totalMatches: lista.length,
            openMatches: lista.filter((partido) => partido.slots > 0).length,
            totalSlots: lista.reduce((suma, partido) => suma + partido.slots, 0)
        })
    } catch {
        return salida.status(500).json({ error: 'Error al calcular indicadores.' })
    }
}

export async function crearPartido(solicitud, salida) {
    try {
        const { sport: deporte, level: nivel, date: fecha, time: hora, location: ubicacion, slots: cupos } = solicitud.body
        const nuevoPartido = {
            id: crypto.randomUUID(), sport: deporte, level: nivel, date: fecha, time: hora, location: ubicacion,
            slots: Number(cupos), latitude: -32.883, longitude: -71.248, organizerId: solicitud.user.id
        }
        const error = validarPartido(nuevoPartido)
        if (error) return salida.status(400).json({ error })
        const sede = buscarSede(deporte, ubicacion)
        nuevoPartido.latitude = sede.latitude
        nuevoPartido.longitude = sede.longitude
        if (solicitud.storage === 'mysql') {
            await conexionesMySQL.query(
                'INSERT INTO matches (id, sport, location, date, time, level, slots, latitude, longitude, organizer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [nuevoPartido.id, deporte, nuevoPartido.location, fecha, hora, nivel, nuevoPartido.slots, nuevoPartido.latitude, nuevoPartido.longitude, solicitud.user.id]
            )
        } else if (solicitud.storage === 'mongodb') {
            await coleccionPartidos.insertOne({ ...nuevoPartido, registrations: [] })
        } else {
            partidosEnMemoria.unshift(nuevoPartido)
        }
        await guardarActividad(solicitud.user.email, 'NUEVO_PARTIDO', `Publicó partido de ${deporte} en ${nuevoPartido.location}`, solicitud.storage)
        return salida.status(201).json(nuevoPartido)
    } catch {
        return salida.status(500).json({ error: 'Error al crear el partido.' })
    }
}

export async function actualizarPartido(solicitud, salida) {
    try {
        const { id: identificador } = solicitud.params
        let partido
        if (solicitud.storage === 'mysql') {
            const [filas] = await conexionesMySQL.query('SELECT * FROM matches WHERE id = ?', [identificador])
            partido = filas[0]
        } else if (solicitud.storage === 'mongodb') {
            partido = await coleccionPartidos.findOne({ id: identificador })
        } else {
            partido = partidosEnMemoria.find((elemento) => elemento.id === identificador)
        }
        if (!partido) return salida.status(404).json({ error: 'Partido no encontrado.' })
        const cambios = {}
        for (const clave of ['sport', 'level', 'date', 'time', 'location', 'slots']) {
            if (solicitud.body[clave] !== undefined) cambios[clave] = solicitud.body[clave]
        }
        if (cambios.slots !== undefined) cambios.slots = Number(cambios.slots)
        const candidato = { ...formatearFila(partido), ...cambios }
        const error = validarPartido(candidato)
        if (error) return salida.status(400).json({ error })
        const sede = buscarSede(candidato.sport, candidato.location)
        cambios.latitude = sede.latitude
        cambios.longitude = sede.longitude
        let actualizado
        if (solicitud.storage === 'mysql') {
            await conexionesMySQL.query(
                `UPDATE matches SET sport = COALESCE(?, sport), level = COALESCE(?, level),
                 date = COALESCE(?, date), time = COALESCE(?, time), location = COALESCE(?, location), slots = COALESCE(?, slots), latitude = ?, longitude = ? WHERE id = ?`,
                [cambios.sport ?? null, cambios.level ?? null, cambios.date ?? null, cambios.time ?? null, cambios.location ?? null, cambios.slots ?? null, cambios.latitude, cambios.longitude, identificador]
            )
            const [filas] = await conexionesMySQL.query('SELECT * FROM matches WHERE id = ?', [identificador])
            if (!filas[0]) return salida.status(404).json({ error: 'Partido no encontrado.' })
            actualizado = formatearFila(filas[0])
        } else if (solicitud.storage === 'mongodb') {
            const fila = await coleccionPartidos.findOneAndUpdate({ id: identificador }, { $set: cambios }, { returnDocument: 'after' })
            if (!fila) return salida.status(404).json({ error: 'Partido no encontrado.' })
            actualizado = formatearFila(fila)
        } else {
            Object.assign(partido, cambios)
            actualizado = formatearFila(partido)
        }
        await guardarActividad(solicitud.user.email, 'EDITAR_PARTIDO', `Editó partido de ${actualizado.sport} en ${actualizado.location}`, solicitud.storage)
        return salida.json(actualizado)
    } catch {
        return salida.status(500).json({ error: 'Error al actualizar el partido.' })
    }
}

export async function eliminarPartido(solicitud, salida) {
    try {
        const { id: identificador } = solicitud.params
        let partido
        if (solicitud.storage === 'mysql') {
            const [filas] = await conexionesMySQL.query('SELECT * FROM matches WHERE id = ?', [identificador])
            partido = filas[0]
            if (partido) {
                const [resultado] = await conexionesMySQL.query('DELETE FROM matches WHERE id = ?', [identificador])
                if (!resultado.affectedRows) partido = null
            }
        } else if (solicitud.storage === 'mongodb') {
            partido = await coleccionPartidos.findOneAndDelete({ id: identificador })
        } else {
            const indice = partidosEnMemoria.findIndex((elemento) => elemento.id === identificador)
            if (indice !== -1) {
                partido = partidosEnMemoria.splice(indice, 1)[0]
                for (let posicion = inscripcionesEnMemoria.length - 1; posicion >= 0; posicion--) {
                    if (inscripcionesEnMemoria[posicion].matchId === identificador) inscripcionesEnMemoria.splice(posicion, 1)
                }
            }
        }
        if (!partido) return salida.status(404).json({ error: 'Partido no encontrado.' })
        await guardarActividad(solicitud.user.email, 'ELIMINAR_PARTIDO', `Eliminó partido de ${partido.sport} en ${partido.location}`, solicitud.storage)
        return salida.json({ ok: true })
    } catch {
        return salida.status(500).json({ error: 'Error al eliminar el partido.' })
    }
}
