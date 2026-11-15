import crypto from 'node:crypto'
import { crearSesion } from '../middleware/autenticacion.js'
import {
    conexionesMySQL,
    mysqlDisponible,
    coleccionActividad,
    usuariosEnMemoria,
    actividadEnMemoria,
    guardarActividad
} from '../baseDeDatos.js'

export async function iniciarSesion(solicitud, salida) {
    try {
        const { email: correo, password: contrasena } = solicitud.body

        if (!correo || !contrasena) {
            return salida.status(400).json({ error: 'Faltan datos por completar.' })
        }

        const correoNormalizado = correo.trim().toLowerCase()
        let usuario = null

        if (mysqlDisponible) {
            const [filas] = await conexionesMySQL.query(
                'SELECT id, name, email, password FROM users WHERE LOWER(email) = ?',
                [correoNormalizado]
            )
            usuario = filas[0]
        } else {
            usuario = usuariosEnMemoria.find((cuenta) => cuenta.email.toLowerCase() === correoNormalizado)
        }

        if (!usuario) {
            return salida.status(404).json({
                error: 'Este correo no está registrado. Crea tu cuenta primero.'
            })
        }

        if (usuario.password !== contrasena) {
            return salida.status(401).json({
                error: 'La contraseña no coincide con esta cuenta.'
            })
        }

        await guardarActividad(usuario.email, 'LOGIN', `Inicio de sesión de ${usuario.name}`, solicitud.storage)

        return salida.json({
            user: crearSesion(usuario)
        })
    } catch {
        return salida.status(500).json({ error: 'Error en el servidor.' })
    }
}

export async function registrarUsuario(solicitud, salida) {
    try {
        const { name: nombre, email: correo, password: contrasena } = solicitud.body

        if (!nombre || !correo || !contrasena || contrasena.length < 4) {
            return salida.status(400).json({ error: 'Datos inválidos o incompletos.' })
        }

        const correoNormalizado = correo.trim().toLowerCase()
        const nombreNormalizado = nombre.trim()
        const nuevoIdentificador = crypto.randomUUID()

        if (mysqlDisponible) {
            const [comprobacion] = await conexionesMySQL.query(
                'SELECT id FROM users WHERE LOWER(email) = ?',
                [correoNormalizado]
            )
            if (comprobacion.length > 0) {
                return salida.status(409).json({
                    error: 'Ese correo ya tiene cuenta. Inicia sesión.'
                })
            }

            await conexionesMySQL.query(
                'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
                [nuevoIdentificador, nombreNormalizado, correoNormalizado, contrasena]
            )
        } else {
            const existe = usuariosEnMemoria.some((cuenta) => cuenta.email.toLowerCase() === correoNormalizado)
            if (existe) {
                return salida.status(409).json({
                    error: 'Ese correo ya tiene cuenta. Inicia sesión.'
                })
            }
            usuariosEnMemoria.push({ id: nuevoIdentificador, name: nombreNormalizado, email: correoNormalizado, password: contrasena, role: 'jugador' })
        }

        await guardarActividad(correoNormalizado, 'REGISTRO', `Cuenta creada para ${nombreNormalizado}`, solicitud.storage)

        return salida.status(201).json({
            user: crearSesion({ id: nuevoIdentificador, name: nombreNormalizado, email: correoNormalizado })
        })
    } catch {
        return salida.status(500).json({ error: 'Error al registrar usuario.' })
    }
}

export async function obtenerActividad(solicitud, salida) {
    try {
        const filtro = { storage: solicitud.storage }
        if (solicitud.user.role !== 'admin') filtro.userEmail = solicitud.user.email
        let registrosActividad = []
        if (coleccionActividad) {
            registrosActividad = await coleccionActividad
                .find(filtro)
                .sort({ date: -1 })
                .limit(20)
                .toArray()
                .catch(() => [])
        }
        const respaldo = actividadEnMemoria.filter((registroActividad) => registroActividad.storage === solicitud.storage &&
            (solicitud.user.role === 'admin' || registroActividad.userEmail === solicitud.user.email))
        return salida.json([...registrosActividad, ...respaldo].sort((primero, segundo) => segundo.date.localeCompare(primero.date)).slice(0, 20))
    } catch {
        return salida.status(500).json({ error: 'Error al obtener historial.' })
    }
}

export async function crearRegistroActividad(solicitud, salida) {
    try {
        const { action: accion, detail: detalle } = solicitud.body
        if (!accion || !detalle) {
            return salida.status(400).json({ error: 'Faltan campos del registro.' })
        }
        await guardarActividad(solicitud.user.email, accion, detalle, solicitud.storage)
        return salida.status(201).json({ ok: true })
    } catch {
        return salida.status(500).json({ error: 'Error al guardar registro.' })
    }
}
