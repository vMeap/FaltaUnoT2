import crypto from 'node:crypto'
import { createSession } from '../middleware/auth.js'
import {
    pool,
    mysqlAvailable,
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

        if (mysqlAvailable) {
            const [rows] = await pool.query(
                'SELECT id, name, email, password FROM users WHERE LOWER(email) = ?',
                [cleanEmail]
            )
            user = rows[0]
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

        await saveLog(user.email, 'LOGIN', `Inicio de sesión de ${user.name}`, req.storage)

        return res.json({
            user: createSession(user)
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

        if (mysqlAvailable) {
            const [check] = await pool.query(
                'SELECT id FROM users WHERE LOWER(email) = ?',
                [cleanEmail]
            )
            if (check.length > 0) {
                return res.status(409).json({
                    error: 'Ese correo ya tiene cuenta. Inicia sesión.'
                })
            }

            await pool.query(
                'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
                [newId, cleanName, cleanEmail, password]
            )
        } else {
            const exists = localUsers.some((u) => u.email.toLowerCase() === cleanEmail)
            if (exists) {
                return res.status(409).json({
                    error: 'Ese correo ya tiene cuenta. Inicia sesión.'
                })
            }
            localUsers.push({ id: newId, name: cleanName, email: cleanEmail, password, role: 'jugador' })
        }

        await saveLog(cleanEmail, 'REGISTRO', `Cuenta creada para ${cleanName}`, req.storage)

        return res.status(201).json({
            user: createSession({ id: newId, name: cleanName, email: cleanEmail })
        })
    } catch {
        return res.status(500).json({ error: 'Error al registrar usuario.' })
    }
}

export async function getLogs(req, res) {
    try {
        const filter = { storage: req.storage }
        if (req.user.role !== 'admin') filter.userEmail = req.user.email
        let logs = []
        if (logsCollection) {
            logs = await logsCollection
                .find(filter)
                .sort({ date: -1 })
                .limit(20)
                .toArray()
                .catch(() => [])
        }
        const fallback = localLogs.filter((log) => log.storage === req.storage &&
            (req.user.role === 'admin' || log.userEmail === req.user.email))
        return res.json([...logs, ...fallback].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20))
    } catch {
        return res.status(500).json({ error: 'Error al obtener historial.' })
    }
}

export async function createLog(req, res) {
    try {
        const { action, detail } = req.body
        if (!action || !detail) {
            return res.status(400).json({ error: 'Faltan campos del registro.' })
        }
        await saveLog(req.user.email, action, detail, req.storage)
        return res.status(201).json({ ok: true })
    } catch {
        return res.status(500).json({ error: 'Error al guardar registro.' })
    }
}
