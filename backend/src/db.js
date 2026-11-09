import mysql from 'mysql2/promise'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import { matchDate, validMatchDate } from '../../shared/dates.js'
import initialMatches from '../../shared/initialMatches.js'

dotenv.config()

export const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'faltauno_db',
    waitForConnections: true,
    connectionLimit: 10
})

const mongoClient = new MongoClient(
    process.env.MONGO_URI || 'mongodb://localhost:27017',
    { serverSelectionTimeoutMS: 3000 }
)

export let logsCollection = null
export let matchesCollection = null
export let mysqlAvailable = false

export const localUsers = [
    { id: 'user-1', name: 'Kevin', email: 'kevin@faltauno.cl', password: '123456', role: 'admin' },
    { id: 'user-2', name: 'Matías Rojas', email: 'matias@faltauno.cl', password: '123456', role: 'jugador' },
    { id: 'user-3', name: 'Camila Soto', email: 'camila@faltauno.cl', password: '123456', role: 'jugador' },
    { id: 'user-4', name: 'Diego Morales', email: 'diego@faltauno.cl', password: '123456', role: 'jugador' }
]

export const localMatches = initialMatches.map((match) => ({ ...match }))

export const localLogs = []
export const localRegistrations = []

export async function connectDatabases() {
    try {
        await pool.query('SELECT 1')
        await pool.query("UPDATE users SET role = CASE WHEN LOWER(email) = 'kevin@faltauno.cl' THEN 'admin' ELSE 'jugador' END")
        mysqlAvailable = true
        console.log('Conectado a MySQL')
    } catch {
        console.log('MySQL no detectado, usando lista en memoria')
    }

    try {
        await mongoClient.connect()
        const db = mongoClient.db(process.env.MONGO_DB_NAME || 'faltauno_nosql')
        logsCollection = db.collection('logs')
        await logsCollection.updateMany({ storage: { $exists: false } }, { $set: { storage: 'mysql' } })
        const exists = await db.listCollections({ name: 'matches' }).hasNext()
        const matches = db.collection('matches')
        await matches.createIndex({ id: 1 }, { unique: true })
        if (!exists) {
            await matches.insertMany(localMatches.slice(0, 3).map((match, index) => ({
                ...match, id: `mongo-match-${index + 1}`, registrations: []
            })))
        }
        matchesCollection = matches
        console.log('Conectado a MongoDB')
    } catch {
        console.log('MongoDB no detectado, usando lista en memoria')
    }

    if (mysqlAvailable) {
        const [matches] = await pool.query('SELECT id, date FROM matches ORDER BY id')
        for (const [index, match] of matches.entries()) {
            if (!validMatchDate(match.date)) {
                const date = matchDate(index % 14 + 1)
                await pool.query('UPDATE matches SET date = ? WHERE id = ?', [date, match.id])
                await saveLog('Sistema', 'AJUSTAR_FECHA', `Partido ${match.id}: fecha ajustada a ${date}`, 'mysql')
            }
        }
    }
    if (matchesCollection) {
        const matches = await matchesCollection.find({}, { projection: { id: 1, date: 1 } }).toArray()
        for (const [index, match] of matches.entries()) {
            if (!validMatchDate(match.date)) {
                const date = matchDate(index % 14 + 1)
                await matchesCollection.updateOne({ id: match.id }, { $set: { date } })
                await saveLog('Sistema', 'AJUSTAR_FECHA', `Partido ${match.id}: fecha ajustada a ${date}`, 'mongodb')
            }
        }
    }
}

export async function saveLog(userEmail, action, detail, storage = 'memory') {
    const newLog = {
        userEmail,
        action,
        detail,
        storage,
        date: new Date().toISOString()
    }

    if (logsCollection) {
        try {
            await logsCollection.insertOne(newLog)
            return
        } catch {
            // El historial sigue disponible en memoria si MongoDB falla.
        }
    }
    localLogs.unshift(newLog)
}
