import mysql from 'mysql2/promise'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

export const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'faltauno',
    password: process.env.MYSQL_PASSWORD || 'faltauno123',
    database: process.env.MYSQL_DATABASE || 'faltauno_db',
    waitForConnections: true,
    connectionLimit: 10
})

const mongoClient = new MongoClient(
    process.env.MONGO_URI || 'mongodb://localhost:27017'
)

export let logsCollection = null
export let mysqlAvailable = false

export const localUsers = [
    { id: 'user-1', name: 'Kevin', email: 'kevin@faltauno.cl', password: '123456' },
    { id: 'user-2', name: 'Matías Rojas', email: 'matias@faltauno.cl', password: '123456' },
    { id: 'user-3', name: 'Camila Soto', email: 'camila@faltauno.cl', password: '123456' },
    { id: 'user-4', name: 'Diego Morales', email: 'diego@faltauno.cl', password: '123456' }
]

export const localMatches = [
    { id: 'match-1', sport: 'Fútbol', location: 'Complejo Unión La Calera', date: '2026-11-07', time: '20:00', level: 'Amateur', slots: 1, latitude: -32.789, longitude: -71.213, organizerId: 'user-1' },
    { id: 'match-2', sport: 'Fútbol', location: 'Canchas San Luis de Quillota', date: '2026-11-08', time: '18:30', level: 'Intermedio', slots: 2, latitude: -32.883, longitude: -71.248, organizerId: 'user-2' },
    { id: 'match-3', sport: 'Pádel', location: 'Pádel Club Centro', date: '2026-11-09', time: '19:00', level: 'Amateur', slots: 1, latitude: -32.883, longitude: -71.248, organizerId: 'user-3' },
    { id: 'match-4', sport: 'Básquetbol', location: 'Gimnasio Municipal', date: '2026-11-10', time: '17:30', level: 'Amateur', slots: 1, latitude: -32.883, longitude: -71.248, organizerId: 'user-4' },
    { id: 'match-5', sport: 'Fútbol', location: 'Centro Deportivo Marcelo Salas', date: '2026-11-11', time: '12:00', level: 'Amateur', slots: 3, latitude: -32.883, longitude: -71.248, organizerId: 'user-1' }
]

export const localLogs = []

export async function connectDatabases() {
    try {
        await pool.query('SELECT 1')
        mysqlAvailable = true
        console.log('Conectado a MySQL')
    } catch {
        console.log('MySQL no detectado, usando lista en memoria')
    }

    try {
        await mongoClient.connect()
        const db = mongoClient.db(process.env.MONGO_DB_NAME || 'faltauno_nosql')
        logsCollection = db.collection('logs')
        console.log('Conectado a MongoDB')
    } catch {
        console.log('MongoDB no detectado, usando lista en memoria')
    }
}

export async function saveLog(userEmail, action, detail) {
    const newLog = {
        userEmail,
        action,
        detail,
        date: new Date().toISOString()
    }

    if (logsCollection) {
        await logsCollection.insertOne(newLog)
    } else {
        localLogs.unshift(newLog)
    }
}
