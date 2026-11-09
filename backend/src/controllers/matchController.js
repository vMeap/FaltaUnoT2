import crypto from 'node:crypto'
import { pool, matchesCollection, localMatches, localRegistrations, saveLog } from '../db.js'
import { matchDate, validMatchDate } from '../../../shared/dates.js'

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

function matchError(match) {
    if (['sport', 'level', 'location'].some((key) => typeof match[key] !== 'string' || !match[key].trim())) {
        return 'Completa los datos del partido.'
    }
    if (!validMatchDate(match.date)) return 'La fecha debe estar entre hoy y los próximos 14 días.'
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(match.time)) return 'Indica una hora válida.'
    if (!Number.isInteger(match.slots) || match.slots < 0 || match.slots > 20) return 'Indica entre 0 y 20 cupos.'
    return ''
}

async function listMatches(storage) {
    if (storage === 'mysql') {
        const [rows] = await pool.query('SELECT * FROM matches WHERE date BETWEEN ? AND ? ORDER BY date, time', [matchDate(), matchDate(14)])
        return rows.map(formatRow)
    }
    if (storage === 'mongodb') {
        const rows = await matchesCollection.find({ date: { $gte: matchDate(), $lte: matchDate(14) } }).sort({ date: 1, time: 1 }).toArray()
        return rows.map(formatRow)
    }
    return localMatches.filter((match) => validMatchDate(match.date)).map(formatRow).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
}

export async function getMatches(req, res) {
    try {
        let list = await listMatches(req.storage)
        if (req.query.sport && req.query.sport !== 'Todos') list = list.filter((match) => match.sport === req.query.sport)
        return res.json(list)
    } catch {
        return res.status(500).json({ error: 'Error al obtener partidos.' })
    }
}

export async function getMatchStats(req, res) {
    try {
        const list = await listMatches(req.storage)
        return res.json({
            totalMatches: list.length,
            openMatches: list.filter((match) => match.slots > 0).length,
            totalSlots: list.reduce((sum, match) => sum + match.slots, 0)
        })
    } catch {
        return res.status(500).json({ error: 'Error al calcular indicadores.' })
    }
}

export async function createMatch(req, res) {
    try {
        const { sport, level, date, time, location, slots } = req.body
        const newMatch = {
            id: crypto.randomUUID(), sport, level, date, time, location,
            slots: Number(slots), latitude: -32.883, longitude: -71.248, organizerId: req.user.id
        }
        const error = matchError(newMatch)
        if (error) return res.status(400).json({ error })
        newMatch.location = location.trim()
        if (req.storage === 'mysql') {
            await pool.query(
                'INSERT INTO matches (id, sport, location, date, time, level, slots, latitude, longitude, organizer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [newMatch.id, sport, newMatch.location, date, time, level, newMatch.slots, newMatch.latitude, newMatch.longitude, req.user.id]
            )
        } else if (req.storage === 'mongodb') {
            await matchesCollection.insertOne({ ...newMatch, registrations: [] })
        } else {
            localMatches.unshift(newMatch)
        }
        await saveLog(req.user.email, 'NUEVO_PARTIDO', `Publicó partido de ${sport} en ${newMatch.location}`, req.storage)
        return res.status(201).json(newMatch)
    } catch {
        return res.status(500).json({ error: 'Error al crear el partido.' })
    }
}

export async function updateMatch(req, res) {
    try {
        const { id } = req.params
        let match
        if (req.storage === 'mysql') {
            const [rows] = await pool.query('SELECT * FROM matches WHERE id = ?', [id])
            match = rows[0]
        } else if (req.storage === 'mongodb') {
            match = await matchesCollection.findOne({ id })
        } else {
            match = localMatches.find((item) => item.id === id)
        }
        if (!match) return res.status(404).json({ error: 'Partido no encontrado.' })
        const changes = {}
        for (const key of ['sport', 'level', 'date', 'time', 'location', 'slots']) {
            if (req.body[key] !== undefined) changes[key] = req.body[key]
        }
        if (changes.slots !== undefined) changes.slots = Number(changes.slots)
        const error = matchError({ ...formatRow(match), ...changes })
        if (error) return res.status(400).json({ error })
        if (changes.location !== undefined) changes.location = changes.location.trim()
        let updated
        if (req.storage === 'mysql') {
            await pool.query(
                `UPDATE matches SET sport = COALESCE(?, sport), level = COALESCE(?, level),
                 date = COALESCE(?, date), time = COALESCE(?, time), location = COALESCE(?, location), slots = COALESCE(?, slots) WHERE id = ?`,
                [changes.sport ?? null, changes.level ?? null, changes.date ?? null, changes.time ?? null, changes.location ?? null, changes.slots ?? null, id]
            )
            const [rows] = await pool.query('SELECT * FROM matches WHERE id = ?', [id])
            if (!rows[0]) return res.status(404).json({ error: 'Partido no encontrado.' })
            updated = formatRow(rows[0])
        } else if (req.storage === 'mongodb') {
            const row = await matchesCollection.findOneAndUpdate({ id }, { $set: changes }, { returnDocument: 'after' })
            if (!row) return res.status(404).json({ error: 'Partido no encontrado.' })
            updated = formatRow(row)
        } else {
            Object.assign(match, changes)
            updated = formatRow(match)
        }
        await saveLog(req.user.email, 'EDITAR_PARTIDO', `Editó partido de ${updated.sport} en ${updated.location}`, req.storage)
        return res.json(updated)
    } catch {
        return res.status(500).json({ error: 'Error al actualizar el partido.' })
    }
}

export async function deleteMatch(req, res) {
    try {
        const { id } = req.params
        let match
        if (req.storage === 'mysql') {
            const [rows] = await pool.query('SELECT * FROM matches WHERE id = ?', [id])
            match = rows[0]
            if (match) {
                const [result] = await pool.query('DELETE FROM matches WHERE id = ?', [id])
                if (!result.affectedRows) match = null
            }
        } else if (req.storage === 'mongodb') {
            match = await matchesCollection.findOneAndDelete({ id })
        } else {
            const index = localMatches.findIndex((item) => item.id === id)
            if (index !== -1) {
                match = localMatches.splice(index, 1)[0]
                for (let i = localRegistrations.length - 1; i >= 0; i--) {
                    if (localRegistrations[i].matchId === id) localRegistrations.splice(i, 1)
                }
            }
        }
        if (!match) return res.status(404).json({ error: 'Partido no encontrado.' })
        await saveLog(req.user.email, 'ELIMINAR_PARTIDO', `Eliminó partido de ${match.sport} en ${match.location}`, req.storage)
        return res.json({ ok: true })
    } catch {
        return res.status(500).json({ error: 'Error al eliminar el partido.' })
    }
}
