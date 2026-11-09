import { mysqlAvailable, matchesCollection } from '../db.js'

export function selectStorage(req, res, next) {
    const storage = req.query.storage || (mysqlAvailable ? 'mysql' : 'memory')
    if (!['memory', 'mysql', 'mongodb'].includes(storage)) {
        return res.status(400).json({ error: 'Almacenamiento inválido.' })
    }
    req.storage = storage
    if (req.path.startsWith('/auth/') || req.path === '/logs') return next()
    if (storage === 'mysql' && !mysqlAvailable) {
        return res.status(503).json({ error: 'MySQL no está disponible. Selecciona otro almacenamiento.' })
    }
    if (storage === 'mongodb' && !matchesCollection) {
        return res.status(503).json({ error: 'MongoDB no está disponible. Selecciona otro almacenamiento.' })
    }
    next()
}
