import { Router } from 'express'
import {
    obtenerPartidos,
    obtenerEstadisticasPartidos,
    crearPartido,
    actualizarPartido,
    eliminarPartido
} from '../controllers/controladorPartidos.js'
import { verificarUsuario, verificarAdministrador } from '../middleware/autenticacion.js'

const enrutador = Router()

enrutador.get('/matches/stats', obtenerEstadisticasPartidos)
enrutador.get('/matches', obtenerPartidos)
enrutador.post('/matches', verificarUsuario, verificarAdministrador, crearPartido)
enrutador.put('/matches/:id', verificarUsuario, verificarAdministrador, actualizarPartido)
enrutador.delete('/matches/:id', verificarUsuario, verificarAdministrador, eliminarPartido)

export default enrutador
