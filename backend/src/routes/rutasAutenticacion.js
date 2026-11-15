import { Router } from 'express'
import {
    iniciarSesion,
    registrarUsuario,
    obtenerActividad,
    crearRegistroActividad
} from '../controllers/controladorAutenticacion.js'
import { verificarUsuario, cerrarSesion } from '../middleware/autenticacion.js'

const enrutador = Router()

enrutador.post('/auth/login', iniciarSesion)
enrutador.post('/auth/register', registrarUsuario)
enrutador.post('/auth/logout', verificarUsuario, cerrarSesion)
enrutador.get('/logs', verificarUsuario, obtenerActividad)
enrutador.post('/logs', verificarUsuario, crearRegistroActividad)

export default enrutador
