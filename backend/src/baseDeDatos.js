import mysql from 'mysql2/promise'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import { fechaPartido, esFechaPartidoValida } from '../../shared/fechas.js'
import partidosIniciales from '../../shared/partidosIniciales.js'

dotenv.config()

export const conexionesMySQL = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'faltauno_db',
    waitForConnections: true,
    connectionLimit: 10
})

const clienteMongo = new MongoClient(
    process.env.MONGO_URI || 'mongodb://localhost:27017',
    { serverSelectionTimeoutMS: 3000 }
)

export let coleccionActividad = null
export let coleccionPartidos = null
export let mysqlDisponible = false

export const usuariosEnMemoria = [
    { id: 'user-1', name: 'Kevin', email: 'kevin@faltauno.cl', password: '123456', role: 'admin' },
    { id: 'user-2', name: 'Matías Rojas', email: 'matias@faltauno.cl', password: '123456', role: 'jugador' },
    { id: 'user-3', name: 'Camila Soto', email: 'camila@faltauno.cl', password: '123456', role: 'jugador' },
    { id: 'user-4', name: 'Diego Morales', email: 'diego@faltauno.cl', password: '123456', role: 'jugador' }
]

export const partidosEnMemoria = partidosIniciales.map((partido) => ({ ...partido }))

export const actividadEnMemoria = []
export const inscripcionesEnMemoria = []

export async function conectarBasesDeDatos() {
    try {
        await conexionesMySQL.query('SELECT 1')
        await conexionesMySQL.query("UPDATE users SET role = CASE WHEN LOWER(email) = 'kevin@faltauno.cl' THEN 'admin' ELSE 'jugador' END")
        mysqlDisponible = true
        console.log('Conectado a MySQL')
    } catch {
        console.log('MySQL no detectado, usando lista en memoria')
    }

    try {
        await clienteMongo.connect()
        const baseDeDatos = clienteMongo.db(process.env.MONGO_DB_NAME || 'faltauno_nosql')
        coleccionActividad = baseDeDatos.collection('logs')
        await coleccionActividad.updateMany({ storage: { $exists: false } }, { $set: { storage: 'mysql' } })
        const existe = await baseDeDatos.listCollections({ name: 'matches' }).hasNext()
        const partidos = baseDeDatos.collection('matches')
        await partidos.createIndex({ id: 1 }, { unique: true })
        if (!existe) {
            await partidos.insertMany(partidosEnMemoria.slice(0, 3).map((partido, indice) => ({
                ...partido, id: `mongo-match-${indice + 1}`, registrations: []
            })))
        }
        coleccionPartidos = partidos
        console.log('Conectado a MongoDB')
    } catch {
        console.log('MongoDB no detectado, usando lista en memoria')
    }

    if (mysqlDisponible) {
        const [partidos] = await conexionesMySQL.query('SELECT id, date FROM matches ORDER BY id')
        for (const [indice, partido] of partidos.entries()) {
            if (!esFechaPartidoValida(partido.date)) {
                const fecha = fechaPartido(indice % 14 + 1)
                await conexionesMySQL.query('UPDATE matches SET date = ? WHERE id = ?', [fecha, partido.id])
                await guardarActividad('Sistema', 'AJUSTAR_FECHA', `Partido ${partido.id}: fecha ajustada a ${fecha}`, 'mysql')
            }
        }
    }
    if (coleccionPartidos) {
        const partidos = await coleccionPartidos.find({}, { projection: { id: 1, date: 1 } }).toArray()
        for (const [indice, partido] of partidos.entries()) {
            if (!esFechaPartidoValida(partido.date)) {
                const fecha = fechaPartido(indice % 14 + 1)
                await coleccionPartidos.updateOne({ id: partido.id }, { $set: { date: fecha } })
                await guardarActividad('Sistema', 'AJUSTAR_FECHA', `Partido ${partido.id}: fecha ajustada a ${fecha}`, 'mongodb')
            }
        }
    }
}

export async function guardarActividad(correoUsuario, accion, detalle, almacenamiento = 'memory') {
    const nuevoRegistroActividad = {
        userEmail: correoUsuario,
        action: accion,
        detail: detalle,
        storage: almacenamiento,
        date: new Date().toISOString()
    }

    if (coleccionActividad) {
        try {
            await coleccionActividad.insertOne(nuevoRegistroActividad)
            return
        } catch {
            // El historial sigue disponible en memoria si MongoDB falla.
        }
    }
    actividadEnMemoria.unshift(nuevoRegistroActividad)
}
