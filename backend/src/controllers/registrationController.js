import crypto from 'node:crypto'
import { pool, matchesCollection, localRegistrations, localMatches, saveLog } from '../db.js'
import { validMatchDate } from '../../../shared/dates.js'

export async function getRegistrations(req, res) {
    try {
        const { userId } = req.query
        if (!userId) {
            return res.status(400).json({ error: 'Falta el usuario.' })
        }
        if (userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Solo puedes consultar tus inscripciones.' })
        }

        if (req.storage === 'mysql') {
            const [rows] = await pool.query('SELECT match_id FROM registrations WHERE user_id = ?', [userId])
            return res.json(rows.map((row) => row.match_id))
        }
        if (req.storage === 'mongodb') {
            const matches = await matchesCollection.find({ 'registrations.userId': userId }, { projection: { id: 1 } }).toArray()
            return res.json(matches.map((match) => match.id))
        }

        return res.json(localRegistrations.filter((r) => r.userId === userId).map((r) => r.matchId))
    } catch {
        return res.status(500).json({ error: 'Error al obtener inscripciones.' })
    }
}

export async function joinMatch(req, res) {
    let connection
    let committed = false

    try {
        const { matchId, userId } = req.body
        if (!matchId || !userId) {
            return res.status(400).json({ error: 'Faltan datos de la inscripción.' })
        }
        if (userId !== req.user.id) {
            return res.status(403).json({ error: 'Solo puedes inscribirte con tu cuenta.' })
        }

        let match
        let exists

        if (req.storage === 'mysql') {
            connection = await pool.getConnection()
            await connection.beginTransaction()
            const [rows] = await connection.query('SELECT * FROM matches WHERE id = ? FOR UPDATE', [matchId])
            match = rows[0]
            const [registrations] = await connection.query(
                'SELECT id FROM registrations WHERE match_id = ? AND user_id = ?', [matchId, userId]
            )
            exists = registrations.length > 0
        } else if (req.storage === 'mongodb') {
            match = await matchesCollection.findOne({ id: matchId })
            exists = match?.registrations?.some((r) => r.userId === userId)
        } else {
            match = localMatches.find((m) => m.id === matchId)
            exists = localRegistrations.some((r) => r.matchId === matchId && r.userId === userId)
        }

        if (!match) {
            return res.status(404).json({ error: 'Partido no encontrado.' })
        }
        if (exists) {
            return res.status(409).json({ error: 'Ya estás inscrito en este partido.' })
        }
        if (!validMatchDate(match.date)) {
            return res.status(400).json({ error: 'El partido debe estar entre hoy y los próximos 14 días.' })
        }
        if (Number(match.slots) <= 0) {
            return res.status(409).json({ error: 'El partido no tiene cupos disponibles.' })
        }

        const id = crypto.randomUUID()
        let slots = Number(match.slots) - 1

        if (connection) {
            await connection.query('INSERT INTO registrations (id, match_id, user_id) VALUES (?, ?, ?)', [id, matchId, userId])
            await connection.query('UPDATE matches SET slots = slots - 1 WHERE id = ?', [matchId])
            await connection.commit()
            committed = true
        } else if (req.storage === 'mongodb') {
            const updated = await matchesCollection.findOneAndUpdate(
                { id: matchId, slots: { $gt: 0 }, 'registrations.userId': { $ne: userId } },
                { $inc: { slots: -1 }, $push: { registrations: { id, userId, created_at: new Date().toISOString() } } },
                { returnDocument: 'after' }
            )
            if (!updated) return res.status(409).json({ error: 'Ya estás inscrito o el partido quedó sin cupos.' })
            slots = updated.slots
        } else {
            localRegistrations.push({ id, matchId, userId })
            match.slots = slots
        }

        await saveLog(req.user.email, 'INSCRIPCION', `Se inscribió en ${match.sport} en ${match.location}`, req.storage)
        return res.status(201).json({ ok: true, matchId, slots })
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ error: 'Usuario no encontrado.' })
        }
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya estás inscrito en este partido.' })
        }
        return res.status(500).json({ error: 'Error al inscribirse en el partido.' })
    } finally {
        if (connection) {
            if (!committed) await connection.rollback().catch(() => {})
            connection.release()
        }
    }
}

export async function leaveMatch(req, res) {
    let connection
    let committed = false

    try {
        const { matchId } = req.params
        const { userId } = req.query
        if (!userId) {
            return res.status(400).json({ error: 'Faltan datos de la inscripción.' })
        }
        if (userId !== req.user.id) {
            return res.status(403).json({ error: 'Solo puedes cancelar tus inscripciones.' })
        }

        let match

        if (req.storage === 'mysql') {
            connection = await pool.getConnection()
            await connection.beginTransaction()
            const [rows] = await connection.query('SELECT * FROM matches WHERE id = ? FOR UPDATE', [matchId])
            match = rows[0]
        } else if (req.storage === 'mongodb') {
            match = await matchesCollection.findOne({ id: matchId })
        } else {
            match = localMatches.find((m) => m.id === matchId)
        }

        if (!match) {
            return res.status(404).json({ error: 'Partido no encontrado.' })
        }

        let slots = Number(match.slots) + 1

        if (connection) {
            const [result] = await connection.query('DELETE FROM registrations WHERE match_id = ? AND user_id = ?', [matchId, userId])
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'No estás inscrito en este partido.' })
            }
            await connection.query('UPDATE matches SET slots = slots + 1 WHERE id = ?', [matchId])
            await connection.commit()
            committed = true
        } else if (req.storage === 'mongodb') {
            const updated = await matchesCollection.findOneAndUpdate(
                { id: matchId, 'registrations.userId': userId },
                { $inc: { slots: 1 }, $pull: { registrations: { userId } } },
                { returnDocument: 'after' }
            )
            if (!updated) return res.status(404).json({ error: 'No estás inscrito en este partido.' })
            slots = updated.slots
        } else {
            const index = localRegistrations.findIndex((r) => r.matchId === matchId && r.userId === userId)
            if (index === -1) {
                return res.status(404).json({ error: 'No estás inscrito en este partido.' })
            }
            localRegistrations.splice(index, 1)
            match.slots = slots
        }

        await saveLog(req.user.email, 'BAJA', `Canceló inscripción en ${match.sport} en ${match.location}`, req.storage)
        return res.json({ ok: true, matchId, slots })
    } catch {
        return res.status(500).json({ error: 'Error al cancelar la inscripción.' })
    } finally {
        if (connection) {
            if (!committed) await connection.rollback().catch(() => {})
            connection.release()
        }
    }
}
