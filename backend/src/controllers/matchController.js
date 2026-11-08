import crypto from 'node:crypto'
import { pool, pgAvailable, localMatches, saveLog } from '../db.js'

function formatRow(row) {
    return {
        id: row.id,
        sport: row.sport,
        location: row.location,
        date: row.date,
        time: row.time,
        level: row.level,
        slots: Number(row.slots),
        latitude: row.latitude ?? -32.883,
        longitude: row.longitude ?? -71.248,
        organizerId: row.organizer_id || row.organizerId || null
    }
}

export async function getMatches(req, res) {
    try {
        const { sport } = req.query
        let list = []

        if (pgAvailable) {
            const result = await pool.query('SELECT * FROM matches ORDER BY date ASC, time ASC')
            list = result.rows.map(formatRow)
        } else {
            list = [...localMatches]
        }

        if (sport && sport !== 'Todos') {
            list = list.filter((m) => m.sport === sport)
        }

        return res.json(list)
    } catch {
        return res.status(500).json({ error: 'Error al obtener partidos.' })
    }
}

export async function getMatchStats(_req, res) {
    try {
        let list = []
        if (pgAvailable) {
            const result = await pool.query('SELECT * FROM matches')
            list = result.rows.map(formatRow)
        } else {
            list = localMatches
        }

        const totalMatches = list.length
        const openMatches = list.filter((m) => m.slots > 0).length
        const totalSlots = list.reduce((sum, m) => sum + Number(m.slots || 0), 0)

        return res.json({ totalMatches, openMatches, totalSlots })
    } catch {
        return res.status(500).json({ error: 'Error al calcular indicadores.' })
    }
}

export async function createMatch(req, res) {
    try {
        const { sport, level, date, time, location, slots, organizerId, userEmail } = req.body

        if (!sport || !level || !date || !time || !location || !slots) {
            return res.status(400).json({ error: 'Todos los campos del partido son obligatorios.' })
        }

        const newMatch = {
            id: crypto.randomUUID(),
            sport,
            level,
            date,
            time,
            location: location.trim(),
            slots: Number(slots),
            latitude: -32.883,
            longitude: -71.248,
            organizerId: organizerId || null
        }

        if (pgAvailable) {
            await pool.query(
                `INSERT INTO matches (id, sport, location, date, time, level, slots, latitude, longitude, organizer_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    newMatch.id,
                    newMatch.sport,
                    newMatch.location,
                    newMatch.date,
                    newMatch.time,
                    newMatch.level,
                    newMatch.slots,
                    newMatch.latitude,
                    newMatch.longitude,
                    newMatch.organizerId
                ]
            )
        } else {
            localMatches.unshift(newMatch)
        }

        await saveLog(
            userEmail || 'organizador',
            'NUEVO_PARTIDO',
            `Publicó partido de ${newMatch.sport} en ${newMatch.location}`
        )

        return res.status(201).json(newMatch)
    } catch {
        return res.status(500).json({ error: 'Error al crear el partido.' })
    }
}

export async function updateMatch(req, res) {
    try {
        const { id } = req.params
        const { sport, level, date, time, location, slots, userEmail } = req.body

        if (pgAvailable) {
            const result = await pool.query(
                `UPDATE matches
                 SET sport = COALESCE($2, sport),
                     level = COALESCE($3, level),
                     date = COALESCE($4, date),
                     time = COALESCE($5, time),
                     location = COALESCE($6, location),
                     slots = COALESCE($7, slots)
                 WHERE id = $1
                 RETURNING *`,
                [id, sport, level, date, time, location, slots !== undefined ? Number(slots) : null]
            )

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Partido no encontrado.' })
            }

            const updated = formatRow(result.rows[0])
            await saveLog(userEmail || 'organizador', 'EDITAR_PARTIDO', `Editó partido de ${updated.sport} en ${updated.location}`)
            return res.json(updated)
        }

        const index = localMatches.findIndex((m) => m.id === id)
        if (index === -1) {
            return res.status(404).json({ error: 'Partido no encontrado.' })
        }

        localMatches[index] = {
            ...localMatches[index],
            sport: sport ?? localMatches[index].sport,
            level: level ?? localMatches[index].level,
            date: date ?? localMatches[index].date,
            time: time ?? localMatches[index].time,
            location: location ? location.trim() : localMatches[index].location,
            slots: slots !== undefined ? Number(slots) : localMatches[index].slots
        }

        await saveLog(userEmail || 'organizador', 'EDITAR_PARTIDO', `Editó partido de ${localMatches[index].sport} en ${localMatches[index].location}`)
        return res.json(localMatches[index])
    } catch {
        return res.status(500).json({ error: 'Error al actualizar el partido.' })
    }
}

export async function deleteMatch(req, res) {
    try {
        const { id } = req.params

        if (pgAvailable) {
            const result = await pool.query('DELETE FROM matches WHERE id = $1 RETURNING *', [id])
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Partido no encontrado.' })
            }
            return res.json({ ok: true })
        }

        const index = localMatches.findIndex((m) => m.id === id)
        if (index === -1) {
            return res.status(404).json({ error: 'Partido no encontrado.' })
        }

        localMatches.splice(index, 1)
        return res.json({ ok: true })
    } catch {
        return res.status(500).json({ error: 'Error al eliminar el partido.' })
    }
}

