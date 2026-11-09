import crypto from 'node:crypto'

const sessions = new Map()

export function createSession(user) {
    const token = crypto.randomUUID()
    const sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.email.toLowerCase() === 'kevin@faltauno.cl' ? 'admin' : 'jugador'
    }
    sessions.set(token, { user: sessionUser, expires: Date.now() + 24 * 60 * 60 * 1000 })
    return { ...sessionUser, token }
}

export function requireUser(req, res, next) {
    const token = req.headers.authorization?.replace(/^Bearer /, '')
    const session = sessions.get(token)
    if (!session || session.expires < Date.now()) {
        sessions.delete(token)
        return res.status(401).json({ error: 'Inicia sesión nuevamente.' })
    }
    req.user = session.user
    next()
}

export function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Solo Kevin puede administrar los partidos.' })
    }
    next()
}

export function logout(req, res) {
    sessions.delete(req.headers.authorization?.replace(/^Bearer /, ''))
    return res.json({ ok: true })
}
