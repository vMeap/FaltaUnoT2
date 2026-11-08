import crypto from 'node:crypto'
import {
    pool,
    pgAvailable,
    logsCollection,
    localUsers,
    localLogs,
    saveLog
} from '../db.js'

export async function login(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Faltan datos por completar.' })
        }

        const cleanEmail = email.trim().toLowerCase()
        let user = null

        if (pgAvailable) {
            const result = await pool.query(
                'SELECT id, name, email, password FROM users WHERE LOWER(email) = $1',
                [cleanEmail]
            )
            user = result.rows[0]
        } else {
            user = localUsers.find((u) => u.email.toLowerCase() === cleanEmail)
        }

        if (!user) {
            return res.status(404).json({
                error: 'Este correo no está registrado. Crea tu cuenta primero.'
            })
        }

        if (user.password !== password) {
            return res.status(401).json({
                error: 'La contraseña no coincide con esta cuenta.'
            })
        }

        await saveLog(user.email, 'LOGIN', `Inicio de sesión de ${user.name}`)

        return res.json({
            user: { id: user.id, name: user.name, email: user.email }
        })
    } catch {
        return res.status(500).json({ error: 'Error en el servidor.' })
    }
}

export async function register(req, res) {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password || password.length < 4) {
            return res.status(400).json({ error: 'Datos inválidos o incompletos.' })
        }

        const cleanEmail = email.trim().toLowerCase()
        const cleanName = name.trim()
        const newId = crypto.randomUUID()

        if (pgAvailable) {
            const check = await pool.query(
                'SELECT id FROM users WHERE LOWER(email) = $1',
                [cleanEmail]
            )
            if (check.rows.length > 0) {
                return res.status(409).json({
                    error: 'Ese correo ya tiene cuenta. Inicia sesión.'
                })
            }

            await pool.query(
                'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)',
                [newId, cleanName, cleanEmail, password]
            )
        } else {
            const exists = localUsers.some((u) => u.email.toLowerCase() === cleanEmail)
            if (exists) {
                return res.status(409).json({
                    error: 'Ese correo ya tiene cuenta. Inicia sesión.'
                })
            }
            localUsers.push({ id: newId, name: cleanName, email: cleanEmail, password })
        }

        await saveLog(cleanEmail, 'REGISTRO', `Cuenta creada para ${cleanName}`)

        return res.status(201).json({
            user: { id: newId, name: cleanName, email: cleanEmail }
        })
    } catch {
        return res.status(500).json({ error: 'Error al registrar usuario.' })
    }
}

export async function getLogs(_req, res) {
    try {
        if (logsCollection) {
            const logs = await logsCollection
                .find()
                .sort({ date: -1 })
                .limit(20)
                .toArray()
            return res.json(logs)
        }
        return res.json(localLogs.slice(0, 20))
    } catch {
        return res.status(500).json({ error: 'Error al obtener historial.' })
    }
}

export async function createLog(req, res) {
    try {
        const { userEmail, action, detail } = req.body
        if (!action || !detail) {
            return res.status(400).json({ error: 'Faltan campos del registro.' })
        }
        await saveLog(userEmail || 'anónimo', action, detail)
        return res.status(201).json({ ok: true })
    } catch {
        return res.status(500).json({ error: 'Error al guardar registro.' })
    }
}
